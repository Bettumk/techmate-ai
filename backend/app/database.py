import sqlite3
import json
import logging
from contextlib import contextmanager
from typing import Generator
from app.config import DB_PATH

logger = logging.getLogger("techmate.db")

def init_db():
    """Initializes the SQLite database schema with indexes and foreign keys."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        education_level TEXT DEFAULT 'B.Tech CSE',
        primary_language TEXT DEFAULT 'Python',
        experience_level TEXT DEFAULT 'Beginner',
        career_goal TEXT DEFAULT 'Software Engineer',
        preferred_style TEXT DEFAULT 'Practical with Code',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Conversations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'AUTO',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Messages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        mode TEXT,
        intent TEXT,
        metadata_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Projects Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        tech_stack TEXT,
        status TEXT DEFAULT 'Planning',
        data_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Documents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        chunk_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Knowledge Chunks Table for RAG
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        vector_json TEXT DEFAULT '[]',
        keywords TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Interview Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        current_index INTEGER DEFAULT 0,
        transcript_json TEXT DEFAULT '[]',
        final_evaluation_json TEXT,
        status TEXT DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Practice Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS practice_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question_type TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        user_answers_json TEXT DEFAULT '[]',
        score INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        status TEXT DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Learning Plans Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic TEXT NOT NULL,
        level TEXT NOT NULL,
        goal TEXT NOT NULL,
        plan_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_proj_user ON projects(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_docs_user ON documents(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_doc ON knowledge_chunks(document_id);")

    conn.commit()
    conn.close()
    logger.info("Database initialized successfully at %s", DB_PATH)

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
