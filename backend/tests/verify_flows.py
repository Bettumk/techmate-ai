import httpx
import uuid
import sys
from pathlib import Path

# Fix Windows console utf-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.seed_data import seed_demo_data

def get_client():
    init_db()
    seed_demo_data()
    return TestClient(app, base_url="http://testserver/api")

def test_all_user_flows():
    print("==================================================")
    print("TECHMATE AI — FULL END-TO-END FLOW VERIFICATION")
    print("==================================================")

    client = get_client()

    # ---------------------------------------------------------
    # FLOW 1: Registration, Login, Dashboard, & Auto Chat
    # ---------------------------------------------------------
    print("\n--- Testing FLOW 1: Auth, Dashboard & Auto Intent Chat ---")
    test_user_email = f"student_{uuid.uuid4().hex[:6]}@techmate.edu"
    reg_resp = client.post("/auth/register", json={
        "email": test_user_email,
        "password": "PassWord123!",
        "full_name": "Jordan Smith"
    })
    assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Registered user {test_user_email}")

    # Me & Profile
    me_resp = client.get("/auth/me", headers=headers)
    assert me_resp.status_code == 200
    print(f"✓ Verified profile: {me_resp.json()['full_name']}")

    # Start chat with CSE subject
    chat1 = client.post("/chat", json={
        "content": "Explain Deadlock in Operating Systems simply with real world analogy",
        "mode": "AUTO"
    }, headers=headers)
    assert chat1.status_code == 200
    c1_data = chat1.json()
    conv_id = c1_data["conversation_id"]
    print(f"✓ Chat 1 Response intent: {c1_data.get('intent')} | Conversation ID: {conv_id}")
    assert "Deadlock" in c1_data["content"] or "Answer" in c1_data["content"]

    # ---------------------------------------------------------
    # FLOW 2: Coding & Debugging
    # ---------------------------------------------------------
    print("\n--- Testing FLOW 2: Coding & Bug Analysis ---")
    chat_code = client.post("/chat", json={
        "conversation_id": conv_id,
        "content": "Why is this failing: TypeError: 'NoneType' object is not subscriptable in line data['key'][0]?",
        "mode": "CODING"
    }, headers=headers)
    assert chat_code.status_code == 200
    code_data = chat_code.json()
    print(f"✓ Coding/Debug Intent detected: {code_data.get('intent')}")
    assert "Bug Analysis" in code_data["content"] or "Corrected Code" in code_data["content"] or "None" in code_data["content"]

    # ---------------------------------------------------------
    # FLOW 3: Study Mode (15-Mark University Answer)
    # ---------------------------------------------------------
    print("\n--- Testing FLOW 3: Study & 15-Mark University Exam Formatter ---")
    chat_exam = client.post("/chat", json={
        "content": "Generate a 15-mark university exam answer for DBMS Normalization",
        "mode": "STUDY",
        "exam_params": {
            "subject": "Database Management Systems",
            "topic": "Normalization (1NF, 2NF, 3NF, BCNF)",
            "marks": 15,
            "difficulty": "Medium"
        }
    }, headers=headers)
    assert chat_exam.status_code == 200
    exam_data = chat_exam.json()
    print(f"✓ Exam Answer generated. Length: {len(exam_data['content'])} characters")
    assert "Definition" in exam_data["content"] or "Normal" in exam_data["content"]

    # ---------------------------------------------------------
    # FLOW 4: Project Studio & Context Maintenance
    # ---------------------------------------------------------
    print("\n--- Testing FLOW 4: Project Studio & Architectural Memory ---")
    proj_resp = client.post("/projects", json={
        "title": "ECG Arrhythmia Classification System",
        "description": "Deep learning system for detecting cardiac anomalies from 12-lead ECG signals.",
        "tech_stack": "PyTorch, 1D-CNN, FastAPI, React, SQLite"
    }, headers=headers)
    assert proj_resp.status_code == 200
    project_id = proj_resp.json()["id"]
    print(f"✓ Project Created: {proj_resp.json()['title']} (ID: {project_id})")

    # Ask follow-up referring to project
    chat_proj = client.post("/chat", json={
        "project_id": project_id,
        "content": "Which model architecture should I use for classifying 12-lead ECG signals?",
        "mode": "PROJECT"
    }, headers=headers)
    assert chat_proj.status_code == 200
    proj_chat_data = chat_proj.json()
    print(f"✓ Project Context Follow-up Handled. Content snippet: {proj_chat_data['content'][:120]}...")

    # ---------------------------------------------------------
    # FLOW 5: Career Roadmap & Phased Tree
    # ---------------------------------------------------------
    print("\n--- Testing FLOW 5: Career Guidance & Phased Roadmaps ---")
    chat_career = client.post("/chat", json={
        "content": "I want to become a Backend Developer. Give me a step by step roadmap.",
        "mode": "CAREER"
    }, headers=headers)
    assert chat_career.status_code == 200
    career_data = chat_career.json()
    print(f"✓ Career Roadmap Intent: {career_data.get('intent')}")
    assert "Roadmap" in career_data["content"] or "Phase" in career_data["content"] or "Backend" in career_data["content"]

    # ---------------------------------------------------------
    # FLOW 6: Interactive Mock Interview Turn-by-Turn
    # ---------------------------------------------------------
    print("\n--- Testing FLOW 6: Interactive Mock Interview Simulation ---")
    interview_start = client.post("/interview/start", json={
        "role": "Python Developer",
        "difficulty": "Medium",
        "num_questions": 3
    }, headers=headers)
    assert interview_start.status_code == 200
    session_data = interview_start.json()
    session_id = session_data["id"]
    print(f"✓ Interview Session Started (ID: {session_id}). Question 1: \"{session_data['current_question']['question']}\"")

    # Candidate responds to Question 1
    interview_ans = client.post("/interview/answer", json={
        "session_id": session_id,
        "answer": "CPython uses the Global Interpreter Lock (GIL) to synchronize thread execution and protect reference counting memory management. For CPU bound tasks, multiprocessing spawns isolated OS processes with separate memory spaces to bypass the GIL."
    }, headers=headers)
    assert interview_ans.status_code == 200
    ans_data = interview_ans.json()
    q1_eval = ans_data["transcript"][0]
    print(f"✓ Candidate Answer Evaluated. Score: {q1_eval['score']}/10. Feedback: {q1_eval['feedback']}")
    print(f"✓ Next Question Ready (Index {ans_data['current_index']}): {ans_data['current_question']['question'] if ans_data['current_question'] else 'Completed'}")

    # ---------------------------------------------------------
    # FLOW 7: Document Upload & Knowledge Base (RAG)
    # ---------------------------------------------------------
    print("\n--- Testing FLOW 7: Document Parsing & Semantic RAG Search ---")
    # Create a test study notes file
    test_note_path = Path("test_study_notes.txt")
    test_note_path.write_text(
        """Chapter 3: Distributed System Consensus and Raft Protocol.
The Raft consensus algorithm is designed to be understandable and modular. It decomposes consensus into leader election, log replication, and safety.
A Raft cluster typically contains 5 nodes and tolerates up to 2 node failures. The leader accepts log entries from clients and broadcasts AppendEntries RPCs to follower nodes.
Heartbeat intervals are typically configured between 50ms and 150ms to maintain leader stability without unnecessary network flooding.
Important Exam Questions:
1. Explain the Leader Election phase in Raft.
2. How does Raft guarantee State Machine Safety?
3. Compare Paxos and Raft complexity."""
    )

    with open(test_note_path, "rb") as f:
        doc_upload = client.post("/documents/upload", files={"file": ("Distributed_Systems_Raft_Notes.txt", f, "text/plain")}, headers=headers)
    test_note_path.unlink(missing_ok=True)

    assert doc_upload.status_code == 200, f"Document upload failed: {doc_upload.text}"
    doc_data = doc_upload.json()
    doc_id = doc_data["id"]
    print(f"✓ Document Uploaded & Indexed: {doc_data['filename']} ({doc_data['chunk_count']} chunks indexed)")

    # Query RAG
    rag_query = client.post("/documents/query", json={
        "query": "What are the important questions in Raft consensus in chapter 3?",
        "document_ids": [doc_id]
    }, headers=headers)
    assert rag_query.status_code == 200
    rag_resp = rag_query.json()
    print(f"✓ RAG Query Successful! Answer Excerpt:\n{rag_resp['answer'][:180]}...")
    print(f"✓ Verified Citations returned: {len(rag_resp.get('citations', []))}")

    print("\n==================================================")
    print("ALL 7 REQUIRED USER FLOWS VERIFIED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_all_user_flows()
