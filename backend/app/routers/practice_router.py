import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import PracticeStartRequest, PracticeSubmitRequest, PracticeSessionResponse
from app.database import get_db
from app.auth import get_current_user
from app.agents.practice_agent import practice_agent

router = APIRouter(prefix="/api/practice", tags=["Practice & Quizzes"])

@router.post("/start", response_model=PracticeSessionResponse)
def start_practice(
    req: PracticeStartRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    session_id = str(uuid.uuid4())
    questions = practice_agent.get_practice_set(req.topic, req.difficulty, count=req.count)

    # Sanitize questions for client (do not reveal correct answers upfront)
    client_questions = []
    for q in questions:
        client_questions.append({
            "id": q["id"],
            "question": q["question"],
            "type": q["type"],
            "options": q.get("options", [])
        })

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO practice_sessions (id, user_id, topic, difficulty, question_type, questions_json, user_answers_json, score, total, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (session_id, user_id, req.topic, req.difficulty, req.question_type, json.dumps(questions), "[]", 0, len(questions), "in_progress")
        )

        return {
            "id": session_id,
            "topic": req.topic,
            "difficulty": req.difficulty,
            "question_type": req.question_type,
            "questions": client_questions,
            "score": 0,
            "total": len(questions),
            "status": "in_progress",
            "results": None
        }

@router.post("/submit", response_model=PracticeSessionResponse)
def submit_practice(
    req: PracticeSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, topic, difficulty, question_type, questions_json, score, total, status FROM practice_sessions WHERE id = ? AND user_id = ?",
            (req.session_id, user_id)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Practice session not found")

        questions = json.loads(row["questions_json"])
        eval_result = practice_agent.evaluate_answers(questions, req.answers)

        cursor.execute(
            """
            UPDATE practice_sessions
            SET user_answers_json = ?, score = ?, status = 'completed'
            WHERE id = ?
            """,
            (json.dumps(req.answers), eval_result["score"], req.session_id)
        )

        # Build clean response
        client_questions = [{"id": q["id"], "question": q["question"], "options": q.get("options", [])} for q in questions]

        return {
            "id": row["id"],
            "topic": row["topic"],
            "difficulty": row["difficulty"],
            "question_type": row["question_type"],
            "questions": client_questions,
            "score": eval_result["score"],
            "total": eval_result["total"],
            "status": "completed",
            "results": eval_result["results"]
        }

@router.get("/sessions")
def get_practice_sessions(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, topic, difficulty, question_type, score, total, status, created_at FROM practice_sessions WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
