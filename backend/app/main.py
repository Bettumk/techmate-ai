import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import HOST, PORT
from app.database import init_db
from app.seed_data import seed_demo_data

from app.routers.auth_router import router as auth_router
from app.routers.chat_router import router as chat_router
from app.routers.project_router import router as project_router
from app.routers.document_router import router as document_router
from app.routers.interview_router import router as interview_router
from app.routers.practice_router import router as practice_router
from app.routers.profile_router import router as profile_router
from app.routers.code_router import router as code_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("techmate")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing TechMate AI Database & Demo Environment...")
    init_db()
    seed_demo_data()
    yield
    # Shutdown
    logger.info("Shutting down TechMate AI Service...")

app = FastAPI(
    title="TechMate AI",
    description="Intelligent CSE, Coding and Career Assistant — Learn. Build. Code. Grow.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(project_router)
app.include_router(document_router)
app.include_router(interview_router)
app.include_router(practice_router)
app.include_router(profile_router)
app.include_router(code_router)

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "system": "TechMate AI Orchestration Core",
        "version": "1.0.0"
    }

# Static Frontend SPA Serving (Single-Server Production Deployment)
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    logger.info(f"Mounting compiled production frontend from {FRONTEND_DIST}")
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target_file = FRONTEND_DIST / full_path
        if target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "title": "TechMate AI API",
            "tagline": "Learn. Build. Code. Grow.",
            "status": "online",
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
