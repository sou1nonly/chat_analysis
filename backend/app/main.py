"""
Orbit Backend - FastAPI Application Entry Point

Three-Tier Architecture: Application Tier
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1_upload import router as upload_router
from app.api.v1_analysis import router as analysis_router
from app.api.v1_ws import router as ws_router
from app.db.session import engine
from app.db.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup: Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables initialized")
    
    yield
    
    # Shutdown
    print("[INFO] Shutting down Orbit Backend")


app = FastAPI(
    title="Orbit API",
    description="Relationship Analytics Backend - Three-Tier Architecture",
    version="2.0.0",
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)
app.include_router(analysis_router)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {
        "name": "Orbit API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
