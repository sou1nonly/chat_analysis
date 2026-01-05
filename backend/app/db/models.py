from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base


class Upload(Base):
    """Stores metadata for uploaded chat files."""
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    platform = Column(String(50), nullable=False)  # 'whatsapp' | 'instagram' | 'telegram'
    status = Column(String(50), default='pending')  # 'pending' | 'parsing' | 'ready' | 'analyzing' | 'complete' | 'error'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="upload", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="upload", uselist=False, cascade="all, delete-orphan")


class Message(Base):
    """Stores individual chat messages."""
    __tablename__ = "messages"

    id = Column(String(50), primary_key=True)
    upload_id = Column(Integer, ForeignKey("uploads.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    week_id = Column(String(10))  # Format: YYYY-Wxx
    
    # Relationships
    upload = relationship("Upload", back_populates="messages")


class Report(Base):
    """Stores computed analysis and AI insights."""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, ForeignKey("uploads.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Computed Stats (stored as JSON)
    stats = Column(JSON)
    
    # AI Generated Content
    roast = Column(Text)
    psych_analysis = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    upload = relationship("Upload", back_populates="report")
