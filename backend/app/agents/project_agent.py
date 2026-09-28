import json
from typing import Dict, Any, Optional
from app.services.ai_service import ai_service
from app.database import get_db

class ProjectAgent:
    """Specialized Agent for Software Project Development & Engineering Lifecycle."""

    SYSTEM_PROMPT = """You are TechMate AI's Specialized Project Development Agent.
You mentor Computer Science and engineering students through end-to-end software development lifecycle:
1. Idea & Problem Formulation
2. Functional & Non-Functional Requirements
3. Tech Stack Selection
4. High-Level & Low-Level System Architecture
5. Database Schema & ERD
6. REST API Design
7. Folder Structure
8. Implementation & Code Modules
9. Testing Strategy
10. Deployment (Docker, Cloud, CI/CD)
11. Viva Voce Questions & Answers for College Defense

Always maintain context regarding the specific project under discussion (e.g. tech stack, domain, architecture).
"""

    async def handle_project(
        self,
        query: str,
        project_context: Optional[Dict[str, Any]] = None,
        conversation_context: Optional[str] = None,
        user_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Handles project ideation, architectural design, database modeling, and viva prep."""

        context_summary = ""
        if project_context:
            context_summary += f"Active Project Title: {project_context.get('title', 'Untitled')}\n"
            context_summary += f"Description: {project_context.get('description', '')}\n"
            context_summary += f"Tech Stack: {project_context.get('tech_stack', '')}\n"

        prompt = f"""User Project Query: {query}

Project Context Known So Far:
{context_summary}

Recent Conversation History:
{conversation_context or 'None'}

Please provide comprehensive, production-grade project assistance tailored to this project.
If this is a new project initiation, provide:
### Project Overview & Problem Statement
### Core Objectives
### Functional & Non-Functional Requirements
### Recommended Tech Stack & Rationale
### System Architecture Blueprint
### Database Schema Design
### Core REST API Endpoints
### Standard Directory Structure
### Step-by-Step Implementation Roadmap
### Top Viva Voce Questions & Answers
"""
        response_text = await ai_service.generate_response(prompt, self.SYSTEM_PROMPT, context=context_summary)

        if "### Project Overview" not in response_text and "### System Architecture" not in response_text:
            response_text = self._generate_structured_project_response(query, project_context)

        return {
            "agent": "ProjectAgent",
            "intent": "PROJECT_DEVELOPMENT",
            "content": response_text,
            "metadata": {
                "active_project": project_context.get("title") if project_context else None
            }
        }

    def _generate_structured_project_response(self, query: str, project_context: Optional[Dict[str, Any]]) -> str:
        proj_title = project_context.get("title") if project_context else "AI-Based Smart Attendance System"
        tech_stack = project_context.get("tech_stack") if project_context else "Python, OpenCV, FastAPI, React, PostgreSQL"

        q_lower = query.lower()
        if "model" in q_lower or "algorithm" in q_lower or "which model" in q_lower:
            return f"""### Recommended Models for {proj_title}
Based on the operational requirements of **{proj_title}** ({tech_stack}):

1. **Primary Model Recommendation: FaceNet / InsightFace (ResNet-50 / ArcFace backbone)**
   - **Why**: Yields 99.6% accuracy on LFW benchmark, produces 512-dimensional normalized embeddings invariant to mild pose and illumination changes.
   - **Inference Speed**: ~25ms on CPU / ~4ms on GPU with ONNX Runtime.

2. **Detection Layer: MTCNN or RetinaFace**
   - **Why**: Robust bounding box localization with 5-point facial landmark alignment (eyes, nose, mouth corners) before feeding into the embedding extractor.

3. **Classification / Matching: Cosine Similarity with KD-Tree / HNSW index**
   - Rather than retraining a softmax classifier for every new student, store student embeddings in PostgreSQL (using `pgvector`) or FAISS.
   - Match condition: Distance threshold $\\tau \\le 0.45$.

```python
import numpy as np

def verify_student(embedding_query, student_gallery, threshold=0.45):
    # Cosine distance computation
    dot = np.dot(student_gallery, embedding_query)
    norms = np.linalg.norm(student_gallery, axis=1) * np.linalg.norm(embedding_query)
    sims = dot / norms
    best_idx = np.argmax(sims)
    if sims[best_idx] >= (1.0 - threshold):
        return {{"matched": True, "student_id": best_idx, "confidence": float(sims[best_idx])}}
    return {{"matched": False, "student_id": None}}
```
"""

        # Complete Project Blueprint
        return f"""### Project Overview & Problem Statement
**Title**: {proj_title}
**Problem**: Traditional manual attendance systems (paper rosters, RFID swipes) are susceptible to proxy entries, human recording errors, and high operational friction in educational institutions.
**Solution**: An automated facial recognition attendance management system leveraging edge camera feeds, deep feature representations, and real-time dashboard analytics.

---

### Core Objectives
1. Perform real-time face detection, alignment, and identification across live video streams.
2. Automate roll-call logging into an ACID-compliant relational database with tamper-proof timestamps.
3. Provide intuitive web portals for professors, students, and department heads with downloadable CSV/PDF reports.

---

### Functional & Non-Functional Requirements
- **Functional**:
  - Student registration with multi-angle portrait capture.
  - Classroom kiosk live stream frame extraction and attendance logging.
  - Proxy detection via liveness verification (blink detection / head-pose perturbation).
  - Analytical reports with absenteeism alert notifications.
- **Non-Functional**:
  - **Latency**: Detection and matching within $< 1.5$ seconds per student.
  - **Security**: Facial embeddings hashed/encrypted at rest; GDPR/FERPA compliance.
  - **Availability**: 99.9% uptime during active college operating hours.

---

### Recommended Tech Stack & Rationale
| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React + Tailwind CSS | Fast responsive single-page application for student/faculty dashboards |
| **Backend** | FastAPI (Python 3.12) | Native high-concurrency async support with automatic OpenAPI documentation |
| **AI / Vision** | OpenCV + MediaPipe / InsightFace | State-of-the-art landmark extraction and embedded ArcFace weights |
| **Database** | PostgreSQL + pgvector | Relational consistency for academic records with native vector similarity search |
| **Deployment** | Docker & Nginx | Containerized microservice isolation and reverse proxy SSL termination |

---

### System Architecture Blueprint
```text
+-------------------+       +---------------------+       +---------------------+
| Classroom Camera  | ----> |   FastAPI Server    | ----> | InsightFace Model   |
| (RTSP Stream)     |       | (Frame Ingestion)   |       | (Feature Extractor) |
+-------------------+       +---------------------+       +---------------------+
                                       |                             |
                                       v                             v
+-------------------+       +---------------------+       +---------------------+
| React Web Portal  | <---- | REST & WebSocket API| <---- | PostgreSQL Database |
| (Faculty / Admin) |       | (Auth / Analytics)  |       | (Students & Vectors)|
+-------------------+       +---------------------+       +---------------------+
```

---

### Database Schema Design (PostgreSQL)
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE students (
    id VARCHAR(20) PRIMARY KEY, -- USN / Roll No
    full_name VARCHAR(120) NOT NULL,
    department_id INT REFERENCES departments(id),
    face_embedding vector(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance_records (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PRESENT',
    confidence_score FLOAT NOT NULL,
    UNIQUE(student_id, session_date)
);
```

---

### Core REST API Endpoints
- `POST /api/auth/login`: JWT login for professors and administrators.
- `POST /api/students/register`: Upload student profile and enroll facial embedding vector.
- `POST /api/attendance/recognize-frame`: Process webcam snapshot and log attendance match.
- `GET /api/attendance/daily-report?date=YYYY-MM-DD`: Export class attendance ledger.

---

### Standard Directory Structure
```text
attendance-ai-system/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # FastAPI routers (auth, students, attendance)
│   │   ├── core/config.py       # JWT & environment settings
│   │   ├── db/session.py        # SQLAlchemy engine & pgvector session
│   │   ├── vision/              # FaceNet / ArcFace inference pipelines
│   │   └── main.py              # Application entrypoint
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/components/          # VideoFeed, StudentTable, StatsCard
│   ├── src/pages/               # Dashboard, EnrollStudent, Reports
│   └── package.json
└── docker-compose.yml
```

---

### Top Viva Voce Questions & Answers
1. **Q: How does your system prevent photo / phone-screen spoofing (proxy)?**
   - *A*: We implement a passive liveness detection module calculating eye aspect ratio (EAR) to require genuine eye blinks, combined with texture gradient analysis to detect 2D screen reflections.
2. **Q: Why use vector embeddings instead of retraining a CNN when a new student joins?**
   - *A*: Retraining a deep CNN for every new registrant requires immense GPU compute and causes catastrophic forgetting. FaceNet extracts universal metric embeddings; adding a student is simply inserting a new 512-dimension vector into the database (\\(O(1)\\) time).
3. **Q: What is the computational complexity of matching a student?**
   - *A*: With an HNSW or KD-Tree index over $N$ registered students, retrieval complexity is $O(\\log N)$, compared to $O(N)$ for brute-force linear scanning.
"""

project_agent = ProjectAgent()
