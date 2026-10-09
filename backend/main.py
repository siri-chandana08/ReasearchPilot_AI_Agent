from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import *
from routers import (
    auth_router,
    workspaces_router,
    papers_router,
    chat_router,
    ai_tools_router,
    docs_router
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResearchHub AI API",
    description="Intelligent Research Paper Management & Analysis Platform powered by Groq Llama 3.3 70B & FastAPI",
    version="1.0.0"
)

# Configure CORS Middleware (PDF Activity 6.3)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(papers_router)
app.include_router(chat_router)
app.include_router(ai_tools_router)
app.include_router(docs_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "ResearchHub AI API",
        "version": "1.0.0",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
