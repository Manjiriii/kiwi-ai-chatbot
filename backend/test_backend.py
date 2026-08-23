"""
Standalone automated test script for Kiwi backend modules:
1. Web search
2. Website reader
3. Chatbot intent routing & API
"""

import sys
from web_search import search_duckduckgo
from website_reader import extract_urls, fetch_website_content
from chatbot import chatbot_instance


def test_web_search():
    print("Testing DuckDuckGo search...")
    res = search_duckduckgo("latest artificial intelligence news", max_results=2)
    print(f"  Success: {res['success']}, Results count: {len(res['results'])}")
    if res['results']:
        print(f"  First result: {res['results'][0]['title']} -> {res['results'][0]['url']}")
    assert res['success'] is True, "Search should succeed"
    print("  [PASS] Web search test passed!\n")


def test_url_extraction_and_reading():
    print("Testing URL extraction and website reader...")
    text = "Check out https://example.com and summarize it"
    urls = extract_urls(text)
    print(f"  Extracted URLs: {urls}")
    assert len(urls) == 1 and urls[0] == "https://example.com"
    
    site_res = fetch_website_content(urls[0])
    print(f"  Website Title: {site_res['title']}, Domain: {site_res['domain']}")
    print(f"  Content length: {len(site_res['content'])}")
    assert site_res['success'] is True
    print("  [PASS] Website reader test passed!\n")


def test_chatbot_routing():
    print("Testing Chatbot routing...")
    
    # 1. Empty message
    r1 = chatbot_instance.process_chat("")
    assert "empty" in r1["response"].lower() or "squawk" in r1["response"].lower()
    print("  [PASS] Empty message handled correctly.")

    # 2. Web search trigger
    r2 = chatbot_instance.process_chat("What is the latest news today?")
    print(f"  Source type for latest news: {r2['source_type']}")
    assert r2['source_type'] == "web_search"
    print("  [PASS] Web search intent routing passed.")

    # 3. URL reading trigger
    r3 = chatbot_instance.process_chat("Please read https://example.com")
    print(f"  Source type for URL: {r3['source_type']}")
    assert r3['source_type'] == "website"
    print("  [PASS] Website reader intent routing passed.")

    print("\nAll backend unit tests passed successfully!")


if __name__ == "__main__":
    try:
        test_web_search()
        test_url_extraction_and_reading()
        test_chatbot_routing()
    except Exception as e:
        print(f"\n[FAIL] Test encountered error: {e}")
        sys.exit(1)
