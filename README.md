# ResearchHub AI (ResearchPilot)

Intelligent Research Paper Management and Analysis System using Agentic AI, FastAPI, Groq Llama 3.3 70B, and React + TypeScript + Tailwind CSS.

## Features
- **User Authentication**: Secure JWT-based registration and login with bcrypt hashing.
- **Academic Paper Search**: Live integration with arXiv REST API for paper discovery and metadata retrieval.
- **Workspace Management**: Containerized project workspaces for organizing research papers.
- **AI Chatbot**: Groq Llama 3.3 70B agent with vector context awareness over workspace papers.
- **AI Tools**: Multi-paper AI Summarizer, Key Insights Extractor, and Literature Review generator.
- **PDF Processing**: Upload research PDFs, extract text, preview, and save to workspace.
- **DocSpace Editor**: Centralized note editor for managing research notes and findings.

---

## Quick Start Guide

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure your Groq API key in backend/.env:
# GROQ_API_KEY=gsk_your_groq_api_key_here

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be running at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 2. Frontend Setup (React + Vite)
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install node dependencies
npm install

# Start development server
npm run dev
```
Frontend application will be accessible at `http://localhost:3000` or `http://localhost:5173`.
