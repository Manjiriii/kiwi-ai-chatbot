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
