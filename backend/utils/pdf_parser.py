import io
import pypdf

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extracts text content from PDF file bytes.
    """
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = []
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text.append(f"--- Page {page_idx + 1} ---\n{text}")
        return "\n\n".join(extracted_text) if extracted_text else "No text extracted from PDF."
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return f"PDF extraction failed: {str(e)}"
