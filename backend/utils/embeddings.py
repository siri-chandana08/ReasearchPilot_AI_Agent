from typing import List, Dict, Any

def create_research_context(papers: List[Dict[str, Any]], query: str) -> str:
    """
    Formats papers in workspace into structured prompt context for LLM reasoning.
    """
    if not papers:
        return "No papers imported into this workspace yet."
    
    context_parts = []
    for idx, p in enumerate(papers, 1):
        paper_text = f"""
[Paper {idx}]
Title: {p.get('title', 'Untitled')}
Authors: {p.get('authors', 'Unknown')}
Published Date: {p.get('published_date', 'N/A')}
Source: {p.get('source', 'Unknown')}
Abstract: {p.get('abstract', 'No abstract available')}
"""
        if p.get('full_text'):
            # Snippet of full text if available
            paper_text += f"Text Excerpt: {p.get('full_text')[:1000]}...\n"
            
        context_parts.append(paper_text)

    full_context = "\n---\n".join(context_parts)
    return f"Research Papers Context:\n{full_context}\n\nUser Query: {query}"
