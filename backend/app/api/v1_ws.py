"""
WebSocket API Routes - Real-time task communication.

Provides:
- /ws/task/{upload_id}: Connect to task, receive logs, disconnect to cancel
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.task_manager import task_manager
import asyncio

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/task/{upload_id}")
async def websocket_task(websocket: WebSocket, upload_id: int):
    """
    WebSocket endpoint for task communication.
    
    - Connect: Subscribe to task logs
    - Receive: Stream log messages in real-time
    - Disconnect: Cancels the running task
    """
    await websocket.accept()
    print(f"[WS] Client connected for task {upload_id}")
    
    task = task_manager.get_task(upload_id)
    log_queue = None
    
    try:
        if task:
            # Subscribe to logs
            log_queue = task.subscribe()
            
            # Send any existing logs
            for log in task.logs:
                await websocket.send_json({"type": "log", "message": log})
            
            # Stream new logs
            while not task.token.is_cancelled:
                try:
                    # Wait for new log with timeout
                    message = await asyncio.wait_for(
                        log_queue.get(),
                        timeout=1.0
                    )
                    await websocket.send_json({"type": "log", "message": message})
                except asyncio.TimeoutError:
                    # Send heartbeat to keep connection alive
                    await websocket.send_json({"type": "heartbeat"})
                except Exception as e:
                    break
            
            # Task completed or cancelled
            await websocket.send_json({"type": "complete"})
        else:
            # No active task
            await websocket.send_json({
                "type": "error", 
                "message": f"No active task for upload {upload_id}"
            })
    
    except WebSocketDisconnect:
        print(f"[WS] Client disconnected from task {upload_id}")
        # Cancel the task when client disconnects
        task_manager.cancel_task(upload_id)
    
    finally:
        # Cleanup subscription
        if task and log_queue:
            task.unsubscribe(log_queue)
        print(f"[WS] Connection closed for task {upload_id}")


@router.websocket("/ws/ping")
async def websocket_ping(websocket: WebSocket):
    """Simple ping endpoint to test WebSocket connectivity."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"pong: {data}")
    except WebSocketDisconnect:
        pass
