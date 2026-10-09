import httpx
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

async def query_arxiv(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Queries arXiv API via HTTPS with follow_redirects=True.
    Returns parsed paper objects or empty list on failure.
    """
    if not query or not query.strip():
        return []

    encoded_query = urllib.parse.quote(query.strip())
    url = f"https://export.arxiv.org/api/query?search_query=all:{encoded_query}&start=0&max_results={max_results}"
    results = []

    try:
        async with httpx.AsyncClient(verify=False, follow_redirects=True, timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                root = ET.fromstring(response.text)
                ns = {'atom': 'http://www.w3.org/2005/Atom'}

                for entry in root.findall('atom:entry', ns):
                    title_elem = entry.find('atom:title', ns)
                    title = title_elem.text.strip().replace('\n', ' ') if title_elem is not None and title_elem.text else "Untitled"

                    summary_elem = entry.find('atom:summary', ns)
                    summary = summary_elem.text.strip().replace('\n', ' ') if summary_elem is not None and summary_elem.text else "No abstract available."

                    published_elem = entry.find('atom:published', ns)
                    published = published_elem.text[:10] if published_elem is not None and published_elem.text else "N/A"

                    authors = []
                    for author in entry.findall('atom:author', ns):
                        name_elem = author.find('atom:name', ns)
                        if name_elem is not None and name_elem.text:
                            authors.append(name_elem.text.strip())

                    pdf_link = ""
                    link = ""
                    for l in entry.findall('atom:link', ns):
                        if l.attrib.get('type') == 'application/pdf':
                            pdf_link = l.attrib.get('href', '')
                        elif l.attrib.get('rel') == 'alternate':
                            link = l.attrib.get('href', '')

                    results.append({
                        "title": title,
                        "authors": ", ".join(authors) if authors else "Unknown Authors",
                        "abstract": summary,
                        "published_date": published,
                        "source": "arXiv",
                        "url": pdf_link or link or f"https://arxiv.org/abs/{encoded_query}"
                    })
    except Exception as e:
        print(f"arXiv API error for query '{query}': {e}")
        return []

    return results

async def query_pubmed(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Queries PubMed via NCBI E-utilities (esearch.fcgi -> esummary.fcgi) with the query string.
    Returns parsed paper objects or empty list on failure.
    """
    if not query or not query.strip():
        return []

    encoded_query = urllib.parse.quote(query.strip())
    search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={encoded_query}&retmode=json&retmax={max_results}"
    results = []

    try:
        async with httpx.AsyncClient(verify=False, follow_redirects=True, timeout=10.0) as client:
            search_res = await client.get(search_url)
            if search_res.status_code != 200:
                return []

            search_data = search_res.json()
            id_list = search_data.get("esearchresult", {}).get("idlist", [])

            if not id_list:
                return []

            id_str = ",".join(id_list)
            summary_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={id_str}&retmode=json"
            summary_res = await client.get(summary_url)
            if summary_res.status_code != 200:
                return []

            summary_data = summary_res.json().get("result", {})

            for pmid in id_list:
                item = summary_data.get(pmid, {})
                if not item or not isinstance(item, dict):
                    continue

                title = item.get("title", "Untitled").strip().rstrip(".")
                pubdate = item.get("pubdate", "N/A")

                authors_list = item.get("authors", [])
                authors = ", ".join([a.get("name", "") for a in authors_list if isinstance(a, dict)]) if authors_list else "Unknown Authors"

                first_author = item.get("sortfirstauthor", "")
                journal = item.get("source", "PubMed Journal")
                abstract = f"Article by {first_author}. Published in {journal}." if first_author else f"PubMed record {pmid} from {journal}."

                results.append({
                    "title": title,
                    "authors": authors,
                    "abstract": abstract,
                    "published_date": pubdate,
                    "source": "PubMed",
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                })
    except Exception as e:
        print(f"PubMed API error for query '{query}': {e}")
        return []

    return results

async def query_academic_databases(query: str, source: str = "all") -> List[Dict[str, Any]]:
    """
    Unified academic paper search combining arXiv and PubMed query results dynamically.
    """
    if not query or not query.strip():
        return []

    results = []

    if source in ("all", "arXiv"):
        arxiv_results = await query_arxiv(query)
        results.extend(arxiv_results)

    if source in ("all", "PubMed"):
        pubmed_results = await query_pubmed(query)
        results.extend(pubmed_results)

    return results
