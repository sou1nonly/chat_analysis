from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database - Use SQLite for local dev, PostgreSQL for Docker
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./orbit.db"  # Local SQLite for development
    )
    
    # AI Model
    model_path: str = os.getenv("MODEL_PATH", "./models/model.gguf")
    model_context_size: int = 4096
    
    # Server
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
