import uuid
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.database import get_db
from app.auth import get_current_user
from app.agents.project_agent import project_agent

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, description, tech_stack, status, data_json, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        projects = []
        for r in rows:
            data = {}
            try:
                data = json.loads(r["data_json"]) if r["data_json"] else {}
            except Exception:
                pass
            projects.append({
                "id": r["id"],
                "title": r["title"],
                "description": r["description"] or "",
                "tech_stack": r["tech_stack"] or "",
                "status": r["status"] or "Planning",
                "data": data,
                "created_at": r["created_at"],
                "updated_at": r["updated_at"]
            })
        return projects

@router.post("", response_model=ProjectResponse)
def create_project(
    proj: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    proj_id = str(uuid.uuid4())
    default_data = {
        "architecture": "Client-Server / Layered Monolith or Microservices",
        "database": "Relational (PostgreSQL/SQLite)",
        "modules": ["Authentication", "Core API", "Data Processing", "UI Dashboard"]
    }

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO projects (id, user_id, title, description, tech_stack, status, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (proj_id, user_id, proj.title, proj.description or "", proj.tech_stack or "", "Planning", json.dumps(default_data))
        )
        cursor.execute("SELECT id, title, description, tech_stack, status, data_json, created_at, updated_at FROM projects WHERE id = ?", (proj_id,))
        row = cursor.fetchone()
        return {
            "id": row["id"],
            "title": row["title"],
            "description": row["description"] or "",
            "tech_stack": row["tech_stack"] or "",
            "status": row["status"],
            "data": default_data,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, description, tech_stack, status, data_json, created_at, updated_at FROM projects WHERE id = ? AND user_id = ?",
            (project_id, user_id)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        data = {}
        try:
            data = json.loads(row["data_json"]) if row["data_json"] else {}
        except Exception:
            pass

        return {
            "id": row["id"],
            "title": row["title"],
            "description": row["description"] or "",
            "tech_stack": row["tech_stack"] or "",
            "status": row["status"],
            "data": data,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }

@router.delete("/{project_id}")
def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"success": True, "message": "Project deleted"}
