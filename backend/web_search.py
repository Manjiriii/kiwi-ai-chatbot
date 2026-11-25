"""
Web search module for Kiwi AI Chatbot.
Provides robust real-time search capabilities, targeting individual articles,
extracting direct URLs, publication dates, and source names for LLM synthesis.
"""

from typing import List, Dict, Any, Optional
import urllib.parse
import xml.etree.ElementTree as ET
import html
import re
import logging
from datetime import datetime
import requests

try:
    from duckduckgo_search import DDGS
except ImportError:
    try:
        from duckduckgo_search.duckduckgo_search import DDGS
    except ImportError:
        DDGS = None

logger = logging.getLogger("kiwi.web_search")

# Generic homepage paths to filter out
GENERIC_PATHS = {"", "/", "/index.html", "/index.htm", "/news", "/news/", "/home", "/home/", "/latest", "/latest/"}


def _clean_html_text(raw_text: str) -> str:
    """Strips HTML tags and unescapes HTML entities."""
    if not raw_text:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw_text)
    clean = html.unescape(clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean


def _format_date(date_str: str) -> str:
    """Formats standard RSS pubDate string into human-readable date."""
    if not date_str:
        return ""
    try:
        # e.g. "Mon, 23 Nov 2026 16:53:04 GMT" or "Wed, 25 Nov 2026 02:39:00 GMT"
        dt = datetime.strptime(date_str[:16].strip(), "%a, %d %b %Y")
        return dt.strftime("%b %d, %Y")
    except Exception:
        # Fallback: remove GMT or excess time tokens if present
        clean = re.sub(r'\d{2}:\d{2}(:\d{2})?\s*(GMT|UTC|[A-Z]{3})?', '', date_str).strip(' ,')
        return clean or date_str


def _is_individual_article_url(url: str) -> bool:
    """Checks that the URL points to an actual article, not a generic homepage."""
    if not url:
        return False
    try:
        parsed = urllib.parse.urlparse(url)
        path = parsed.path.rstrip('/')
        if not path or path in GENERIC_PATHS:
            return False
        # If path is just one short segment without hyphens or numbers, e.g. /world or /tech
        segments = [s for s in path.split('/') if s]
        if len(segments) == 1 and not re.search(r'[-_0-9]', segments[0]):
            return False
        return True
    except Exception:
        return True


def _search_bing_news_rss(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Fetches fresh news items from Bing News RSS feed."""
    results: List[Dict[str, str]] = []
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://www.bing.com/news/search?q={encoded_query}&format=rss"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200 and resp.content:
            root = ET.fromstring(resp.content)
            for item in root.findall('.//item'):
                title = _clean_html_text(item.findtext('title') or '')
                raw_link = (item.findtext('link') or '').strip()
                desc = _clean_html_text(item.findtext('description') or '')
                pub_date = _format_date(item.findtext('pubDate') or '')

                # Extract direct article URL from Bing click tracker
                direct_url = raw_link
                if "url=" in raw_link:
                    parsed_link = urllib.parse.urlparse(raw_link)
                    qs = urllib.parse.parse_qs(parsed_link.query)
                    if "url" in qs and qs["url"]:
                        direct_url = qs["url"][0]

                # Determine publisher source
                domain = ""
                try:
                    p = urllib.parse.urlparse(direct_url)
                    domain = p.netloc.replace("www.", "")
                except Exception:
                    domain = "News Source"

                if not _is_individual_article_url(direct_url):
                    continue

                if title and direct_url:
                    results.append({
                        "title": title,
                        "url": direct_url,
                        "snippet": desc,
                        "date": pub_date,
                        "source": domain
                    })
                    if len(results) >= max_results:
                        break
    except Exception as e:
        logger.debug(f"Bing News RSS search notice for '{query}': {e}")
    return results


def _search_google_news_rss(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Fetches fresh news items from Google News RSS feed."""
    results: List[Dict[str, str]] = []
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200 and resp.content:
            root = ET.fromstring(resp.content)
            for item in root.findall('.//item'):
                raw_title = item.findtext('title') or ''
                link = (item.findtext('link') or '').strip()
                pub_date = _format_date(item.findtext('pubDate') or '')
                
                source_el = item.find('source')
                source_name = source_el.text if source_el is not None and source_el.text else "Google News"

                # Title in Google News is usually formatted as: "Article Title - Outlet Name"
                clean_title = re.sub(r'\s*-\s*[^-]+$', '', raw_title).strip() or raw_title
                clean_title = _clean_html_text(clean_title)

                desc_raw = item.findtext('description') or ''
                desc_clean = _clean_html_text(desc_raw)
                # If description is just the title again, create helpful snippet
                snippet = desc_clean if len(desc_clean) > len(clean_title) + 10 else f"Recent report from {source_name} on {clean_title}."

                if clean_title and link:
                    results.append({
                        "title": clean_title,
                        "url": link,
                        "snippet": snippet,
                        "date": pub_date,
                        "source": source_name
                    })
                    if len(results) >= max_results:
                        break
    except Exception as e:
        logger.debug(f"Google News RSS search notice for '{query}': {e}")
    return results


def _search_ddgs(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Attempts search via duckduckgo_search package."""
    results: List[Dict[str, str]] = []
    if DDGS is None:
        return results

    try:
        with DDGS() as ddgs:
            # Try news first for latest topics
            try:
                for item in ddgs.news(query, max_results=max_results):
                    title = _clean_html_text(item.get("title") or "")
                    url = item.get("url") or item.get("href") or ""
                    snippet = _clean_html_text(item.get("body") or item.get("snippet") or "")
                    pub_date = _format_date(item.get("date") or "")
                    source = item.get("source") or ""
                    if _is_individual_article_url(url) and title:
                        results.append({
                            "title": title,
                            "url": url,
                            "snippet": snippet,
                            "date": pub_date,
                            "source": source or "DuckDuckGo News"
                        })
                        if len(results) >= max_results:
                            return results
            except Exception:
                pass

            # Fallback to standard text search
            for item in ddgs.text(query, max_results=max_results):
                title = _clean_html_text(item.get("title") or "")
                url = item.get("href") or item.get("link") or ""
                snippet = _clean_html_text(item.get("body") or item.get("snippet") or "")
                if _is_individual_article_url(url) and title:
                    results.append({
                        "title": title,
                        "url": url,
                        "snippet": snippet,
                        "date": "",
                        "source": "Web Search"
                    })
                    if len(results) >= max_results:
                        break
    except Exception as e:
        logger.debug(f"DDGS search notice for '{query}': {e}")
    return results


def search_duckduckgo(query: str, max_results: int = 4) -> Dict[str, Any]:
    """
    Performs a high-accuracy, multi-source live web and news search.
    Targets individual recent articles and filters out generic homepages.
    
    Returns:
        Dict containing:
            - 'success': bool
            - 'results': List[Dict] with 'title', 'url', 'snippet', 'date', 'source'
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
    seen_urls = set()
    seen_titles = set()

    def add_result(r: Dict[str, str]):
        u = r.get("url", "").strip()
        t = re.sub(r'[^a-zA-Z0-9]', '', r.get("title", "").lower()[:40])
        if not u or u in seen_urls or t in seen_titles:
            return
        seen_urls.add(u)
        seen_titles.add(t)
        results.append(r)

    try:
        # 1. Primary real-time news source: Bing News RSS (provides exact direct URLs & dates)
        bing_results = _search_bing_news_rss(clean_query, max_results=max_results)
        for r in bing_results:
            add_result(r)

        # 2. Secondary real-time news source: Google News RSS
        if len(results) < max_results:
            google_results = _search_google_news_rss(clean_query, max_results=max_results - len(results))
            for r in google_results:
                add_result(r)

        # 3. DuckDuckGo search if needed
        if len(results) < max_results:
            ddg_results = _search_ddgs(clean_query, max_results=max_results - len(results))
            for r in ddg_results:
                add_result(r)

        if not results:
            return {
                "success": True,
                "results": [],
                "formatted_context": "No live articles found for this specific query.",
                "error": None
            }

        # Format context for LLM prompt
        lines = []
        for i, r in enumerate(results, 1):
            date_part = f" | Date: {r['date']}" if r.get('date') else ""
            source_part = f" | Source: {r['source']}" if r.get('source') else ""
            snippet_part = f"\n    Summary: {r['snippet']}" if r.get('snippet') else ""
            lines.append(
                f"[{i}] {r['title']}{source_part}{date_part}\n"
                f"    URL: {r['url']}"
                f"{snippet_part}"
            )

        formatted_context = "\n\n".join(lines)

        return {
            "success": True,
            "results": results,
            "formatted_context": formatted_context,
            "error": None
        }

    except Exception as e:
        logger.warning(f"Live search error for query '{clean_query}': {e}")
        return {
            "success": False,
            "results": [],
            "formatted_context": f"Search error: {str(e)}",
            "error": str(e)
        }


# Alias for readability
search_web = search_duckduckgo
