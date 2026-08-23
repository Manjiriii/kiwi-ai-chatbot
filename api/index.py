"""
Vercel Serverless Function entrypoint for Kiwi AI Chatbot backend.
"""

import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
