from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.workspace import Workspace
from models.paper import Paper
from routers.auth import get_current_user

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces"])

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class WorkspaceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: str
    paper_count: int

    class Config:
        from_attributes = True

@router.get("", response_model=List[dict])
def list_workspaces(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).filter(Workspace.user_id == current_user.id).all()
    result = []
    for ws in workspaces:
        paper_count = db.query(Paper).filter(Paper.workspace_id == ws.id).count()
        result.append({
            "id": ws.id,
            "name": ws.name,
            "description": ws.description,
            "created_at": ws.created_at.strftime("%Y-%m-%d"),
            "paper_count": paper_count
        })
    return result

@router.post("", response_model=dict)
def create_workspace(ws_data: WorkspaceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workspace = Workspace(
        user_id=current_user.id,
        name=ws_data.name,
        description=ws_data.description
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return {
        "id": workspace.id,
        "name": workspace.name,
        "description": workspace.description,
        "created_at": workspace.created_at.strftime("%Y-%m-%d"),
        "paper_count": 0
    }

@router.get("/{workspace_id}", response_model=dict)
def get_workspace_detail(workspace_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    papers = db.query(Paper).filter(Paper.workspace_id == ws.id).all()
    paper_list = []
    for p in papers:
        paper_list.append({
            "id": p.id,
            "title": p.title,
            "authors": p.authors,
            "published_date": p.published_date,
            "abstract": p.abstract,
            "source": p.source,
            "url": p.url,
            "pdf_path": p.pdf_path,
            "has_full_text": bool(p.full_text)
        })

    return {
        "id": ws.id,
        "name": ws.name,
        "description": ws.description,
        "created_at": ws.created_at.strftime("%Y-%m-%d"),
        "papers": paper_list
    }

@router.delete("/{workspace_id}")
def delete_workspace(workspace_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    db.delete(ws)
    db.commit()
    return {"message": "Workspace deleted successfully"}
