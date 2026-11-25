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

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

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

    def _query_groq(self, messages: List[Dict[str, str]], api_key: str) -> Optional[str]:
        """Queries Groq free API (supports LLaMA 3.3 70B & LLaMA 3 70B for free)."""
        import requests
        candidate_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192"]
        for mod in candidate_models:
            try:
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key.strip()}", "Content-Type": "application/json"},
                    json={"model": mod, "messages": messages, "max_tokens": 1000, "temperature": 0.7},
                    timeout=15
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    if content:
                        self.model = f"groq/{mod}"
                        return content
                else:
                    logger.warning(f"Groq API notice ({res.status_code}): {res.text[:120]}")
            except Exception as e:
                logger.warning(f"Groq request error: {e}")
        return None

    def _query_openrouter(self, messages: List[Dict[str, str]], api_key: str) -> Optional[str]:
        """Queries OpenRouter API (free tier models)."""
        import requests
        candidate_models = [
            "meta-llama/llama-3.3-70b-instruct:free",
            "meta-llama/llama-3-8b-instruct:free",
            "google/gemini-2.0-flash-lite-preview-02-05:free"
        ]
        for mod in candidate_models:
            try:
                res = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key.strip()}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://kiwi-ai-chatbot.vercel.app",
                        "X-Title": "Kiwi AI Chatbot"
                    },
                    json={"model": mod, "messages": messages, "max_tokens": 1000, "temperature": 0.7},
                    timeout=15
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    if content:
                        self.model = f"openrouter/{mod}"
                        return content
                else:
                    logger.warning(f"OpenRouter API notice ({res.status_code}): {res.text[:120]}")
            except Exception as e:
                logger.warning(f"OpenRouter request error: {e}")
        return None

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

        assistant_reply = None

        # 1. Try Groq free provider if GROQ_API_KEY is configured
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key and groq_api_key.strip():
            logger.info("Attempting inference via Groq free API...")
            assistant_reply = self._query_groq(messages, groq_api_key)

        # 2. Try OpenRouter free provider if OPENROUTER_API_KEY is configured
        if not assistant_reply:
            openrouter_key = os.getenv("OPENROUTER_API_KEY")
            if openrouter_key and openrouter_key.strip():
                logger.info("Attempting inference via OpenRouter API...")
                assistant_reply = self._query_openrouter(messages, openrouter_key)

        # 3. Query Hugging Face InferenceClient with fallback support
        if not assistant_reply:
            candidate_models = [
                self.model,
                "meta-llama/Llama-3.3-70B-Instruct",
                "meta-llama/Meta-Llama-3-8B-Instruct",
                "Qwen/Qwen2.5-72B-Instruct",
                "mistralai/Mistral-7B-Instruct-v0.3"
            ]
            # Remove duplicates while preserving order
            candidate_models = list(dict.fromkeys(candidate_models))

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
                        self.model = mod
                        break
                except Exception as e:
                    last_error = e
                    err_str = str(e)
                    logger.warning(f"Inference error with model {mod}: {err_str}")
                    # If it's a token authorization or payment error, stop trying other models
                    if "Authorization header is correct" in err_str or "401" in err_str or "402" in err_str or "Payment Required" in err_str:
                        break
                    continue

        # 4. Handle errors and provide informative fallback
        if assistant_reply is None:
            err_str = str(last_error) if last_error else "Unknown error"
            
            # If search or website content was gathered, present it directly
            if sources and ("402" in err_str or "Payment" in err_str or "credits" in err_str.lower()):
                source_bullets = []
                for s in sources:
                    stitle = s.get("title") or "Source"
                    surl = s.get("url") or ""
                    ssnip = s.get("snippet") or ""
                    source_bullets.append(f"• **[{stitle}]({surl})**\n  {ssnip}")
                sources_formatted = "\n\n".join(source_bullets)
                assistant_reply = (
                    f"🦜 **Squawk! Here is what I discovered live from the web for you:**\n\n"
                    f"{sources_formatted}\n\n"
                    f"---\n"
                    f"*Note: Hugging Face's router returned a `402 Payment Required` credits notice for `{self.model}`. "
                    f"Kiwi successfully extracted the live facts above! To enable full LLM generation at zero cost, you can add a free `GROQ_API_KEY` (100% free LLaMA 3 70B) in your Vercel Environment Variables.*"
                )
            elif "402" in err_str or "payment" in err_str.lower() or "credits" in err_str.lower():
                assistant_reply = (
                    f"🦜 **Squawk! Kiwi here!**\n\n"
                    f"Hugging Face's serverless router returned `402 Payment Required` for **{self.model}** "
                    f"(Hugging Face now requires pre-paid credits for external providers).\n\n"
                    f"**To unlock AI responses at 100% zero cost:**\n"
                    f"1. **Option 1 (Free Groq Key - Recommended):** Get a free API key at [console.groq.com](https://console.groq.com) and add `GROQ_API_KEY=your_key` in your **Vercel Project Settings → Environment Variables**. Groq hosts LLaMA 3 70B with ultra-fast speed for free!\n"
                    f"2. **Option 2 (Free OpenRouter Key):** Get a key at [openrouter.ai](https://openrouter.ai) and add `OPENROUTER_API_KEY=your_key`.\n"
                    f"3. **Option 3 (Hugging Face Credits):** Add pre-paid credits at [huggingface.co/settings/billing](https://huggingface.co/settings/billing) if you prefer using Hugging Face."
                )
            elif "Authorization header is correct" in err_str or "token" in err_str.lower() or "401" in err_str:
                assistant_reply = (
                    "🦜 **Squawk!** It looks like a Hugging Face API Token is needed or has expired.\n\n"
                    "Please verify your `HF_TOKEN` in the `backend/.env` file or in your Vercel Environment Variables to unlock "
                    f"the power of **{self.model}**!\n\n"
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
