# TechMate AI — Intelligent CSE, Coding and Career Assistant

> **Learn. Build. Code. Grow.**

TechMate AI is a production-quality, multi-agent technology mentor built specifically for Computer Science students, software engineers, and programming beginners. Rather than acting as a simple generic chat wrapper, TechMate is an intelligent orchestrator agent that classifies user intent, routes tasks to specialized capabilities, performs Retrieval-Augmented Generation (RAG) over uploaded technical notes, and provides high-depth, structured responses.

---

## Table of Contents
1. [Core Capabilities & Features](#core-capabilities--features)
2. [Agent Architecture](#agent-architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites & Installation](#prerequisites--installation)
6. [Environment Variables](#environment-variables)
7. [Running Locally](#running-locally)
8. [Testing & Verification](#testing--verification)
9. [API Documentation](#api-documentation)
10. [Future Enhancements](#future-enhancements)

---

## Core Capabilities & Features

TechMate AI provides dedicated specialized agents and interactive workbenches:

1. **Intelligent Orchestration & Auto Intent Detection**:
   - Classifies queries into 14 distinct engineering intents: `CODING`, `DEBUGGING`, `DSA`, `CSE_SUBJECT`, `EXAM_PREPARATION`, `PROJECT_DEVELOPMENT`, `CAREER`, `RESUME`, `TECHNICAL_INTERVIEW`, `HR_INTERVIEW`, `MOCK_INTERVIEW`, `LEARNING_ROADMAP`, `PROJECT_DOCUMENTATION`, `GENERAL_TECHNOLOGY`.
2. **Coding & Debugging Workbench**:
   - Supports Python, C++, Java, JavaScript, TypeScript, C, SQL, React, and Django.
   - Outputs Approach, Idiomatic Clean Code, Line-by-Line Explanation, and Time & Space Complexity ($O(N)$, $O(\log N)$).
   - Root-cause debugging without hallucinating error traces.
3. **Data Structures & Algorithms (DSA) Mentor**:
   - Arrays, Trees, Graphs, Dynamic Programming, Sliding Window, Tries, Heaps, and Backtracking.
   - Step-by-step example walkthroughs, algorithm pseudocode, and common pitfall checklists.
4. **University Exam Preparation Mode (15-Mark Rubric)**:
   - Formulates university examination answers matching scoring rubrics.
   - Structured into: Definition, Introduction, Technical Explanation, Classifications/Phases, Worked Example, Architectural Diagram (ASCII/Mermaid), Advantages, Limitations, Applications, and Conclusion.
5. **Software Project Studio with Context Memory**:
   - End-to-end project lifecycle: Problem Statements, Requirements, Tech Stack Rationale, 3-Tier Architecture Blueprints, Database Schemas, REST APIs, Directory Trees, and External Examiner Viva Voce Defense questions.
   - Retains conversation project context across multi-turn queries.
6. **Actionable Career Roadmaps & Skill-Gap Analysis**:
   - Phased milestone progression trees for Backend, Frontend, Full Stack, and AI/ML engineers.
   - Tangible portfolio project blueprints and GitHub repository optimization criteria.
7. **Resume Reviewer & ATS Optimizer**:
   - Audits technical keywords, parser readability, and transforms weak bullets into quantifiable impact using the Google **XYZ Formula** (*Accomplished [X] as measured by [Y] by doing [Z]*).
8. **Interactive Turn-by-Turn Mock Interview Simulator**:
   - Role-based interviews (Software Developer, Python Developer, Backend, Frontend, AI/ML).
   - Turn-by-turn question delivery (does not reveal future questions before answering).
   - Real-time scoring, constructive strengths/improvements feedback, and final hiring committee evaluation report.
9. **Practice Arena & Quizzes**:
   - Interactive multiple-choice and conceptual quizzes across Data Structures, Algorithms, DBMS, and Operating Systems with instant feedback.
10. **Knowledge Base & Semantic RAG Search**:
    - Upload study notes and textbook chapters in PDF, DOCX, TXT, and Markdown.
    - Automatic chunking and semantic vector similarity search with verified document citations.

---

## Agent Architecture

```text
                               +-----------------------------+
                               |            USER             |
                               +-----------------------------+
                                              |
                                              v
                               +-----------------------------+
                               |    TECHMATE ORCHESTRATOR    |
                               +-----------------------------+
                                              |
                                              v
                               +-----------------------------+
                               |      INTENT DETECTION       |
                               | (Auto-routing & Mode Lock)  |
                               +-----------------------------+
                                              |
        +-------------------------------------+-------------------------------------+
        |                 |                   |                   |                 |
        v                 v                   v                   v                 v
+---------------+ +---------------+ +-------------------+ +---------------+ +---------------+
| Coding Agent  | |   DSA Agent   | |  CSE Exam Agent   | | Project Agent | | Interview/RAG |
+---------------+ +---------------+ +-------------------+ +---------------+ +---------------+
        |                 |                   |                   |                 |
        +-------------------------------------+-------------------------------------+
                                              |
                                              v
                               +-----------------------------+
                               |     KNOWLEDGE RETRIEVAL     |
                               | (RAG Vectors + Chat Memory) |
                               +-----------------------------+
                                              |
                                              v
                               +-----------------------------+
                               |   MULTI-PROVIDER REASONING  |
                               | (Gemini / OpenAI / Local)   |
                               +-----------------------------+
                                              |
                                              v
                               +-----------------------------+
                               |    STANDARDIZED RESPONSE    |
                               +-----------------------------+
```

---

## Technology Stack

- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT), Bcrypt, PyPDF, Python-Docx, HTTPX.
- **Database**: SQLite3 in WAL (Write-Ahead Logging) mode with foreign keys and multi-index optimization.
- **AI Abstraction Layer**: Pluggable provider supporting Google Gemini API (`gemini-1.5-flash`), OpenAI API (`gpt-4o-mini`), and an intelligent local deterministic fallback engine ensuring 100% testable uptime without external keys.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React-Markdown, Remark-GFM.

---

## Folder Structure

```text
jolly-pascal/
├── backend/
│   ├── app/
│   │   ├── agents/               # Specialized AI agents
│   │   │   ├── coding_agent.py
│   │   │   ├── dsa_agent.py
│   │   │   ├── cse_subject_agent.py
│   │   │   ├── exam_agent.py
│   │   │   ├── project_agent.py
│   │   │   ├── career_agent.py
│   │   │   ├── resume_agent.py
│   │   │   ├── interview_agent.py
│   │   │   ├── practice_agent.py
│   │   │   └── orchestrator.py    # Master coordinator
│   │   ├── routers/              # Clean REST API endpoints
│   │   │   ├── auth_router.py
│   │   │   ├── chat_router.py
│   │   │   ├── project_router.py
│   │   │   ├── document_router.py
│   │   │   ├── interview_router.py
│   │   │   ├── practice_router.py
│   │   │   └── profile_router.py
│   │   ├── services/             # Core RAG, Document, and AI providers
│   │   │   ├── ai_service.py
│   │   │   ├── document_service.py
│   │   │   └── rag_service.py
│   │   ├── auth.py               # Bcrypt & JWT token management
│   │   ├── config.py             # Environment configuration
│   │   ├── database.py           # SQLite schema and connections
│   │   ├── models.py
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── seed_data.py          # Demo data initializer
│   │   └── main.py               # FastAPI application entrypoint
│   ├── tests/
│   │   ├── test_api.py           # Unit and integration tests
│   │   └── verify_flows.py       # Full end-to-end 7 user flows test
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/           # UI Views and Modals
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ChatView.tsx
│   │   │   ├── StudyExamView.tsx
│   │   │   ├── CodingView.tsx
│   │   │   ├── ProjectView.tsx
│   │   │   ├── CareerView.tsx
│   │   │   ├── ResumeView.tsx
│   │   │   ├── InterviewView.tsx
│   │   │   ├── PracticeView.tsx
│   │   │   ├── KnowledgeBaseView.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   └── ProfileModal.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites & Installation

### 1. Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18.0 or higher
- **npm**: 9.0 or higher

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env from template
copy .env.example .env
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Compile production bundle
npm run build
```

---

## Environment Variables

Configure `.env` in the root or `backend/` directory:

```ini
PORT=8000
HOST=0.0.0.0
SECRET_KEY=your-production-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=sqlite:///./techmate.db

# Storage
UPLOAD_DIR=./uploads

# AI Provider Settings (Optional)
# If left empty, TechMate uses its intelligent built-in multi-agent reasoning engine.
AI_PROVIDER=auto
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

## Running Locally

### Option A: Unified Full-Stack Server (Recommended)
FastAPI serves both the REST API on `/api` and the compiled production React SPA on `/`:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open **`http://localhost:8000`** in your browser.

### Option B: Development Mode with Hot-Reloading
Run backend:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Run frontend in a separate terminal:
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** (Vite automatically proxies `/api` calls to `http://127.0.0.1:8000`).

---

## Testing & Verification

TechMate AI includes automated unit, integration, and user flow verification suites:

### 1. Unit & Integration API Tests
```bash
python backend/tests/test_api.py
```
Tests:
- Authentication & JWT token generation
- 1-Click demo access
- Chat API & Intent classification
- Project CRUD operations
- Turn-by-turn mock interview flow
- Practice quiz grading
- Edge cases (empty queries, invalid UUIDs, unauthorized requests)

### 2. End-to-End User Flows Test (7 Flows)
```bash
python backend/tests/verify_flows.py
```
Verifies:
- **Flow 1**: User Registration $\rightarrow$ Login $\rightarrow$ Dashboard $\rightarrow$ Start Chat $\rightarrow$ Intent Routing
- **Flow 2**: Coding Workbench $\rightarrow$ Code Input $\rightarrow$ Bug Analysis
- **Flow 3**: Study Mode $\rightarrow$ 15-Mark University Answer Formatting
- **Flow 4**: Project Studio $\rightarrow$ Architecture Blueprint $\rightarrow$ Project Context Memory
- **Flow 5**: Career Roadmaps $\rightarrow$ Phased Milestone Progression
- **Flow 6**: Interactive Mock Interview $\rightarrow$ Turn-by-turn Question/Answer/Evaluation
- **Flow 7**: PDF/Notes Upload $\rightarrow$ Vector Chunking $\rightarrow$ Semantic RAG Q&A with Citations

---

## API Documentation

When the backend is running, access interactive OpenAPI/Swagger documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

Core Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |
| `POST` | `/api/auth/demo` | 1-Click test-drive access |
| `GET` | `/api/conversations` | List user conversation history |
| `POST` | `/api/chat` | Send message, detect intent, route to agent |
| `POST` | `/api/projects` | Register project & maintain architecture context |
| `POST` | `/api/documents/upload` | Upload & index PDF, DOCX, TXT into RAG store |
| `POST` | `/api/documents/query` | Semantic vector query over uploaded docs |
| `POST` | `/api/interview/start` | Start interactive mock interview session |
| `POST` | `/api/interview/answer` | Evaluate candidate response & return feedback |
| `POST` | `/api/practice/start` | Generate technical quiz questions |
| `POST` | `/api/practice/submit` | Grade practice answers with explanations |

---

## Future Enhancements
- Voice input / speech-to-text for mock interviews.
- Code execution sandbox (WebAssembly / Pyodide / Docker runner).
- Direct GitHub OAuth & repository portfolio auditing.
- Multi-language localization (including Kannada & Hindi technical glossaries).
