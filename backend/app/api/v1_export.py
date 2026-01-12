from fastapi import APIRouter, HTTPException, Form, Response
import base64

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.post("/receipt")
async def export_receipt(data_url: str = Form(...), filename: str = Form("orbit-receipt.png")):
    """
    Receives a Base64 Data URL via Form POST and returns it as a downloadable file
    with proper Content-Disposition headers to force browser download.
    Using Form POST instead of JSON allows for native browser submission if needed.
    """
    try:
        # 1. Parse Data URL
        # Format: "data:image/png;base64,iVBORw0KGgo..."
        if "," not in data_url:
            raise HTTPException(status_code=400, detail="Invalid Data URL format")
        
        header, encoded = data_url.split(",", 1)
        
        # 2. Decode Base64
        image_data = base64.b64decode(encoded)
        
        # 3. Return as File Response
        return Response(
            content=image_data,
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "image/png",
                "Cache-Control": "no-cache"
            }
        )
            
    except Exception as e:
        print(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
