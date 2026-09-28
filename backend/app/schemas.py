from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

# Authentication
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfile(BaseModel):
    education_level: Optional[str] = "B.Tech CSE"
    primary_language: Optional[str] = "Python"
    experience_level: Optional[str] = "Beginner"
    career_goal: Optional[str] = "Software Engineer"
    preferred_style: Optional[str] = "Practical with Code"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: str
    profile: Optional[UserProfile] = None

# Conversations & Messages
class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    mode: Optional[str] = "AUTO"

class ConversationResponse(BaseModel):
    id: str
    title: str
    mode: str
    created_at: str
    updated_at: str
    last_message: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    conversation_id: Optional[str] = None
    mode: Optional[str] = "AUTO"
    project_id: Optional[str] = None
    exam_params: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    mode: Optional[str] = None
    intent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: str

# Projects
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    tech_stack: Optional[str] = ""

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    status: Optional[str] = None
    data_json: Optional[Dict[str, Any]] = None

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    tech_stack: Optional[str] = ""
    status: str
    data: Dict[str, Any]
    created_at: str
    updated_at: str

# Documents & RAG
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    created_at: str

class DocumentQueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    top_k: Optional[int] = 4

# Interview
class InterviewStartRequest(BaseModel):
    role: str
    difficulty: str = "Medium"
    num_questions: int = 5

class InterviewAnswerRequest(BaseModel):
    session_id: str
    answer: str

class InterviewSessionResponse(BaseModel):
    id: str
    role: str
    difficulty: str
    current_index: int
    total_questions: int
    status: str
    current_question: Optional[Dict[str, Any]] = None
    transcript: List[Dict[str, Any]] = []
    final_evaluation: Optional[Dict[str, Any]] = None
    created_at: str

# Practice
class PracticeStartRequest(BaseModel):
    topic: str
    difficulty: str = "Medium"
    question_type: str = "MCQ"  # MCQ, Coding, Debugging, Short Answer
    count: int = 5

class PracticeSubmitRequest(BaseModel):
    session_id: str
    answers: List[Dict[str, Any]]

class PracticeSessionResponse(BaseModel):
    id: str
    topic: str
    difficulty: str
    question_type: str
    questions: List[Dict[str, Any]]
    score: int
    total: int
    status: str
    results: Optional[List[Dict[str, Any]]] = None

# Learning Plans
class LearningPlanRequest(BaseModel):
    topic: str
    current_level: str = "Beginner"
    goal: str
    hours_per_week: Optional[int] = 10
    style: Optional[str] = "Hands-on projects"
