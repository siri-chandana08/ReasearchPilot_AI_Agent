from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.doc import Doc
from routers.auth import get_current_user

router = APIRouter(prefix="/api/docs", tags=["DocSpace"])

class DocCreate(BaseModel):
    title: str
    content: Optional[str] = ""
    workspace_id: Optional[int] = None

class DocUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

@router.get("", response_model=List[dict])
def list_docs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Doc).filter(Doc.user_id == current_user.id).order_by(Doc.updated_at.desc()).all()
    return [{
        "id": d.id,
        "title": d.title,
        "content": d.content,
        "workspace_id": d.workspace_id,
        "created_at": d.created_at.strftime("%Y-%m-%d"),
        "updated_at": d.updated_at.strftime("%Y-%m-%d %H:%M")
    } for d in docs]

@router.post("", response_model=dict)
def create_doc(doc_data: DocCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_doc = Doc(
        user_id=current_user.id,
        workspace_id=doc_data.workspace_id,
        title=doc_data.title or "Untitled Document",
        content=doc_data.content or ""
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return {
        "id": new_doc.id,
        "title": new_doc.title,
        "content": new_doc.content,
        "created_at": new_doc.created_at.strftime("%Y-%m-%d"),
        "updated_at": new_doc.updated_at.strftime("%Y-%m-%d %H:%M")
    }

@router.put("/{doc_id}", response_model=dict)
def update_doc(doc_id: int, doc_data: DocUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Doc).filter(Doc.id == doc_id, Doc.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc_data.title is not None:
        doc.title = doc_data.title
    if doc_data.content is not None:
        doc.content = doc_data.content

    db.commit()
    db.refresh(doc)
    return {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "updated_at": doc.updated_at.strftime("%Y-%m-%d %H:%M")
    }

@router.delete("/{doc_id}")
def delete_doc(doc_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Doc).filter(Doc.id == doc_id, Doc.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}
