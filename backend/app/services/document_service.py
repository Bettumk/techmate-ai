import os
import re
from pathlib import Path
from typing import List, Dict, Any
from pypdf import PdfReader
from docx import Document as DocxDocument

class DocumentService:
    """Handles text extraction and chunking across PDF, DOCX, TXT, and Markdown files."""

    def extract_text(self, file_path: Path) -> str:
        suffix = file_path.suffix.lower()

        if suffix == ".pdf":
            reader = PdfReader(str(file_path))
            text_parts = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"[Page {i+1}]\n{page_text}")
            return "\n\n".join(text_parts)

        elif suffix in [".docx", ".doc"]:
            doc = DocxDocument(str(file_path))
            return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])

        elif suffix in [".txt", ".md", ".markdown", ".csv", ".json"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

        else:
            raise ValueError(f"Unsupported file type: {suffix}")

    def chunk_text(self, text: str, chunk_size: int = 600, overlap: int = 80) -> List[str]:
        """Splits long text into overlapping semantic passages."""
        # Clean whitespace
        cleaned = re.sub(r"\s+", " ", text).strip()
        if not cleaned:
            return []

        chunks = []
        start = 0
        text_length = len(cleaned)

        while start < text_length:
            end = start + chunk_size
            if end >= text_length:
                chunks.append(cleaned[start:])
                break

            # Try to break on sentence boundary
            boundary = cleaned.rfind(". ", start, end)
            if boundary == -1 or boundary <= start:
                boundary = cleaned.rfind(" ", start, end)
            if boundary == -1 or boundary <= start:
                boundary = end

            chunks.append(cleaned[start:boundary].strip())
            start = max(boundary - overlap, start + 1)

        return [c for c in chunks if len(c) > 20]

document_service = DocumentService()
