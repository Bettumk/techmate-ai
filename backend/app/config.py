import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Server Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "techmate-ai-secret-key-change-this-in-production-2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'techmate.db'}")
DB_PATH = BASE_DIR / "techmate.db"

# Storage
UPLOAD_DIR = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# AI Service Configuration
AI_PROVIDER = os.getenv("AI_PROVIDER", "auto").lower()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
