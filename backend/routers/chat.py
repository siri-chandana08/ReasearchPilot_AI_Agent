from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.workspace import Workspace
from models.paper import Paper
from models.chat import ChatMessage
from routers.auth import get_current_user
from utils.groq_client import generate_chat_response
from utils.embeddings import create_research_context

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    workspace_id: int
    content: str

@router.get("/history/{workspace_id}")
def get_chat_history(workspace_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    messages = db.query(ChatMessage).filter(ChatMessage.workspace_id == workspace_id).order_by(ChatMessage.created_at.asc()).all()
    return [{"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at.strftime("%H:%M")} for m in messages]

@router.post("")
def chat_with_workspace_papers(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == req.workspace_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # 1. Fetch workspace papers
    papers = db.query(Paper).filter(Paper.workspace_id == req.workspace_id).all()
    papers_data = [
        {
            "title": p.title,
            "authors": p.authors,
            "published_date": p.published_date,
            "abstract": p.abstract,
            "source": p.source,
            "full_text": p.full_text
        }
        for p in papers
    ]

    # 2. Build context
    context_str = create_research_context(papers_data, req.content)

    # 3. Store user message
    user_msg = ChatMessage(workspace_id=ws.id, role="user", content=req.content)
    db.add(user_msg)
    db.commit()

    # 4. Fetch recent chat history
    past_messages = db.query(ChatMessage).filter(ChatMessage.workspace_id == ws.id).order_by(ChatMessage.created_at.desc()).limit(10).all()
    past_messages.reverse()
    formatted_messages = [{"role": m.role, "content": m.content} for m in past_messages]

    # 5. Generate Groq AI response
    assistant_text = generate_chat_response(messages=formatted_messages, context_str=context_str)

    # 6. Save assistant message
    assistant_msg = ChatMessage(workspace_id=ws.id, role="assistant", content=assistant_text)
    db.add(assistant_msg)
    db.commit()

    return {
        "response": assistant_text,
        "workspace_id": ws.id,
        "paper_count": len(papers)
    }
