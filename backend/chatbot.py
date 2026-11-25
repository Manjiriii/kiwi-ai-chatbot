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
        self.model = model or os.getenv("OPENROUTER_MODEL") or os.getenv("HF_MODEL", "meta-llama/Meta-Llama-3-70B-Instruct")
        self.token = token or os.getenv("HF_TOKEN") or None
        self.last_used_provider: Optional[str] = None
        self.last_used_model: Optional[str] = None
        self._init_client()

    def get_token(self) -> Optional[str]:
        load_dotenv(override=True)
        return self.token or os.getenv("HF_TOKEN") or None

    def _init_client(self):
        """Initializes or reinitializes the Hugging Face InferenceClient."""
        try:
            token = self.get_token()
            self.client = InferenceClient(
                model=os.getenv("HF_MODEL", "meta-llama/Meta-Llama-3-70B-Instruct"),
                token=token if token and token.strip() else None
            )
            logger.info("Initialized InferenceClient for Hugging Face fallback")
        except Exception as e:
            logger.error(f"Failed to initialize InferenceClient: {e}")
            self.client = None

    def update_token(self, token: Optional[str]):
        """Updates HF token and re-initializes client."""
        self.token = token
        self._init_client()

    def _query_openrouter(self, messages: List[Dict[str, str]], api_key: str) -> Optional[str]:
        """Queries OpenRouter API (https://openrouter.ai/api/v1/chat/completions) with openrouter/free."""
        import requests
        api_base = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
        endpoint = f"{api_base}/chat/completions"

        configured_model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
        candidate_models = [
            configured_model,
            "openrouter/free",
            "google/gemma-4-26b-a4b-it:free",
            "nvidia/nemotron-3.5-lightning:free",
            "baidu/ernie-5.5-flash-preview:free",
            "meta-llama/llama-3.3-70b-instruct:free"
        ]
        # Remove duplicates while preserving order
        candidate_models = list(dict.fromkeys(candidate_models))

        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://kiwi-ai-chatbot.vercel.app",
            "X-Title": "Kiwi - Your Curious AI Companion"
        }

        for mod in candidate_models:
            try:
                res = requests.post(
                    endpoint,
                    headers=headers,
                    json={
                        "model": mod,
                        "messages": messages,
                        "max_tokens": 1500,
                        "temperature": 0.7
                    },
                    timeout=20
                )
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0] and choices[0]["message"].get("content"):
                        content = choices[0]["message"]["content"]
                        self.last_used_provider = "openrouter"
                        self.last_used_model = mod
                        self.model = mod
                        return content
                else:
                    logger.warning(f"OpenRouter notice ({res.status_code}) for model {mod}: {res.text[:120]}")
            except Exception as e:
                logger.warning(f"OpenRouter request error for model {mod}: {e}")
        return None

    def _formulate_search_query(self, user_prompt: str) -> str:
        """Formulates a targeted, high-precision search query from the user's prompt."""
        query = user_prompt.strip()
        # Remove search command prefixes
        query = re.sub(r'^(search:|search|look up|google|find|browse)\s*', '', query, flags=re.IGNORECASE).strip()
        # Remove conversational opening phrases
        query = re.sub(
            r'^(what are the|what is the|tell me about the|tell me about|can you find|can you tell me about|show me the|who is the|who is|what are|tell me|explain the|give me)\s*',
            '',
            query,
            flags=re.IGNORECASE
        ).strip()
        # Remove courtesy words
        query = re.sub(r'\b(please|kindly)\b', '', query, flags=re.IGNORECASE).strip()
        # Remove trailing question marks and punctuation
        query = query.rstrip('?!.').strip()

        lower = query.lower()

        # Specific topic enhancements to target deep news and avoid ambiguous results
        if "python" in lower and any(w in lower for w in ["update", "updates", "latest", "release", "new", "version"]) and "arcgis" not in lower:
            return "Python programming language latest release updates"
        if ("ai" in lower or "artificial intelligence" in lower) and any(w in lower for w in ["latest", "development", "developments", "news", "recent", "update", "updates"]):
            return "latest developments in artificial intelligence AI news"
        if "space" in lower and any(w in lower for w in ["discoveries", "discovery", "recent", "news", "explore"]):
            return "recent space discoveries astronomy science"

        return query or user_prompt.strip()

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
            search_query = self._formulate_search_query(user_prompt)
            logger.info(f"Triggering web search for: '{search_query}' (original: '{user_prompt}')")

            search_res = search_duckduckgo(search_query, max_results=4)
            if search_res["success"] and search_res["results"]:
                for r in search_res["results"]:
                    sources.append({
                        "title": r.get("title", "Search Result"),
                        "url": r.get("url", ""),
                        "snippet": r.get("snippet", ""),
                        "date": r.get("date", ""),
                        "source": r.get("source", "")
                    })
                augmented_prompt = (
                    f"User Question: {user_prompt}\n\n"
                    f"[Live Web Search Context - Recent Verified Articles]:\n"
                    f"{search_res['formatted_context']}\n\n"
                    f"[Instructions for Kiwi 🦜]:\n"
                    f"1. Synthesize a complete, well-structured, and readable summary directly addressing the user's inquiry using the retrieved articles above.\n"
                    f"2. Detail the key developments, discoveries, or news points clearly with well-structured Markdown (bullet points, bold highlights, concise explanations).\n"
                    f"3. Cite the sources accurately with clickable Markdown links (e.g., 'According to [SourceName](URL)...').\n"
                    f"4. Provide a complete, fully fleshed-out answer that does NOT cut off mid-sentence.\n"
                    f"5. Maintain Kiwi's friendly, curious parrot companion persona!"
                )
            else:
                augmented_prompt = (
                    f"User Question: {user_prompt}\n\n"
                    f"[Live Search Notice: Live web search was performed but did not yield specific recent articles for this exact query.]\n"
                    f"[Instructions for Kiwi 🦜]: Please answer the user's question informatively using your best knowledge, politely noting that live search returned no immediate recent articles."
                )

            messages.append({"role": "user", "content": augmented_prompt})

        # 3. Standard chat
        else:
            messages.append({"role": "user", "content": user_prompt})

        assistant_reply = None

        # 1. Primary AI Provider: OpenRouter (free tier with openrouter/free)
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if openrouter_key and openrouter_key.strip():
            logger.info("Attempting primary inference via OpenRouter API...")
            assistant_reply = self._query_openrouter(messages, openrouter_key)

        # 2. Secondary fallback: Hugging Face InferenceClient
        if not assistant_reply:
            candidate_models = [
                os.getenv("HF_MODEL", "meta-llama/Meta-Llama-3-70B-Instruct"),
                "meta-llama/Llama-3.3-70B-Instruct",
                "meta-llama/Meta-Llama-3-8B-Instruct",
                "Qwen/Qwen2.5-72B-Instruct",
                "mistralai/Mistral-7B-Instruct-v0.3"
            ]
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
                        self.last_used_provider = "huggingface"
                        self.last_used_model = mod
                        self.model = mod
                        break
                except Exception as e:
                    last_error = e
                    err_str = str(e)
                    logger.warning(f"Inference error with Hugging Face model {mod}: {err_str}")
                    if "Authorization header is correct" in err_str or "401" in err_str or "402" in err_str or "Payment Required" in err_str:
                        break
                    continue

        # 3. Handle errors and provide informative fallback
        if assistant_reply is None:
            err_str = str(last_error) if last_error else "Provider key not configured"
            
            # If search or website content was gathered, present it directly
            if sources:
                source_bullets = []
                for s in sources:
                    stitle = s.get("title") or "Source"
                    surl = s.get("url") or ""
                    ssnip = s.get("snippet") or ""
                    meta_parts = []
                    if s.get("source"):
                        meta_parts.append(s["source"])
                    if s.get("date"):
                        meta_parts.append(s["date"])
                    meta_str = f" *({ ' • '.join(meta_parts) })*" if meta_parts else ""
                    source_bullets.append(f"• **[{stitle}]({surl})**{meta_str}\n  {ssnip}")
                sources_formatted = "\n\n".join(source_bullets)
                assistant_reply = (
                    f"🦜 **Squawk! Here are the latest verified developments I retrieved live from the web for you:**\n\n"
                    f"{sources_formatted}\n\n"
                    f"---\n"
                    f"*Note: Live web articles and sources extracted in real-time! To enable full conversational AI synthesis, please add `OPENROUTER_API_KEY` (with free model `openrouter/free`) in your Vercel Environment Variables.*"
                )
            else:
                assistant_reply = (
                    f"🦜 **Squawk! Kiwi here!**\n\n"
                    f"I need an **OpenRouter API Key** to connect to my AI brain.\n\n"
                    f"**How to configure free AI responses for Kiwi:**\n"
                    f"1. Get a free API key at [openrouter.ai](https://openrouter.ai).\n"
                    f"2. In your **Vercel Project Settings → Environment Variables**, add:\n"
                    f"   - **Key:** `OPENROUTER_API_KEY`\n"
                    f"   - **Value:** *Your OpenRouter key*\n"
                    f"3. Kiwi will automatically use `openrouter/free` to generate full AI answers at zero cost!\n\n"
                    f"*(Optional: You can also configure `HF_TOKEN` as a fallback provider)*."
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
