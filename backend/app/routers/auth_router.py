import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )

        user_id = str(uuid.uuid4())
        hashed = hash_password(user_data.password)

        cursor.execute(
            "INSERT INTO users (id, email, hashed_password, full_name) VALUES (?, ?, ?, ?)",
            (user_id, user_data.email, hashed, user_data.full_name)
        )

        cursor.execute(
            """
            INSERT INTO profiles (user_id, education_level, primary_language, experience_level, career_goal, preferred_style)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, "B.Tech CSE", "Python", "Beginner", "Software Engineer", "Practical with Code")
        )

        token = create_access_token({"sub": user_id, "email": user_data.email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "profile": {
                    "education_level": "B.Tech CSE",
                    "primary_language": "Python",
                    "experience_level": "Beginner",
                    "career_goal": "Software Engineer"
                }
            }
        }

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, hashed_password, full_name FROM users WHERE email = ?", (login_data.email,))
        row = cursor.fetchone()

        if not row or not verify_password(login_data.password, row["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        user_id = row["id"]
        cursor.execute("SELECT education_level, primary_language, experience_level, career_goal FROM profiles WHERE user_id = ?", (user_id,))
        prow = cursor.fetchone()

        token = create_access_token({"sub": user_id, "email": row["email"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": row["email"],
                "full_name": row["full_name"],
                "profile": dict(prow) if prow else {}
            }
        }

@router.post("/demo", response_model=TokenResponse)
def demo_login():
    """Provides instant 1-click access for evaluation and test drives."""
    demo_email = "demo@techmate.ai"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM users WHERE email = ?", (demo_email,))
        row = cursor.fetchone()

        if row:
            user_id = row["id"]
            user_name = row["full_name"]
        else:
            user_id = str(uuid.uuid4())
            user_name = "Alex Mercer (Demo Student)"
            cursor.execute(
                "INSERT INTO users (id, email, hashed_password, full_name) VALUES (?, ?, ?, ?)",
                (user_id, demo_email, hash_password("demo123456"), user_name)
            )
            cursor.execute(
                """
                INSERT INTO profiles (user_id, education_level, primary_language, experience_level, career_goal, preferred_style)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (user_id, "B.Tech CSE - 3rd Year", "Python & C++", "Intermediate", "Full Stack / AI Engineer", "Practical with Code")
            )

        cursor.execute("SELECT education_level, primary_language, experience_level, career_goal FROM profiles WHERE user_id = ?", (user_id,))
        prow = cursor.fetchone()

        token = create_access_token({"sub": user_id, "email": demo_email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": demo_email,
                "full_name": user_name,
                "profile": dict(prow) if prow else {}
            }
        }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
