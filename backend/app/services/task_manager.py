"""
Task Manager - Handles task cancellation and log streaming.

Provides:
- CancellationToken: Check if task should stop
- TaskManager: Singleton to track active tasks
- LogCapture: Capture print statements for streaming
"""

from typing import Dict, Optional, Callable, List
from dataclasses import dataclass, field
from threading import Lock
import asyncio


@dataclass
class CancellationToken:
    """Token to signal task cancellation."""
    _cancelled: bool = False
    _lock: Lock = field(default_factory=Lock)
    
    @property
    def is_cancelled(self) -> bool:
        with self._lock:
            return self._cancelled
    
    def cancel(self):
        with self._lock:
            self._cancelled = True


@dataclass
class TaskContext:
    """Context for a running task."""
    upload_id: int
    token: CancellationToken
    logs: List[str] = field(default_factory=list)
    subscribers: List[asyncio.Queue] = field(default_factory=list)
    _lock: Lock = field(default_factory=Lock)
    
    def add_log(self, message: str):
        """Add a log message and notify subscribers."""
        with self._lock:
            self.logs.append(message)
            # Notify all subscribers
            for queue in self.subscribers:
                try:
                    queue.put_nowait(message)
                except asyncio.QueueFull:
                    pass  # Skip if queue is full
    
    def subscribe(self) -> asyncio.Queue:
        """Subscribe to log updates."""
        queue = asyncio.Queue(maxsize=100)
        with self._lock:
            self.subscribers.append(queue)
        return queue
    
    def unsubscribe(self, queue: asyncio.Queue):
        """Unsubscribe from log updates."""
        with self._lock:
            if queue in self.subscribers:
                self.subscribers.remove(queue)


class TaskManager:
    """Singleton manager for tracking active tasks."""
    
    _instance: Optional["TaskManager"] = None
    _lock = Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._tasks: Dict[int, TaskContext] = {}
                cls._instance._tasks_lock = Lock()
            return cls._instance
    
    def start_task(self, upload_id: int) -> TaskContext:
        """Start tracking a new task."""
        with self._tasks_lock:
            # Cancel any existing task for this upload
            if upload_id in self._tasks:
                self._tasks[upload_id].token.cancel()
            
            # Create new task context
            context = TaskContext(
                upload_id=upload_id,
                token=CancellationToken()
            )
            self._tasks[upload_id] = context
            return context
    
    def get_task(self, upload_id: int) -> Optional[TaskContext]:
        """Get task context by upload ID."""
        with self._tasks_lock:
            return self._tasks.get(upload_id)
    
    def cancel_task(self, upload_id: int) -> bool:
        """Cancel a running task."""
        with self._tasks_lock:
            if upload_id in self._tasks:
                self._tasks[upload_id].token.cancel()
                print(f"[CANCEL] Task {upload_id} cancelled")
                return True
            return False
    
    def end_task(self, upload_id: int):
        """Remove a completed task."""
        with self._tasks_lock:
            if upload_id in self._tasks:
                del self._tasks[upload_id]
    
    def log(self, upload_id: int, message: str):
        """Add log message to task."""
        with self._tasks_lock:
            if upload_id in self._tasks:
                self._tasks[upload_id].add_log(message)
        # Also print to console
        print(message)


class TaskCancelledException(Exception):
    """Raised when a task is cancelled."""
    pass


# Global singleton
task_manager = TaskManager()
