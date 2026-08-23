"""
Website reading and extraction module for Kiwi AI Chatbot.
Extracts clean text and metadata from URLs using requests and BeautifulSoup4.
"""

import re
import urllib.parse
from typing import Dict, Any, List, Optional
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("kiwi.website_reader")

# Regex to detect URLs in user text
URL_REGEX = re.compile(
    r'(https?://[^\s<>"\')\]]+)',
    re.IGNORECASE
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36 Kiwi/1.0"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def extract_urls(text: str) -> List[str]:
    """Finds all HTTP/HTTPS URLs present in text."""
    if not text:
        return []
    matches = URL_REGEX.findall(text)
    # Clean trailing punctuation often caught in URLs
    cleaned = []
    for m in matches:
        m = m.rstrip(".,;!?:")
        if m and m not in cleaned:
            cleaned.append(m)
    return cleaned


def get_domain(url: str) -> str:
    """Extracts hostname from a URL."""
    try:
        parsed = urllib.parse.urlparse(url)
        return parsed.netloc or url
    except Exception:
        return url


def fetch_website_content(url: str, max_chars: int = 1500, timeout: int = 8) -> Dict[str, Any]:
    """
    Fetches and parses text content from a given website URL.
    
    Returns:
        Dict containing:
            - 'success': bool
            - 'url': str
            - 'domain': str
            - 'title': str
            - 'content': str
            - 'formatted_context': str
            - 'error': Optional[str]
    """
    domain = get_domain(url)
    
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        response.raise_for_status()

        # Parse with BeautifulSoup
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract page title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.find("h1"):
            title = soup.find("h1").get_text(strip=True)
        if not title:
            title = domain

        # Remove irrelevant elements
        for element in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "form"]):
            element.extract()

        # Extract clean text
        text = soup.get_text(separator=" ", strip=True)
        
        # Collapse multiple whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        trimmed_content = text[:max_chars]
        if len(text) > max_chars:
            trimmed_content += "..."

        formatted_context = (
            f"[Website Source: {title} ({url})]\n"
            f"[Domain: {domain}]\n"
            f"[Extracted Content]:\n{trimmed_content}"
        )

        return {
            "success": True,
            "url": url,
            "domain": domain,
            "title": title,
            "content": trimmed_content,
            "formatted_context": formatted_context,
            "error": None
        }

    except requests.exceptions.Timeout:
        err_msg = f"Request timed out while connecting to {domain}"
        logger.warning(f"Timeout fetching {url}: {err_msg}")
        return {
            "success": False,
            "url": url,
            "domain": domain,
            "title": domain,
            "content": "",
            "formatted_context": f"[Could not fetch {url}: Timeout]",
            "error": err_msg
        }
    except Exception as e:
        err_msg = str(e)
        logger.warning(f"Error fetching {url}: {err_msg}")
        return {
            "success": False,
            "url": url,
            "domain": domain,
            "title": domain,
            "content": "",
            "formatted_context": f"[Could not fetch {url}: {err_msg}]",
            "error": err_msg
        }
