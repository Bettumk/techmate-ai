import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from app.database import get_db
from app.auth import get_current_user
from app.agents.orchestrator import orchestrator
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["Chat & Conversations"])

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT c.id, c.title, c.mode, c.created_at, c.updated_at,
                   (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
            FROM conversations c
            WHERE c.user_id = ?
            ORDER BY c.updated_at DESC
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    conv_data: ConversationCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    conv_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    title = conv_data.title or "New Conversation"
    mode = conv_data.mode or "AUTO"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO conversations (id, user_id, title, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (conv_id, user_id, title, mode, now, now)
        )
        return {
            "id": conv_id,
            "title": title,
            "mode": mode,
            "created_at": now,
            "updated_at": now,
            "last_message": None
        }

@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, mode, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ?",
            (conversation_id, user_id)
        )
        conv = cursor.fetchone()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        cursor.execute(
            "SELECT id, conversation_id, role, content, mode, intent, metadata_json, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,)
        )
        msg_rows = cursor.fetchall()

        messages = []
        for m in msg_rows:
            meta = {}
            try:
                meta = json.loads(m["metadata_json"]) if m["metadata_json"] else {}
            except Exception:
                pass
            messages.append({
                "id": m["id"],
                "conversation_id": m["conversation_id"],
                "role": m["role"],
                "content": m["content"],
                "mode": m["mode"],
                "intent": m["intent"],
                "metadata": meta,
                "created_at": m["created_at"]
            })

        return {
            "conversation": dict(conv),
            "messages": messages
        }

@router.put("/conversations/{conversation_id}")
def rename_conversation(
    conversation_id: str,
    body: Dict[str, str],
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    new_title = body.get("title", "").strip()
    if not new_title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            (new_title, conversation_id, user_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"success": True, "title": new_title}

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM conversations WHERE id = ? AND user_id = ?",
            (conversation_id, user_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"success": True, "message": "Conversation deleted"}

@router.post("/chat", response_model=MessageResponse)
async def chat_message(
    msg_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    user_query = msg_data.content.strip()
    mode = msg_data.mode or "AUTO"
    now_str = datetime.now(timezone.utc).isoformat()

    if not user_query:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    conv_id = msg_data.conversation_id
    with get_db() as conn:
        cursor = conn.cursor()

        # If no conversation exists, create one
        if not conv_id:
            conv_id = str(uuid.uuid4())
            conv_title = user_query[:40] + ("..." if len(user_query) > 40 else "")
            cursor.execute(
                "INSERT INTO conversations (id, user_id, title, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (conv_id, user_id, conv_title, mode, now_str, now_str)
            )
        else:
            cursor.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user_id))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Conversation not found")

        # Fetch recent conversation history for chat memory
        cursor.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 6",
            (conv_id,)
        )
        history_rows = cursor.fetchall()
        history = [{"role": r["role"], "content": r["content"]} for r in reversed(history_rows)]

        # Fetch active project context if specified
        project_context = None
        if msg_data.project_id:
            cursor.execute("SELECT title, description, tech_stack FROM projects WHERE id = ? AND user_id = ?", (msg_data.project_id, user_id))
            p_row = cursor.fetchone()
            if p_row:
                project_context = dict(p_row)

        # Insert user message into DB
        user_msg_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO messages (id, conversation_id, role, content, mode, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_msg_id, conv_id, "user", user_query, mode, now_str)
        )

    # Check RAG Knowledge Base for semantic context
    retrieved_knowledge = None
    try:
        matched_chunks = rag_service.search_knowledge(user_query, user_id=user_id, top_k=2)
        if matched_chunks and matched_chunks[0]["score"] > 0.4:
            retrieved_knowledge = "\n\n".join([
                f"[Document: {c['filename']}]: {c['content']}"
                for c in matched_chunks
            ])
    except Exception:
        pass

    # Orchestrator handles intent routing, reasoning, and response generation
    orchestrator_result = await orchestrator.process_request(
        query=user_query,
        mode=mode,
        conversation_history=history,
        project_context=project_context,
        exam_params=msg_data.exam_params,
        retrieved_knowledge=retrieved_knowledge,
        user_profile=current_user.get("profile")
    )

    assistant_msg_id = str(uuid.uuid4())
    assistant_content = orchestrator_result.get("content", "")
    intent = orchestrator_result.get("intent", "GENERAL_TECHNOLOGY")
    meta = orchestrator_result.get("metadata", {})

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO messages (id, conversation_id, role, content, mode, intent, metadata_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (assistant_msg_id, conv_id, "assistant", assistant_content, mode, intent, json.dumps(meta), now_str)
        )

        # Update conversation updated_at
        cursor.execute(
            "UPDATE conversations SET updated_at = ? WHERE id = ?",
            (now_str, conv_id)
        )

    return {
        "id": assistant_msg_id,
        "conversation_id": conv_id,
        "role": "assistant",
        "content": assistant_content,
        "mode": mode,
        "intent": intent,
        "metadata": meta,
        "created_at": now_str
    }
