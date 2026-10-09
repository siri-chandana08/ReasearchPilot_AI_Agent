import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    title = Column(String, nullable=False)
    authors = Column(Text, nullable=True)  # Comma separated or JSON string
    published_date = Column(String, nullable=True)
    abstract = Column(Text, nullable=True)
    source = Column(String, default="arXiv")  # arXiv, PubMed, Uploaded
    url = Column(String, nullable=True)
    pdf_path = Column(String, nullable=True)
    full_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="papers")
