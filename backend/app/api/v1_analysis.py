"""
Analysis API Routes - Handles AI-powered analysis features.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.db.session import get_db
from app.db.models import Upload, Message, Report
from app.services.ai_engine import ai_engine
from app.services.stats import compute_stats
from app.services.parser import ParsedMessage

router = APIRouter(prefix="/api/v1", tags=["analysis"])


class AnalysisRequest(BaseModel):
    upload_id: int


class AIInsightsResponse(BaseModel):
    status: str
    progress: int = 100
    stage: str = "Complete"
    eta_seconds: int = 0
    insights: Optional[Dict[str, Any]] = None


@router.get("/stats/{upload_id}")
async def get_stats(upload_id: int, db: Session = Depends(get_db)):
    """
    Get computed statistics for an upload.
    Recomputes if not cached in reports table.
    """
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Check for cached report
    report = db.query(Report).filter(Report.upload_id == upload_id).first()
    if report and report.stats:
        return {
            "upload_id": upload_id,
            "stats": report.stats,
            "ai_insights": report.psych_analysis  # Using this field for new insights
        }
    
    # Recompute from messages
    messages = db.query(Message).filter(Message.upload_id == upload_id).order_by(Message.timestamp).all()
    
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found")
    
    # Convert to ParsedMessage format
    parsed = [
        ParsedMessage(
            id=m.id,
            sender=m.sender,
            content=m.content,
            timestamp=m.timestamp,
            week_id=m.week_id
        )
        for m in messages
    ]
    
    stats = compute_stats(parsed)
    
    # Cache in reports table
    report = Report(upload_id=upload_id, stats=stats)
    db.add(report)
    db.commit()
    
    return {
        "upload_id": upload_id,
        "stats": stats,
        "ai_insights": None
    }


@router.post("/ai/init")
async def init_ai():
    """Initialize the AI engine (load model into memory)."""
    success = ai_engine.load_model()
    if success:
        return {"status": "ready", "message": "AI Engine initialized"}
    else:
        raise HTTPException(status_code=500, detail="Failed to initialize AI Engine")


@router.get("/ai/status")
async def ai_status():
    """Check if AI engine is ready."""
    return {"ready": ai_engine.is_ready()}


@router.post("/ai/analyze", response_model=AIInsightsResponse)
async def analyze_chat(request: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Run full AI analysis on chat data.
    Returns insights for all 4 categories.
    """
    # Ensure AI is ready
    if not ai_engine.is_ready():
        ai_engine.load_model()
    
    # Get report with stats
    report = db.query(Report).filter(Report.upload_id == request.upload_id).first()
    if not report or not report.stats:
        raise HTTPException(status_code=404, detail="Stats not found. Upload and parse first.")
    
    # Get messages
    messages = db.query(Message).filter(
        Message.upload_id == request.upload_id
    ).order_by(Message.timestamp).all()
    
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found")
    
    # Convert to dict format
    message_dicts = [
        {
            "sender": m.sender,
            "content": m.content,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None
        }
        for m in messages
    ]
    
    # Run analysis
    try:
        insights = ai_engine.analyze_full(message_dicts, report.stats)
        
        # Save to report
        report.psych_analysis = insights
        db.commit()
        
        return AIInsightsResponse(
            status="complete",
            progress=100,
            stage="Complete",
            eta_seconds=0,
            insights=insights
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@router.get("/ai/insights/{upload_id}")
async def get_insights(upload_id: int, db: Session = Depends(get_db)):
    """Get cached AI insights for an upload."""
    report = db.query(Report).filter(Report.upload_id == upload_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report.psych_analysis:
        return {"status": "not_analyzed", "insights": None}
    
    return {"status": "complete", "insights": report.psych_analysis}


@router.post("/search")
async def search_messages(
    upload_id: int,
    text: Optional[str] = None,
    sender: Optional[str] = None,
    day_of_week: Optional[int] = None,
    hour_of_day: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Search messages with filters."""
    query = db.query(Message).filter(Message.upload_id == upload_id)
    
    if text:
        query = query.filter(Message.content.ilike(f"%{text}%"))
    if sender:
        query = query.filter(Message.sender == sender)
    
    messages = query.limit(50).all()
    
    # Filter by day/hour in Python
    results = []
    for m in messages:
        if day_of_week is not None and m.timestamp.weekday() != day_of_week:
            continue
        if hour_of_day is not None and m.timestamp.hour != hour_of_day:
            continue
        results.append({
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "timestamp": m.timestamp.isoformat()
        })
    
    return {"results": results[:50]}


@router.get("/ai/deep-insights/{upload_id}")
async def get_deep_insights(upload_id: int, db: Session = Depends(get_db)):
    """
    Get hierarchical timeline insights (weekly, monthly, yearly summaries).
    Uses the new HierarchicalSummarizer for temporal analysis.
    """
    from app.services.hierarchical_summarizer import HierarchicalSummarizer
    
    # Get messages for this upload
    messages = db.query(Message).filter(
        Message.upload_id == upload_id
    ).order_by(Message.timestamp).all()
    
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found")
    
    # Convert to dict format
    message_dicts = [
        {
            "sender": m.sender,
            "content": m.content,
            "timestamp": m.timestamp.isoformat() if m.timestamp else ""
        }
        for m in messages
    ]
    
    # Run hierarchical summarization
    summarizer = HierarchicalSummarizer(message_dicts)
    summarizer.run_pipeline()
    
    # Return structured data for frontend
    return {
        "status": "complete",
        "insights": summarizer.get_insights_data()
    }
