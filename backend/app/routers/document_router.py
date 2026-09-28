import uuid
import shutil
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.schemas import DocumentResponse, DocumentQueryRequest
from app.config import UPLOAD_DIR
from app.database import get_db
from app.auth import get_current_user
from app.services.document_service import document_service
from app.services.rag_service import rag_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/documents", tags=["Documents & Knowledge Base"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".md"}

@router.get("", response_model=List[DocumentResponse])
def get_documents(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, filename, file_type, file_size, chunk_count, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    filename = file.filename
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    doc_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{doc_id}_{filename}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = save_path.stat().st_size

    # Extract text and chunk
    try:
        extracted_text = document_service.extract_text(save_path)
    except Exception as e:
        save_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not extract text from document: {str(e)}"
        )

    # Insert document record
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO documents (id, user_id, filename, file_type, file_path, file_size, chunk_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (doc_id, user_id, filename, ext, str(save_path), file_size, 0)
        )

    # Chunk and generate embeddings
    chunk_count = rag_service.index_document(doc_id, user_id, extracted_text)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, file_type, file_size, chunk_count, created_at FROM documents WHERE id = ?", (doc_id,))
        row = cursor.fetchone()
        return dict(row)

@router.delete("/{document_id}")
def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT file_path FROM documents WHERE id = ? AND user_id = ?", (document_id, user_id))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")

        file_path = Path(row["file_path"])
        file_path.unlink(missing_ok=True)

        cursor.execute("DELETE FROM documents WHERE id = ? AND user_id = ?", (document_id, user_id))
        cursor.execute("DELETE FROM knowledge_chunks WHERE document_id = ?", (document_id,))
        return {"success": True, "message": "Document and indexed vectors removed"}

@router.post("/query")
async def query_documents(
    query_req: DocumentQueryRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    top_k = query_req.top_k or 4

    matched_chunks = rag_service.search_knowledge(
        query_req.query,
        user_id=user_id,
        top_k=top_k,
        document_ids=query_req.document_ids
    )

    if not matched_chunks:
        return {
            "answer": "No relevant passages found in your indexed documents matching this query. Please ensure you have uploaded documents or broaden your search keywords.",
            "citations": []
        }

    context_str = "\n\n".join([
        f"[Source {i+1}: {c['filename']} (Chunk {c['chunk_index']})]\n{c['content']}"
        for i, c in enumerate(matched_chunks)
    ])

    prompt = f"""You are TechMate AI's Document Analysis and RAG Specialist.
Analyze the following retrieved source excerpts from the user's uploaded documents and answer their question with high fidelity.

Retrieved Document Excerpts:
{context_str}

User Question:
{query_req.query}

Format your answer with:
### Direct Answer
### Key Document Findings
### Verified Citations & References
"""
    answer_text = await ai_service.generate_response(prompt, "You are an expert RAG document assistant.")

    return {
        "answer": answer_text,
        "citations": [
            {
                "filename": c["filename"],
                "chunk_index": c["chunk_index"],
                "score": c["score"],
                "excerpt": c["content"][:180] + "..."
            }
            for c in matched_chunks
        ]
    }
