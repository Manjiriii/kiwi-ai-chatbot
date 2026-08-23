"""
Core AI orchestrator for KIWI 🦜 AI Chatbot.
Handles Hugging Face InferenceClient, intent routing (normal / live search / URL reader),
prompt construction, and Kiwi parrot persona.
"""

import os
import sys
import re
import logging
from typing import List, Dict, Any, Optional

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from dotenv import load_dotenv

from huggingface_hub import InferenceClient

from web_search import search_duckduckgo
from website_reader import extract_urls, fetch_website_content, get_domain

# Load environment variables
load_dotenv()

logger = logging.getLogger("kiwi.chatbot")

KIWI_SYSTEM_PROMPT = """You are Kiwi 🦜, a smart, friendly, and curious AI parrot companion!
Your tagline is: "Your curious AI companion for answers, research and the web."

Personality traits:
- Curious and eager to learn and explore new ideas.
- Intelligent, accurate, insightful, and professional.
- Friendly, warm, approachable, and slightly playful (with occasional tasteful bird/parrot charm when appropriate, but never childish).
- IMPORTANT: You are an intelligent parrot mascot. You are NOT a fruit.

Capabilities:
- You have real-time access to the live web via live search.
- You can read and extract content from websites and URLs provided by users.
- You provide clear, well-structured, formatted Markdown answers (with headings, bold text, bullet points, and code blocks when helpful).

When provided with [Live Search Results] or [Website Data Extracted], synthesize the information accurately, cite key details, and give the user a helpful, comprehensive response.
"""

# Keywords that suggest real-time / live information is needed
SEARCH_KEYWORDS = [
    "latest", "today", "now", "current", "news", "recent", "update", "updates",
    "price of", "stock price", "who won", "score", "weather", "release date",
    "search for", "look up", "browse", "2024", "2025", "2026"
]


