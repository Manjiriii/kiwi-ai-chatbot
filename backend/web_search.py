"""
Web search module for Kiwi AI Chatbot using DuckDuckGo Search.
Provides structured live search capabilities and context formatting for LLMs.
"""

from typing import List, Dict, Any
import logging

try:
    from duckduckgo_search import DDGS
except ImportError:
    try:
        from duckduckgo_search.duckduckgo_search import DDGS
    except ImportError:
        DDGS = None

logger = logging.getLogger("kiwi.web_search")


def search_duckduckgo(query: str, max_results: int = 3) -> Dict[str, Any]:
    """
    Performs a live DuckDuckGo text search.
    
    Returns:
        Dict containing:
            - 'success': bool
            - 'results': List[Dict[str, str]] with 'title', 'url', 'snippet'
            - 'formatted_context': str for LLM context injection
            - 'error': Optional[str]
    """
    if not query or not query.strip():
        return {
            "success": False,
            "results": [],
            "formatted_context": "",
            "error": "Search query is empty."
        }

    clean_query = query.strip()
    results: List[Dict[str, str]] = []

    try:
        if DDGS is None:
            raise RuntimeError("duckduckgo_search package is not installed or failed to import.")

        with DDGS() as ddgs:
            search_gen = ddgs.text(clean_query, max_results=max_results)
            for item in search_gen:
                title = item.get("title", "Untitled")
                url = item.get("href") or item.get("link") or ""
                snippet = item.get("body") or item.get("snippet") or ""
                if title or url:
                    results.append({
                        "title": title,
                        "url": url,
                        "snippet": snippet
                    })

        if not results:
            # Fallback to DuckDuckGo Instant Answer / Topics API
            try:
                import urllib.parse
                import requests
                api_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(clean_query)}&format=json&no_html=1"
                resp = requests.get(api_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}, timeout=6)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("AbstractText"):
                        results.append({
                            "title": data.get("Heading") or clean_query,
                            "url": data.get("AbstractURL") or f"https://duckduckgo.com/?q={urllib.parse.quote(clean_query)}",
                            "snippet": data.get("AbstractText")
                        })
                    for topic in data.get("RelatedTopics", []):
                        if len(results) >= max_results:
                            break
                        if isinstance(topic, dict) and topic.get("Text") and topic.get("FirstURL"):
                            text = topic.get("Text")
                            title_part = text.split(" - ")[0] if " - " in text else text[:60]
                            results.append({
                                "title": title_part,
                                "url": topic.get("FirstURL"),
                                "snippet": text
                            })
            except Exception as fb_err:
                logger.debug(f"DuckDuckGo API fallback notice: {fb_err}")

        if not results:
            return {
                "success": True,
                "results": [],
                "formatted_context": "No live results found for this query.",
                "error": None
            }

        # Build context string for the prompt
        lines = []
        for i, r in enumerate(results, 1):
            snippet_str = f" - {r['snippet']}" if r.get("snippet") else ""
            lines.append(f"[{i}] {r['title']}: {r['url']}{snippet_str}")

        formatted_context = "\n".join(lines)

        return {
            "success": True,
            "results": results,
            "formatted_context": formatted_context,
            "error": None
        }

    except Exception as e:
        logger.warning(f"DuckDuckGo search error for query '{clean_query}': {e}")
        return {
            "success": False,
            "results": [],
            "formatted_context": f"Search error: {str(e)}",
            "error": str(e)
        }
