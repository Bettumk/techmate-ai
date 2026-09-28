import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.seed_data import seed_demo_data

client = TestClient(app)

def setup_module():
    init_db()
    seed_demo_data()

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_demo_auth():
    res = client.post("/api/auth/demo")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@techmate.ai"

def test_register_and_login():
    import uuid
    unique_email = f"test_{uuid.uuid4().hex[:6]}@example.com"

    # Register
    reg_res = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "securepassword123",
        "full_name": "Test Engineer"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "securepassword123"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Me check
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

def test_unauthorized_access():
    res = client.get("/api/conversations")
    assert res.status_code == 401

def test_conversations_and_chat_flow():
    # Login as demo
    login_res = client.post("/api/auth/demo")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List conversations
    conv_list = client.get("/api/conversations", headers=headers)
    assert conv_list.status_code == 200
    assert isinstance(conv_list.json(), list)

    # Create new conversation
    new_conv = client.post("/api/conversations", json={"title": "DSA Study Session", "mode": "DSA"}, headers=headers)
    assert new_conv.status_code == 200
    conv_id = new_conv.json()["id"]

    # Chat in conversation (DSA intent)
    chat_res = client.post("/api/chat", json={
        "conversation_id": conv_id,
        "content": "Explain Binary Search with time complexity",
        "mode": "DSA"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert chat_data["role"] == "assistant"
    assert "Binary Search" in chat_data["content"] or "Approach" in chat_data["content"] or "Problem Understanding" in chat_data["content"]

    # Chat coding intent
    chat_coding = client.post("/api/chat", json={
        "conversation_id": conv_id,
        "content": "Write a Python script to reverse a string",
        "mode": "AUTO"
    }, headers=headers)
    assert chat_coding.status_code == 200
    assert chat_coding.json()["intent"] in ["CODING", "DSA"]

    # Rename conversation
    rename_res = client.put(f"/api/conversations/{conv_id}", json={"title": "Updated DSA Mastery"}, headers=headers)
    assert rename_res.status_code == 200
    assert rename_res.json()["title"] == "Updated DSA Mastery"

def test_project_crud():
    login_res = client.post("/api/auth/demo")
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Create project
    create_res = client.post("/api/projects", json={
        "title": "Smart IoT Garden System",
        "description": "Automated moisture tracking with ESP32",
        "tech_stack": "C++, MicroPython, MQTT, React"
    }, headers=headers)
    assert create_res.status_code == 200
    proj_id = create_res.json()["id"]

    # Get project
    get_res = client.get(f"/api/projects/{proj_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Smart IoT Garden System"

    # Delete project
    del_res = client.delete(f"/api/projects/{proj_id}", headers=headers)
    assert del_res.status_code == 200

def test_interview_flow():
    login_res = client.post("/api/auth/demo")
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Start mock interview
    start_res = client.post("/api/interview/start", json={
        "role": "Python Developer",
        "difficulty": "Medium",
        "num_questions": 2
    }, headers=headers)
    assert start_res.status_code == 200
    session_data = start_res.json()
    session_id = session_data["id"]
    assert session_data["status"] == "in_progress"
    assert session_data["current_question"] is not None

    # Submit answer
    answer_res = client.post("/api/interview/answer", json={
        "session_id": session_id,
        "answer": "The Global Interpreter Lock ensures only one thread executes Python bytecode at a time in CPython. Multiprocessing is used for CPU bound parallelism."
    }, headers=headers)
    assert answer_res.status_code == 200
    ans_data = answer_res.json()
    assert len(ans_data["transcript"]) == 1
    assert ans_data["transcript"][0]["score"] >= 5

def test_practice_flow():
    login_res = client.post("/api/auth/demo")
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Start practice
    start_res = client.post("/api/practice/start", json={
        "topic": "Algorithms",
        "difficulty": "Medium",
        "question_type": "MCQ",
        "count": 2
    }, headers=headers)
    assert start_res.status_code == 200
    session = start_res.json()
    assert len(session["questions"]) > 0

    # Submit practice
    first_q = session["questions"][0]
    submit_res = client.post("/api/practice/submit", json={
        "session_id": session["id"],
        "answers": [{"id": first_q["id"], "selected_option": 2}]
    }, headers=headers)
    assert submit_res.status_code == 200
    sub_data = submit_res.json()
    assert sub_data["status"] == "completed"
    assert "results" in sub_data

def test_edge_cases():
    login_res = client.post("/api/auth/demo")
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Empty chat query
    empty_chat = client.post("/api/chat", json={"content": "   ", "mode": "AUTO"}, headers=headers)
    assert empty_chat.status_code == 400

    # Non-existent conversation
    non_conv = client.get("/api/conversations/non-existent-uuid", headers=headers)
    assert non_conv.status_code == 404

    # Very long query
    long_text = "What is " + ("computer science " * 200) + "?"
    long_res = client.post("/api/chat", json={"content": long_text, "mode": "AUTO"}, headers=headers)
    assert long_res.status_code == 200

if __name__ == "__main__":
    print("Running TechMate AI Backend Test Suite...")
    setup_module()
    test_health()
    test_demo_auth()
    test_register_and_login()
    test_unauthorized_access()
    test_conversations_and_chat_flow()
    test_project_crud()
    test_interview_flow()
    test_practice_flow()
    test_edge_cases()
    print("All Backend Unit & Integration Tests Passed Successfully!")
