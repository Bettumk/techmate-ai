import uuid
import json
import logging
from datetime import datetime, timezone
from app.database import get_db
from app.auth import hash_password

logger = logging.getLogger("techmate.seed")

def seed_demo_data():
    """Populates initial sample conversations, projects, and study roadmaps."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if demo user exists
        demo_email = "demo@techmate.ai"
        cursor.execute("SELECT id FROM users WHERE email = ?", (demo_email,))
        row = cursor.fetchone()

        if not row:
            user_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO users (id, email, hashed_password, full_name) VALUES (?, ?, ?, ?)",
                (user_id, demo_email, hash_password("demo123456"), "Alex Mercer (CSE Student)")
            )
            cursor.execute(
                """
                INSERT INTO profiles (user_id, education_level, primary_language, experience_level, career_goal, preferred_style)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (user_id, "B.Tech CSE - 3rd Year", "Python & C++", "Intermediate", "Full Stack AI Engineer", "Practical with Code")
            )
        else:
            user_id = row["id"]

        # Check if conversations exist for demo user
        cursor.execute("SELECT COUNT(*) as cnt FROM conversations WHERE user_id = ?", (user_id,))
        count = cursor.fetchone()["cnt"]

        if count == 0:
            now = datetime.now(timezone.utc).isoformat()

            # Conversation 1: Binary Search
            c1_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO conversations (id, user_id, title, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (c1_id, user_id, "Explain Binary Search & Complexity", "DSA", now, now)
            )
            cursor.execute(
                """
                INSERT INTO messages (id, conversation_id, role, content, mode, intent, created_at)
                VALUES (?, ?, 'user', 'Explain Binary Search with time complexity and step-by-step example.', 'DSA', 'DSA', ?)
                """,
                (str(uuid.uuid4()), c1_id, now)
            )
            cursor.execute(
                """
                INSERT INTO messages (id, conversation_id, role, content, mode, intent, created_at)
                VALUES (?, ?, 'assistant', '### Problem Understanding\nBinary Search locates a target in a sorted collection by repeatedly dividing the search space in half.\n\n### Complexity\n- **Time**: $O(\\log N)$\n- **Space**: $O(1)$ iterative\n\n### Working Code\n```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n```', 'DSA', 'DSA', ?)
                """,
                (str(uuid.uuid4()), c1_id, now)
            )

            # Conversation 2: AI Attendance Project
            c2_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO conversations (id, user_id, title, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (c2_id, user_id, "AI-Based Smart Attendance System", "PROJECT", now, now)
            )
            cursor.execute(
                """
                INSERT INTO messages (id, conversation_id, role, content, mode, intent, created_at)
                VALUES (?, ?, 'user', 'Help me build an AI-based attendance system using facial recognition.', 'PROJECT', 'PROJECT_DEVELOPMENT', ?)
                """,
                (str(uuid.uuid4()), c2_id, now)
            )
            cursor.execute(
                """
                INSERT INTO messages (id, conversation_id, role, content, mode, intent, created_at)
                VALUES (?, ?, 'assistant', '### System Architecture Blueprint\n```text\n[Webcam Stream] -> [FastAPI Server (InsightFace)] -> [PostgreSQL + pgvector] -> [React Dashboard]\n```\n\n### Recommended Tech Stack\n- **Backend**: FastAPI (Python 3.12)\n- **Vision Model**: InsightFace / ArcFace with MediaPipe\n- **Database**: PostgreSQL with `pgvector` index\n- **Frontend**: React + Tailwind CSS', 'PROJECT', 'PROJECT_DEVELOPMENT', ?)
                """,
                (str(uuid.uuid4()), c2_id, now)
            )

            # Seed Demo Project in Projects table
            cursor.execute("SELECT COUNT(*) as pcnt FROM projects WHERE user_id = ?", (user_id,))
            if cursor.fetchone()["pcnt"] == 0:
                p_id = str(uuid.uuid4())
                cursor.execute(
                    """
                    INSERT INTO projects (id, user_id, title, description, tech_stack, status, data_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        p_id,
                        user_id,
                        "AI-Based Smart Attendance System",
                        "Automated facial recognition attendance platform with real-time video stream ingestion and proxy detection.",
                        "FastAPI, OpenCV, InsightFace, PostgreSQL, React",
                        "Active Development",
                        json.dumps({
                            "architecture": "Edge RTSP Video -> FastAPI Ingestion -> Vector Cosine Similarity -> React Admin",
                            "viva_prepared": True
                        }),
                        now,
                        now
                    )
                )

        logger.info("Demo seed data verified.")
