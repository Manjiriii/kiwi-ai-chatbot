"""
FastAPI application for KIWI 🦜 AI Chatbot.
Provides RESTful APIs for chat, web search, website scraping, and health checks.
"""

import os
import sys
import logging
from typing import List, Dict, Optional, Any

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from chatbot import chatbot_instance, KiwiChatbot
from web_search import search_duckduckgo
from website_reader import fetch_website_content

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("kiwi.api")

load_dotenv()

app = FastAPI(
    title="KIWI AI Chatbot API 🦜",
    description="Backend API for Kiwi - Your curious AI companion for answers, research and the web.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "https://kiwi-ai-chatbot.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request and Response Schemas ---

class HistoryItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The user's query or instruction.")
    conversation_id: Optional[str] = Field("default-session", description="Unique conversation session ID.")
    history: Optional[List[HistoryItem]] = Field(default=[], description="Prior conversation history turns.")


class SourceItem(BaseModel):
    title: str
    url: str
    snippet: Optional[str] = None
    domain: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    source_type: str = Field(..., description="'normal', 'web_search', or 'website'")
    sources: List[Dict[str, Any]] = Field(default=[], description="Structured source references")
    search_query: Optional[str] = None
    website_url: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 3


class UrlRequest(BaseModel):
    url: str


from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# --- API Routes ---

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.get("/")
@app.get("/index.html")
def root():
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "name": "Kiwi AI Assistant 🦜",
        "tagline": "Your curious AI companion for answers, research and the web.",
        "mascot": "Friendly Intelligent Parrot (NOT a fruit)",
        "status": "online",
        "docs": "/docs"
    }



@app.get("/api")
@app.get("/api/")
def api_root():
    return {
        "status": "online",
        "mascot": "Kiwi AI Assistant 🦜",
        "tagline": "Your curious AI companion for answers, research and the web.",
        "endpoints": ["/api/health", "/api/chat", "/api/search", "/api/fetch-url", "/docs"]
    }


@app.get("/debug")
@app.get("/api/debug")
def debug_endpoint(request: Request):
    return {
        "url_path": request.url.path,
        "scope_path": request.scope.get("path"),
        "headers": {k.decode("utf-8") if isinstance(k, bytes) else k: v.decode("utf-8") if isinstance(v, bytes) else v for k, v in request.headers.items()}
    }


@app.get("/api/health")
@app.get("/health")
def health_check():
    """Health and configuration status."""
    token = chatbot_instance.get_token()
    has_token = bool(token and len(token.strip()) > 0)
    return {
        "status": "healthy",
        "mascot": "Kiwi the Parrot 🦜",
        "model": chatbot_instance.model,
        "hf_token_configured": has_token
    }


@app.post("/api/chat", response_model=ChatResponse)
@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """
    Main chat endpoint. Handles conversation history, intent detection,
    live web searches, and URL reading with structured responses.
    """
    try:
        history_dicts = [{"role": h.role, "content": h.content} for h in payload.history] if payload.history else []
        result = chatbot_instance.process_chat(
            message=payload.message,
            conversation_id=payload.conversation_id or "default",
            history=history_dicts
        )
        return ChatResponse(**result)
    except Exception as e:
        logger.error(f"Error processing chat request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Kiwi encountered an error: {str(e)}")


@app.post("/api/search")
@app.post("/search")
def search_endpoint(payload: SearchRequest):
    """Direct web search test endpoint."""
    return search_duckduckgo(payload.query, max_results=payload.max_results or 3)


@app.post("/api/fetch-url")
@app.post("/fetch-url")
def url_endpoint(payload: UrlRequest):
    """Direct URL reading test endpoint."""
    return fetch_website_content(payload.url)


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    print(f"🦜 Starting Kiwi AI Chatbot API on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
