from fastapi import APIRouter, Depends, HTTPException
from app.schemas import UserProfile, UserResponse
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["User Profile"])

@router.get("", response_model=UserProfile)
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT education_level, primary_language, experience_level, career_goal, preferred_style FROM profiles WHERE user_id = ?",
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            return UserProfile()
        return UserProfile(**dict(row))

@router.put("", response_model=UserProfile)
def update_profile(
    profile_data: UserProfile,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO profiles (user_id, education_level, primary_language, experience_level, career_goal, preferred_style, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                education_level = excluded.education_level,
                primary_language = excluded.primary_language,
                experience_level = excluded.experience_level,
                career_goal = excluded.career_goal,
                preferred_style = excluded.preferred_style,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                user_id,
                profile_data.education_level,
                profile_data.primary_language,
                profile_data.experience_level,
                profile_data.career_goal,
                profile_data.preferred_style
            )
        )
        return profile_data
