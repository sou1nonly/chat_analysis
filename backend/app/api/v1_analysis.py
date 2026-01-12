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
    model_type: str = "cloud"  # "cloud" or "offline"
    model_id: Optional[str] = None  # e.g., "qwen2.5:3b" for offline


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


class InitAIRequest(BaseModel):
    model_type: str = "cloud"
    model_id: Optional[str] = None


@router.post("/ai/init")
async def init_ai(request: InitAIRequest = None):
    """Initialize the AI engine (load model into memory)."""
    # If using cloud, no local initialization needed
    if request and request.model_type == "cloud":
        return {"status": "ready", "message": "Cloud AI ready"}
        
    # For offline, try to load Ollama
    success = ai_engine.load_model()
    if success:
        return {"status": "ready", "message": "AI Engine initialized"}
    else:
        # Check if we should fail strictly? 
        # For now, yes, as offline analysis requires it.
        raise HTTPException(status_code=500, detail="Failed to initialize AI Engine (Ollama not found)")


@router.get("/ai/status")
async def ai_status():
    """Check if AI engine is ready."""
    return {"ready": ai_engine.is_ready()}


class PreflightRequest(BaseModel):
    model_type: str = "cloud"
    model_id: Optional[str] = None


@router.post("/ai/preflight")
async def ai_preflight(request: PreflightRequest):
    """
    Pre-flight check before starting AI analysis.
    Checks if Ollama is running and tests a small API call for rate limits.
    """
    result = {
        "ready": False,
        "ollama_running": False,
        "rate_limited": False,
        "message": "Unknown error"
    }
    
    try:
        import ollama
        
        # Step 1: Check if Ollama is running by listing models
        try:
            models_response = ollama.list()
            result["ollama_running"] = True
        except Exception as e:
            result["message"] = "Ollama is not running. Please start Ollama first."
            return result
        
        # Step 2: Determine which model to test
        if request.model_type == "cloud":
            test_model = "deepseek-v3.1:671b-cloud"
        else:
            test_model = request.model_id or "qwen2.5:0.5b"
        
        # Step 3: Make a minimal test call to check rate limits (1 token, fastest possible)
        try:
            test_response = ollama.generate(
                model=test_model,
                prompt="1",
                options={"num_predict": 1, "temperature": 0}
            )
            response_text = test_response.get('response', '').lower()
            
            # Check for rate limit message in response
            if "usage limit" in response_text or "rate limit" in response_text:
                result["rate_limited"] = True
                result["message"] = "Rate limit reached. Please wait or upgrade to continue."
                return result
                
            # All checks passed
            result["ready"] = True
            result["message"] = "AI is ready for analysis"
            return result
            
        except Exception as e:
            error_str = str(e).lower()
            if "usage limit" in error_str or "rate limit" in error_str or "weekly" in error_str:
                result["rate_limited"] = True
                result["message"] = "Rate limit reached. Please wait or upgrade to continue."
            else:
                result["message"] = f"AI test failed: {str(e)}"
            return result
            
    except ImportError:
        result["message"] = "Ollama package not installed."
        return result


@router.get("/ai/models")
async def get_available_models():
    """
    Get list of installed Ollama models for offline mode.
    Returns which supported models are available locally.
    """
    # Supported offline models we check for
    SUPPORTED_MODELS = [
        {"id": "qwen2.5:0.5b", "name": "Qwen 2.5 0.5B", "ram": "2GB", "gpu": "Not required"},
        {"id": "qwen2.5:3b", "name": "Qwen 2.5 3B", "ram": "4GB", "gpu": "4GB VRAM"},
        {"id": "llama3.2:8b", "name": "Llama 3.2 8B", "ram": "8GB", "gpu": "8GB VRAM"},
        {"id": "deepseek-r1:14b", "name": "DeepSeek R1 14B", "ram": "16GB", "gpu": "12GB VRAM"},
    ]
    
    try:
        import ollama
        
        # Get installed models from Ollama
        models_response = ollama.list()
        model_list = models_response.models if hasattr(models_response, 'models') else models_response.get('models', [])
        installed_names = [m.model if hasattr(m, 'model') else m.get('model', '') for m in model_list]
        
        # Check which supported models are installed
        available = []
        for model in SUPPORTED_MODELS:
            # Check if model ID is in installed list (partial match for versioned models)
            is_installed = any(model["id"] in name for name in installed_names)
            available.append({
                **model,
                "installed": is_installed
            })
        
        return {
            "ollama_running": True,
            "models": available,
            "installed_count": sum(1 for m in available if m["installed"])
        }
        
    except Exception as e:
        # Ollama not running or not installed
        return {
            "ollama_running": False,
            "models": [{"id": m["id"], "name": m["name"], "ram": m["ram"], "gpu": m["gpu"], "installed": False} for m in SUPPORTED_MODELS],
            "installed_count": 0,
            "error": str(e)
        }


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
    
    # Run analysis with model config
    try:
        insights = ai_engine.analyze_full(
            message_dicts, 
            report.stats,
            model_type=request.model_type,
            model_id=request.model_id
        )
        
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
async def get_deep_insights(
    upload_id: int, 
    model_type: str = "cloud",
    model_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get hierarchical timeline insights (weekly, monthly, yearly summaries).
    Uses the new HierarchicalSummarizer for temporal analysis.
    Supports model selection (cloud vs offline).
    """
    from app.services.hierarchical_summarizer import HierarchicalSummarizer
    from app.services.task_manager import task_manager, TaskCancelledException
    
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
    
    # Register task with TaskManager
    task_context = task_manager.start_task(upload_id)
    
    try:
        # Run hierarchical summarization with model config
        summarizer = HierarchicalSummarizer(
            message_dicts, 
            upload_id=upload_id,
            model_type=model_type,
            model_id=model_id
        )
        summarizer.run_pipeline(
            cancellation_token=task_context.token,
            log_callback=lambda msg: task_manager.log(upload_id, msg)
        )
        
        # Return structured data for frontend
        return {
            "status": "complete",
            "insights": summarizer.get_insights_data()
        }
    
    except TaskCancelledException:
        return {
            "status": "cancelled",
            "insights": None
        }
    
    finally:
        # Cleanup task
        task_manager.end_task(upload_id)
