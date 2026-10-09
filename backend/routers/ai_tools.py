from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.paper import Paper
from routers.auth import get_current_user
from utils.groq_client import generate_chat_response

router = APIRouter(prefix="/api/ai", tags=["AI Tools"])

class AIToolRequest(BaseModel):
    paper_ids: List[int]
    custom_prompt: Optional[str] = ""

@router.post("/summarize")
def generate_summaries(req: AIToolRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="Please select at least one paper")
    
    papers = db.query(Paper).filter(Paper.id.in_(req.paper_ids)).all()
    if not papers:
        raise HTTPException(status_code=404, detail="No matching papers found")

    summaries = []
    for paper in papers:
        context = f"Title: {paper.title}\nAuthors: {paper.authors}\nAbstract: {paper.abstract}"
        prompt = f"Provide a comprehensive concise summary of this research paper in 5-7 bullet points covering Main topic, Research Question, Methodology, Key findings, Device/Tool usage, and Conclusions.\n\nPaper Data:\n{context}"
        
        summary_text = generate_chat_response([{"role": "user", "content": prompt}], context_str=context)
        summaries.append({
            "paper_id": paper.id,
            "title": paper.title,
            "authors": paper.authors,
            "summary": summary_text
        })
    
    return {"results": summaries}

@router.post("/insights")
def extract_insights(req: AIToolRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="Please select at least one paper")
    
    papers = db.query(Paper).filter(Paper.id.in_(req.paper_ids)).all()
    paper_descriptions = []
    for p in papers:
        paper_descriptions.append(f"- **{p.title}** by {p.authors}: {p.abstract}")

    context = "\n\n".join(paper_descriptions)
    prompt = f"Analyze these research papers and extract key insights, methodologies, emerging trends, and human responsibility/discipline considerations:\n\n{context}"

    insights_text = generate_chat_response([{"role": "user", "content": prompt}], context_str=context)
    return {"insights": insights_text, "paper_count": len(papers)}

@router.post("/literature-review")
def generate_literature_review(req: AIToolRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.paper_ids:
        raise HTTPException(status_code=400, detail="Please select at least one paper")
    
    papers = db.query(Paper).filter(Paper.id.in_(req.paper_ids)).all()
    paper_descriptions = []
    for p in papers:
        paper_descriptions.append(f"- **{p.title}** ({p.published_date}): {p.abstract}")

    context = "\n\n".join(paper_descriptions)
    prompt = f"Generate a comprehensive literature review synthesizing the following selected papers into structured sections: ### 1. Overview, ### 2. Key Findings, ### 3. Comparative Analysis, ### 4. Research Gaps & Future Directions.\n\n{context}"

    review_text = generate_chat_response([{"role": "user", "content": prompt}], context_str=context)
    return {"literature_review": review_text, "paper_count": len(papers)}
