from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.workspace import Workspace
from models.paper import Paper
from routers.auth import get_current_user
from utils.paper_search import query_academic_databases
from utils.pdf_parser import extract_text_from_pdf_bytes

router = APIRouter(prefix="/api/papers", tags=["Papers"])

class PaperImportRequest(BaseModel):
    workspace_id: int
    title: str
    authors: str
    published_date: Optional[str] = ""
    abstract: Optional[str] = ""
    source: Optional[str] = "arXiv"
    url: Optional[str] = ""

@router.get("/search")
async def search_papers(query: str, source: Optional[str] = "all", current_user: User = Depends(get_current_user)):
    """
    Searches arXiv and PubMed academic databases dynamically using the input query string.
    """
    search_results = await query_academic_databases(query=query, source=source)
    return {"query": query, "source": source, "papers": search_results}

@router.post("/import")
def import_paper_endpoint(paper_data: PaperImportRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == paper_data.workspace_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Target workspace not found")
    
    new_paper = Paper(
        workspace_id=ws.id,
        title=paper_data.title,
        authors=paper_data.authors,
        published_date=paper_data.published_date,
        abstract=paper_data.abstract,
        source=paper_data.source or "arXiv",
        url=paper_data.url
    )
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    
    return {"message": "Paper imported successfully", "paper_id": new_paper.id, "workspace": ws.name}

@router.post("/upload")
async def upload_pdf_endpoint(
    file: UploadFile = File(...),
    workspace_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    extracted_text = extract_text_from_pdf_bytes(content)
    
    filename = file.filename
    clean_title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ")
    
    paper_id = None
    if workspace_id:
        ws = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == current_user.id).first()
        if ws:
            new_paper = Paper(
                workspace_id=ws.id,
                title=clean_title,
                authors="Uploaded File",
                published_date="Recent",
                abstract=extracted_text[:400] + "...",
                source="Uploaded PDF",
                full_text=extracted_text
            )
            db.add(new_paper)
            db.commit()
            db.refresh(new_paper)
            paper_id = new_paper.id

    return {
        "filename": filename,
        "title": clean_title,
        "extracted_text": extracted_text,
        "char_count": len(extracted_text),
        "paper_id": paper_id,
        "saved_to_workspace": workspace_id is not None
    }

@router.delete("/{paper_id}")
def delete_paper(paper_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    ws = db.query(Workspace).filter(Workspace.id == paper.workspace_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(paper)
    db.commit()
    return {"message": "Paper removed from workspace"}
