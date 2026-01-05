# Orbit - Relationship Analytics Platform

A three-tier application for analyzing chat conversations using AI. Upload your WhatsApp or Instagram chats and get beautiful visual analytics plus AI-powered relationship insights.

![Orbit Dashboard](https://via.placeholder.com/800x400?text=Orbit+Dashboard)

## ✨ Features

- **14 Analytics Cards**: Message trends, streaks, word clouds, engagement metrics
- **AI Insights**: Conversation dynamics, emotional sentiment, engagement balance, sharing patterns
- **Beautiful UI**: Dark mode, glass morphism, smooth animations
- **Privacy First**: All processing happens locally - your data never leaves your machine

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Presentation Tier │ Application Tier │    Data Tier    │
│    (Next.js)      │    (FastAPI)     │ (SQLite/Postgres)│
│     Port 3000     │    Port 8000     │                  │
└─────────────────────────────────────────────────────────┘
          │                   │                  │
          │    REST API       │     ORM          │
          └───────────────────┴──────────────────┘
                       │
                    Ollama
                  (AI Engine)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **Ollama** (for AI features): https://ollama.ai

### 1. Install Ollama & Pull Model
```bash
# Install Ollama from https://ollama.ai
# Then pull the model:
ollama pull qwen2.5:0.5b
```

### 2. Start Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open App
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
/
├── frontend/               # Next.js 16 Application
│   ├── src/
│   │   ├── components/     # UI Components
│   │   │   ├── cards/      # 14 analytics cards + AI insights
│   │   │   ├── expanded/   # 6 expanded detail views
│   │   │   └── ui/         # Shared UI components
│   │   ├── app/            # Pages (Home, Report)
│   │   ├── lib/            # API client
│   │   └── store/          # Zustand state management
│   └── package.json
│
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # REST Endpoints
│   │   ├── core/           # Configuration
│   │   ├── db/             # SQLAlchemy models
│   │   └── services/       # Business Logic
│   │       ├── parser.py       # WhatsApp/Instagram parsing
│   │       ├── stats.py        # Statistical computations
│   │       ├── ai_engine.py    # Ollama-based AI analysis
│   │       └── text_optimizer.py # Token optimization
│   ├── requirements.txt
│   └── orbit.db            # SQLite (local dev, gitignored)
│
├── docker-compose.yml      # Docker orchestration
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload` | Upload chat file, returns stats |
| GET | `/api/v1/stats/{id}` | Get computed statistics |
| POST | `/api/v1/ai/init` | Initialize AI engine |
| POST | `/api/v1/ai/analyze` | Run full AI analysis (4 categories) |
| GET | `/api/v1/ai/insights/{id}` | Get cached AI insights |
| POST | `/api/v1/search` | Search messages with filters |

## 🤖 AI Insights

The AI analyzes your chat across 4 categories:

1. **Conversation Flow** - Who initiates, conversation patterns
2. **Emotional Sentiment** - Tone, health assessment, flags
3. **Engagement Depth** - Effort comparison, investment balance
4. **Personal Sharing** - Openness, reciprocity

### How It Works
- Samples up to **500 messages** using stratified sampling (early/middle/recent)
- Processes **15,000 characters** of context (~4k tokens)
- Uses **qwen2.5:0.5b** via Ollama (runs locally, no API costs)

## 📱 Supported Formats

| Platform | Format | How to Export |
|----------|--------|---------------|
| **WhatsApp** | `.txt` | Chat → More → Export Chat |
| **Instagram** | `.json` | Settings → Your Activity → Download |

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Services:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Postgres: localhost:5432
```

## 🛠️ Development

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=sqlite:///./orbit.db
# For Docker: postgresql://postgres:orbit_secret@db:5432/orbit
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📄 License

MIT License - feel free to use and modify!

---

Built with ❤️ using Next.js, FastAPI, and Ollama