class KiwiChatbot:
    """
    Orchestrates Kiwi AI assistant queries, routing between direct LLM chat,
    web search augmentation, and URL reading.
    """

    def __init__(self, model: Optional[str] = None, token: Optional[str] = None):
        load_dotenv(override=True)
        self.model = model or os.getenv("HF_MODEL", "meta-llama/Meta-Llama-3-70B-Instruct")
        self.token = token or os.getenv("HF_TOKEN") or None
        self._init_client()

    def get_token(self) -> Optional[str]:
        load_dotenv(override=True)
        return self.token or os.getenv("HF_TOKEN") or None

    def _init_client(self):
        """Initializes or reinitializes the Hugging Face InferenceClient."""
        try:
            token = self.get_token()
            self.client = InferenceClient(
                model=self.model,
                token=token if token and token.strip() else None
            )
            logger.info(f"Initialized InferenceClient with model: {self.model}")
        except Exception as e:
            logger.error(f"Failed to initialize InferenceClient: {e}")
            self.client = None


    def update_token(self, token: Optional[str]):
        """Updates HF token and re-initializes client."""
        self.token = token
        self._init_client()

    def should_search_web(self, query: str) -> bool:
        """Determines if query requires a live web search."""
        lower = query.lower()
        if any(keyword in lower for keyword in SEARCH_KEYWORDS):
            return True
        # Explicit search commands
        if lower.startswith("search:") or lower.startswith("search ") or lower.startswith("google "):
            return True
        return False

    def process_chat(
        self,
        message: str,
        conversation_id: str = "default",
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Main processing function for incoming chat requests.
        
        Args:
            message: User's prompt text
            conversation_id: Conversation session identifier
            history: Optional list of past messages [{'role': 'user'|'assistant', 'content': '...'}]
            
        Returns:
            Dict with response, conversation_id, source_type, sources, metadata
        """
        if not message or not message.strip():
            return {
                "response": "Squawk! It looks like your message was empty. Ask Kiwi anything!",
                "conversation_id": conversation_id,
                "source_type": "normal",
                "sources": [],
                "search_query": None,
                "website_url": None
            }

        user_prompt = message.strip()
        source_type = "normal"
        sources: List[Dict[str, Any]] = []
        search_query: Optional[str] = None
        website_url: Optional[str] = None

        # Build message chain for LLM
        messages = [{"role": "system", "content": KIWI_SYSTEM_PROMPT}]

        # Append past conversation history
        if history:
            for item in history:
                role = item.get("role")
                content = item.get("content")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})

        # 1. Check for URLs in the prompt (Website Reader Mode)
        detected_urls = extract_urls(user_prompt)
        if detected_urls:
            source_type = "website"
            website_url = detected_urls[0]
            logger.info(f"Detected URL: {website_url}. Fetching website content...")
            
            site_info = fetch_website_content(website_url)
            if site_info["success"]:
                sources.append({
                    "title": site_info["title"],
                    "url": site_info["url"],
                    "domain": site_info["domain"],
                    "snippet": site_info["content"][:200]
                })
                augmented_prompt = f"{user_prompt}\n\n[Website Data Extracted:\n{site_info['formatted_context']}]"
            else:
                sources.append({
                    "title": site_info["domain"],
                    "url": website_url,
                    "domain": site_info["domain"],
                    "snippet": f"Could not read website: {site_info.get('error')}"
                })
                augmented_prompt = f"{user_prompt}\n\n[Note: Could not retrieve website data from {website_url}: {site_info.get('error')}]"

            messages.append({"role": "user", "content": augmented_prompt})

        # 2. Check if live web search is needed (Web Search Mode)
        elif self.should_search_web(user_prompt):
            source_type = "web_search"
            # Clean search query if prefixed
            clean_search_query = re.sub(r'^(search:|search|look up|google)\s*', '', user_prompt, flags=re.IGNORECASE).strip()
            search_query = clean_search_query or user_prompt
            logger.info(f"Triggering web search for: '{search_query}'")

            search_res = search_duckduckgo(search_query, max_results=3)
            if search_res["success"] and search_res["results"]:
                for r in search_res["results"]:
                    sources.append({
                        "title": r.get("title", "Search Result"),
                        "url": r.get("url", ""),
                        "snippet": r.get("snippet", "")
                    })
                augmented_prompt = f"{user_prompt}\n\n[Live Search Results:\n{search_res['formatted_context']}]"
            else:
                augmented_prompt = f"{user_prompt}\n\n[Live Search Results: No live results found or search was unavailable]"

            messages.append({"role": "user", "content": augmented_prompt})

        # 3. Standard chat
        else:
            messages.append({"role": "user", "content": user_prompt})

        # Query Hugging Face InferenceClient with fallback support
        candidate_models = [
            self.model,
            "meta-llama/Llama-3.3-70B-Instruct",
            "meta-llama/Meta-Llama-3-8B-Instruct",
            "Qwen/Qwen2.5-72B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.3"
        ]
        # Remove duplicates while preserving order
        candidate_models = list(dict.fromkeys(candidate_models))

        assistant_reply = None
        last_error = None
        current_token = self.get_token()

        for mod in candidate_models:
            try:
                client = InferenceClient(
                    model=mod,
                    token=current_token if current_token and current_token.strip() else None
                )
                response_obj = client.chat_completion(
                    messages=messages,
                    max_tokens=1000,
                    temperature=0.7,
                )
                assistant_reply = response_obj.choices[0].message.content
                if assistant_reply:
                    # Update active model
                    self.model = mod
                    break
            except Exception as e:
                last_error = e
                err_str = str(e)
                logger.warning(f"Inference error with model {mod}: {err_str}")
                # If it's a token authorization error, stop trying other models
                if "Authorization header is correct" in err_str or "401" in err_str:
                    break
                continue

        if assistant_reply is None:
            err_str = str(last_error) if last_error else "Unknown error"
            if "Authorization header is correct" in err_str or "token" in err_str.lower() or "401" in err_str:
                assistant_reply = (
                    "🦜 **Squawk!** It looks like a Hugging Face API Token is needed or has expired.\n\n"
                    "Please verify your `HF_TOKEN` in the `backend/.env` file to unlock "
                    f"the full power of **{self.model}**!\n\n"
                    f"*Raw Error: {err_str}*"
                )
            elif "loading" in err_str.lower() or "503" in err_str:
                assistant_reply = (
                    "🦜 **Kiwi is warming up!** The AI model is currently loading on Hugging Face servers. "
                    "Please try your question again in 20-30 seconds."
                )
            else:
                assistant_reply = (
                    f"🦜 **Kiwi here!** I encountered a hiccup connecting to my AI brain ({self.model}).\n\n"
                    f"**Details:** `{err_str}`\n\n"
                    "Please check your internet connection and verify your `HF_TOKEN` in `backend/.env`."
                )


        return {
            "response": assistant_reply,
            "conversation_id": conversation_id,
            "source_type": source_type,
            "sources": sources,
            "search_query": search_query,
            "website_url": website_url
        }


# Global instance
chatbot_instance = KiwiChatbot()
