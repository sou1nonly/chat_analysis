"""
Upload API Routes - Handles file ingestion and parsing.
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Upload, Message, Report
from app.services.parser import parse_whatsapp, parse_instagram, detect_platform
from app.services.stats import compute_stats

router = APIRouter(prefix="/api/v1", tags=["upload"])


@router.post("/upload")
async def upload_chat(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and parse a chat export file.
    
    Returns upload_id and computed stats.
    """
    content = await file.read()
    text = content.decode('utf-8', errors='ignore')
    
    # Detect platform
    platform = detect_platform(file.filename or "", text)
    
    # Create upload record
    upload = Upload(
        filename=file.filename or "unknown",
        platform=platform,
        status="parsing"
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    
    try:
        # Parse based on platform
        if platform == 'instagram':
            messages = parse_instagram(text)
        else:
            messages = parse_whatsapp(text)
        
        if not messages:
            upload.status = "error"
            db.commit()
            raise HTTPException(status_code=400, detail="No messages found in file")
        
        # Bulk insert messages
        db_messages = [
            Message(
                id=f"{upload.id}-{msg.id}",
                upload_id=upload.id,
                sender=msg.sender,
                content=msg.content,
                timestamp=msg.timestamp,
                week_id=msg.week_id
            )
            for msg in messages
        ]
        db.bulk_save_objects(db_messages)
        
        # Compute stats
        stats = compute_stats(messages)
        
        # Save stats to Report table for AI analysis
        report = Report(
            upload_id=upload.id,
            stats=stats
        )
        db.add(report)
        
        # Update upload status
        upload.status = "ready"
        db.commit()
        
        return {
            "upload_id": upload.id,
            "filename": upload.filename,
            "platform": platform,
            "message_count": len(messages),
            "stats": stats
        }
        
    except Exception as e:
        upload.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/uploads/{upload_id}")
async def get_upload(upload_id: int, db: Session = Depends(get_db)):
    """Get upload metadata and status."""
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return {
        "id": upload.id,
        "filename": upload.filename,
        "platform": upload.platform,
        "status": upload.status,
        "created_at": upload.created_at.isoformat()
    }


@router.delete("/uploads/{upload_id}")
async def delete_upload(upload_id: int, db: Session = Depends(get_db)):
    """Delete an upload and all associated data."""
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    db.delete(upload)
    db.commit()
    
    return {"message": "Upload deleted successfully"}
