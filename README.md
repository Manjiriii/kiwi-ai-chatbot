# KIWI 🦜 — Modern Full-Stack AI Chatbot Web Application

> **"Your curious AI companion for answers, research and the web."**

![Kiwi AI Parrot Mascot](https://img.shields.io/badge/Kiwi-AI%20Parrot%20Mascot-10B981?style=for-the-badge&logo=parrot)
![Model](https://img.shields.io/badge/Model-Meta%20Llama%203%2070B%20Instruct-0284C7?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-009688?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB?style=for-the-badge)

---

## 🦜 About Kiwi

**Kiwi is an intelligent, friendly AI Parrot mascot** designed to assist with curiosity, knowledge discovery, live web research, and webpage summarization.

> **Important Identity Note:**
> Kiwi is **100% an AI Parrot character** — **NOT a fruit!** Kiwi is depicted as a vibrant, tech-savvy bird perched on digital rings, ready to take flight into the web to find answers for you.

---

## ✨ Features

- 🧠 **Meta LLaMA 3 70B Instruct Brain**: Deep reasoning and intelligent natural dialogue powered by Hugging Face `InferenceClient`.
- 🌐 **Live DuckDuckGo Web Search**: Automatically triggers live web search when current events, news, or recency queries are asked. Displays live search state `🌐 Kiwi is searching the web...` and interactive, clickable source accordions.
- 🔗 **Real-Time Website & URL Reader**: Automatically extracts and reads clean content from URLs in user queries. Displays `🔗 Kiwi is reading the website...` and structured source cards.
- 💬 **Multi-Turn Conversation Management**: Full conversation history support stored locally, with search filter, automatic title generation, and conversation switching.
- 🎨 **Sophisticated Color Palette & Theme Support**:
  - Dark Mode (Deep Navy `#0A0F1D` surfaces with emerald and cyan accents).
  - Light Mode (Crisp off-white surfaces with vibrant parrot accents).
  - System Theme matching with persistent preference.
- ⚡ **Rich Markdown & Code Highlighting**: Syntax-formatted code blocks with copy-to-clipboard buttons, tables, blockquotes, and lists.
- 📱 **100% Responsive Design**: Seamless desktop sidebar with collapse toggle and touch-friendly mobile drawer.
- 🔒 **Enterprise-Grade Security**: API keys (`HF_TOKEN`) remain securely on the backend; never exposed to the client browser.

---

## 🛠️ Technology Stack

### Backend
- **Python 3.10+**
- **FastAPI**: Modern, high-performance web framework for building APIs.
- **Uvicorn**: Lightning-fast ASGI web server implementation.
- **Hugging Face Hub (`InferenceClient`)**: Direct integration with `meta-llama/Meta-Llama-3-70B-Instruct`.
- **DuckDuckGo Search (`duckduckgo-search`)**: Live web search engine integration.
- **BeautifulSoup4 & Requests**: Robust webpage scraping and text extraction.
- **Pydantic**: Request and response schema validation.
- **Python-dotenv**: Environment configuration loader.

### Frontend
- **React 18**: Component-based user interface.
- **Vite 6**: Next-generation frontend build tool and dev server.
- **Tailwind CSS 3**: Utility-first styling system.
- **Lucide React**: Modern, clean iconography.
- **React Markdown & Remark GFM**: Rich markdown, lists, and table formatting.

---

## 📂 Project Architecture

```
chatbot/
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Local environment file (gitignored)
│   ├── requirements.txt      # Python backend dependencies
│   ├── main.py               # FastAPI application & API endpoints
│   ├── chatbot.py            # Kiwi AI orchestrator & LLaMA 3 client
│   ├── web_search.py         # DuckDuckGo search integration
│   ├── website_reader.py     # BeautifulSoup webpage scraper
│   └── test_backend.py       # Automated backend test suite
│
├── frontend/
│   ├── index.html            # Single page app entry HTML
│   ├── package.json          # Node dependencies and scripts
│   ├── vite.config.js        # Vite config with API proxy to port 8000
│   ├── tailwind.config.js    # Kiwi color themes and animations
│   ├── postcss.config.js     # PostCSS configuration
│   └── src/
│       ├── assets/
│       │   └── KiwiParrot.jsx # Original handcrafted Kiwi Parrot SVG mascot
│       ├── components/
│       │   ├── KiwiLogo.jsx
│       │   ├── KiwiAvatar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ConversationList.jsx
│       │   ├── ChatWindow.jsx
│       │   ├── MessageBubble.jsx
│       │   ├── ChatInput.jsx
│       │   ├── WelcomeScreen.jsx
│       │   ├── PromptCard.jsx
│       │   ├── ThinkingIndicator.jsx
│       │   ├── SourcesCard.jsx
│       │   ├── SettingsModal.jsx
│       │   ├── ThemeToggle.jsx
│       │   └── AboutModal.jsx
│       ├── services/
│       │   └── api.js        # Backend API service client
│       ├── hooks/
│       │   ├── useChat.js    # Chat state & persistence
│       │   └── useTheme.js   # Light/Dark/System theme hook
│       ├── App.jsx           # Main application shell
│       ├── main.jsx          # React DOM entry point
│       └── index.css         # Tailwind & custom prose styles
│
├── .gitignore                # Root gitignore
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 2. Backend Setup

1. Open a terminal in the project directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your Hugging Face token in `backend/.env`:
   ```bash
   # Copy template
   cp .env.example .env
   ```
   Edit `.env`:
   ```ini
   HF_TOKEN=hf_your_actual_token_here
   HF_MODEL=meta-llama/Meta-Llama-3-70B-Instruct
   HOST=0.0.0.0
   PORT=8000
   ```
4. Run standalone tests to verify modules:
   ```bash
   python test_backend.py
   ```
5. Start the FastAPI backend server:
   ```bash
   python main.py
   ```
   The backend API will run at `http://localhost:8000`. Interactive Swagger API docs are available at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

1. Open a new terminal in the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🌐 How Search & URL Reading Work

### 1. Live DuckDuckGo Search
When a user prompt includes recency keywords (such as `latest`, `today`, `current`, `news`, `weather`, `price of`) or starts with `search:`, Kiwi automatically:
1. Detects search intent and queries DuckDuckGo.
2. Extracts live search result titles, snippets, and source URLs.
3. Augments the LLaMA 3 prompt with the live search results context.
4. Returns the AI synthesized answer alongside structured source metadata.
5. The UI renders the `🌐 Kiwi is searching the web...` animation followed by a collapsible source accordion with verified URLs.

### 2. Website Content Reader
When a user pastes one or more URLs (e.g., `https://example.com` or `Summarize https://news.ycombinator.com`), Kiwi automatically:
1. Regex-detects all valid URLs in the query.
2. Fetches the live HTML content with custom User-Agent headers.
3. Strips scripts, styles, and boilerplate elements using `BeautifulSoup4`.
4. Extracts clean text and summarizes the page directly into the LLaMA 3 prompt.
5. Displays `🔗 Kiwi is reading the website...` followed by an extracted Website Badge in the UI.

---

## 🔒 Security Best Practices

- **Token Safety**: The Hugging Face API key is strictly read by the backend from `backend/.env`. It is **never** sent to or stored in client-side code.
- **Git Protection**: `.env` and `backend/.env` are included in `.gitignore` to prevent secret commits.
- **Input Sanitization**: Web responses and URLs are stripped and sanitized before inclusion into the prompt to prevent injection.

---

## 💡 Future Improvements

- [ ] Streaming SSE responses for typewriter effect on long answers.
- [ ] Multi-tab PDF and file upload attachments.
- [ ] Export conversation history to Markdown / PDF.
- [ ] Voice input / speech synthesis for Kiwi responses.

---

## 📜 License

Created with ❤️ for AI Pair Programming and Modern Web Development.
