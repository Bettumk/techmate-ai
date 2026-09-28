import json
import uuid
import math
import logging
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.services.ai_service import ai_service
from app.services.document_service import document_service

logger = logging.getLogger("techmate.rag")

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a, b in zip(vec1, vec1)))
    norm_b = math.sqrt(sum(b * b for a, b in zip(vec2, vec2)))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)

class RAGService:
    """Manages chunking, vector indexing, and semantic similarity search."""

    def index_document(self, document_id: str, user_id: str, text: str) -> int:
        chunks = document_service.chunk_text(text)
        if not chunks:
            return 0

        with get_db() as conn:
            cursor = conn.cursor()
            for idx, chunk_content in enumerate(chunks):
                chunk_id = str(uuid.uuid4())
                vector = ai_service.generate_embedding(chunk_content)
                cursor.execute(
                    """
                    INSERT INTO knowledge_chunks (id, document_id, user_id, chunk_index, content, vector_json)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (chunk_id, document_id, user_id, idx, chunk_content, json.dumps(vector))
                )

            # Update document chunk count
            cursor.execute(
                "UPDATE documents SET chunk_count = ? WHERE id = ?",
                (len(chunks), document_id)
            )

        logger.info(f"Indexed {len(chunks)} knowledge chunks for document {document_id}")
        return len(chunks)

    def search_knowledge(
        self,
        query: str,
        user_id: str,
        top_k: int = 4,
        document_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Performs semantic vector search across user knowledge chunks."""
        query_vec = ai_service.generate_embedding(query)
        q_lower = query.lower()
        query_words = set(query.lower().split())

        results = []
        with get_db() as conn:
            cursor = conn.cursor()
            if document_ids and len(document_ids) > 0:
                placeholders = ",".join(["?"] * len(document_ids))
                cursor.execute(
                    f"""
                    SELECT kc.id, kc.document_id, kc.chunk_index, kc.content, kc.vector_json, d.filename
                    FROM knowledge_chunks kc
                    JOIN documents d ON kc.document_id = d.id
                    WHERE kc.user_id = ? AND kc.document_id IN ({placeholders})
                    """,
                    [user_id] + document_ids
                )
            else:
                cursor.execute(
                    """
                    SELECT kc.id, kc.document_id, kc.chunk_index, kc.content, kc.vector_json, d.filename
                    FROM knowledge_chunks kc
                    JOIN documents d ON kc.document_id = d.id
                    WHERE kc.user_id = ?
                    """,
                    (user_id,)
                )

            rows = cursor.fetchall()

            for row in rows:
                try:
                    vec = json.loads(row["vector_json"])
                except Exception:
                    vec = []

                cos_sim = cosine_similarity(query_vec, vec)

                # Keyword bonus for exact term hits
                content_lower = row["content"].lower()
                keyword_hits = sum(1 for w in query_words if len(w) > 3 and w in content_lower)
                keyword_bonus = min(0.3, keyword_hits * 0.08)

                total_score = cos_sim + keyword_bonus

                results.append({
                    "chunk_id": row["id"],
                    "document_id": row["document_id"],
                    "filename": row["filename"],
                    "chunk_index": row["chunk_index"],
                    "content": row["content"],
                    "score": round(total_score, 4)
                })

        # Sort descending by score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

rag_service = RAGService()
