"""
Vercel Serverless Function entrypoint for Kiwi AI Chatbot backend.
"""

import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app as raw_app


class VercelPathMiddleware:
    """
    ASGI middleware that restores the true URL path from Vercel rewrite headers
    (such as x-matched-path, x-vercel-original-url, or x-forwarded-uri)
    when Vercel rewrites traffic to /api/index.py.
    """
    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            current_path = scope.get("path", "")
            
            # If path was rewritten to index.py entrypoint or generic /api
            if current_path in ("/api/index.py", "/index.py", "/api/index", "/index", "/api", "/api/"):
                headers = dict(scope.get("headers", []))
                
                # Check x-matched-path first (standard Vercel rewrite header)
                matched_path = headers.get(b"x-matched-path")
                if matched_path:
                    scope["path"] = matched_path.decode("utf-8").split("?")[0]
                else:
                    # Fallback to x-vercel-original-url or x-forwarded-uri
                    orig_url = headers.get(b"x-vercel-original-url") or headers.get(b"x-forwarded-uri")
                    if orig_url:
                        scope["path"] = orig_url.decode("utf-8").split("?")[0]

        await self.asgi_app(scope, receive, send)


app = VercelPathMiddleware(raw_app)
