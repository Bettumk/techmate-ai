import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import InterviewStartRequest, InterviewAnswerRequest, InterviewSessionResponse
from app.database import get_db
from app.auth import get_current_user
from app.agents.interview_agent import interview_agent

router = APIRouter(prefix="/api/interview", tags=["Mock Interview"])

@router.post("/start", response_model=InterviewSessionResponse)
def start_interview(
    req: InterviewStartRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    session_id = str(uuid.uuid4())
    questions = interview_agent.get_questions_for_role(req.role, count=req.num_questions)

    if not questions:
        raise HTTPException(status_code=400, detail="Could not initialize questions for role")

    now = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO interview_sessions (id, user_id, role, difficulty, questions_json, current_index, transcript_json, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (session_id, user_id, req.role, req.difficulty, json.dumps(questions), 0, "[]", "in_progress", now)
        )

        return {
            "id": session_id,
            "role": req.role,
            "difficulty": req.difficulty,
            "current_index": 0,
            "total_questions": len(questions),
            "status": "in_progress",
            "current_question": {
                "index": 0,
                "question": questions[0]["question"],
                "type": questions[0]["type"]
            },
            "transcript": [],
            "final_evaluation": None,
            "created_at": now
        }

@router.post("/answer", response_model=InterviewSessionResponse)
async def submit_answer(
    req: InterviewAnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, role, difficulty, questions_json, current_index, transcript_json, status, created_at FROM interview_sessions WHERE id = ? AND user_id = ?",
            (req.session_id, user_id)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Interview session not found")

        if row["status"] == "completed":
            raise HTTPException(status_code=400, detail="Interview session already finished")

        questions = json.loads(row["questions_json"])
        current_idx = row["current_index"]
        transcript = json.loads(row["transcript_json"])

        current_q = questions[current_idx]

        # Evaluate candidate's answer
        evaluation = await interview_agent.evaluate_turn(current_q, req.answer, row["role"])

        # Record into transcript
        turn_record = {
            "question_index": current_idx,
            "question": current_q["question"],
            "user_answer": req.answer,
            "score": evaluation.get("score", 7),
            "feedback": evaluation.get("feedback", ""),
            "strengths": evaluation.get("strengths", []),
            "improvements": evaluation.get("improvements", []),
            "model_answer": evaluation.get("sample_improved_answer") or evaluation.get("model_answer", "")
        }
        transcript.append(turn_record)

        next_idx = current_idx + 1
        is_completed = (next_idx >= len(questions))
        new_status = "completed" if is_completed else "in_progress"

        final_evaluation = None
        if is_completed:
            avg_score = round(sum(t.get("score", 0) for t in transcript) / max(len(transcript), 1), 1)
            final_evaluation = {
                "overall_score": avg_score,
                "verdict": "Strong Candidate" if avg_score >= 8 else ("Hireable with Coaching" if avg_score >= 6 else "Needs Technical Foundations"),
                "summary": f"Completed mock interview for {row['role']}. You demonstrated foundational knowledge across {len(transcript)} technical and behavioral questions.",
                "total_answered": len(transcript)
            }

        cursor.execute(
            """
            UPDATE interview_sessions
            SET current_index = ?, transcript_json = ?, status = ?, final_evaluation_json = ?
            WHERE id = ?
            """,
            (next_idx, json.dumps(transcript), new_status, json.dumps(final_evaluation) if final_evaluation else None, req.session_id)
        )

        next_question = None
        if not is_completed:
            next_question = {
                "index": next_idx,
                "question": questions[next_idx]["question"],
                "type": questions[next_idx]["type"]
            }

        return {
            "id": row["id"],
            "role": row["role"],
            "difficulty": row["difficulty"],
            "current_index": next_idx,
            "total_questions": len(questions),
            "status": new_status,
            "current_question": next_question,
            "transcript": transcript,
            "final_evaluation": final_evaluation,
            "created_at": row["created_at"]
        }

@router.get("/sessions", response_model=List[InterviewSessionResponse])
def get_sessions(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, role, difficulty, questions_json, current_index, transcript_json, final_evaluation_json, status, created_at FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        sessions = []
        for r in rows:
            q_list = json.loads(r["questions_json"])
            trans = json.loads(r["transcript_json"]) if r["transcript_json"] else []
            final_eval = json.loads(r["final_evaluation_json"]) if r["final_evaluation_json"] else None
            curr_q = None
            if r["current_index"] < len(q_list) and r["status"] == "in_progress":
                curr_q = {
                    "index": r["current_index"],
                    "question": q_list[r["current_index"]]["question"],
                    "type": q_list[r["current_index"]]["type"]
                }
            sessions.append({
                "id": r["id"],
                "role": r["role"],
                "difficulty": r["difficulty"],
                "current_index": r["current_index"],
                "total_questions": len(q_list),
                "status": r["status"],
                "current_question": curr_q,
                "transcript": trans,
                "final_evaluation": final_eval,
                "created_at": r["created_at"]
            })
        return sessions
