"""
Session Manager - Ephemeral SQLite database for AI processing.

Creates temporary databases that auto-cleanup after 24 hours.
Privacy-first: user chat data is never persistently stored for AI analysis.
"""

import os
import sqlite3
import tempfile
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pathlib import Path


class SessionManager:
    """Manages ephemeral SQLite sessions for AI processing."""
    
    _instance: Optional["SessionManager"] = None
    _sessions: Dict[str, Dict[str, Any]] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._sessions = {}
            cls._instance._session_dir = Path(tempfile.gettempdir()) / "orbit_sessions"
            cls._instance._session_dir.mkdir(exist_ok=True)
        return cls._instance
    
    def create_session(self, upload_id: int) -> str:
        """Create a new ephemeral session for AI processing."""
        session_id = f"orbit_{upload_id}_{uuid.uuid4().hex[:8]}"
        db_path = self._session_dir / f"{session_id}.db"
        
        # Create SQLite database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Create tables for preprocessed data
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                sender TEXT,
                content TEXT,
                timestamp TEXT,
                sentiment REAL,
                classification TEXT,
                word_count INTEGER,
                week_id TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS weekly_buckets (
                week_id TEXT PRIMARY KEY,
                message_count INTEGER,
                avg_sentiment REAL,
                top_words TEXT,
                question_ratio REAL,
                participant_balance REAL,
                summary TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS monthly_summaries (
                month TEXT PRIMARY KEY,
                sentiment_trend TEXT,
                activity_level TEXT,
                key_topics TEXT,
                narrative TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS yearly_summaries (
                year INTEGER PRIMARY KEY,
                evolution TEXT,
                highlights TEXT,
                patterns TEXT
            )
        """)
        
        conn.commit()
        conn.close()
        
        # Store session info
        self._sessions[session_id] = {
            "upload_id": upload_id,
            "db_path": str(db_path),
            "created_at": datetime.now(),
        }
        
        print(f"[OK] Created ephemeral session: {session_id}")
        return session_id
    
    def get_session_db(self, session_id: str) -> Optional[sqlite3.Connection]:
        """Get database connection for a session."""
        if session_id not in self._sessions:
            return None
        
        db_path = self._sessions[session_id]["db_path"]
        if not os.path.exists(db_path):
            return None
        
        return sqlite3.connect(db_path)
    
    def store_preprocessed_messages(
        self, 
        session_id: str, 
        messages: List[Dict[str, Any]]
    ) -> bool:
        """Store preprocessed messages in session database."""
        conn = self.get_session_db(session_id)
        if not conn:
            return False
        
        cursor = conn.cursor()
        for msg in messages:
            cursor.execute("""
                INSERT INTO messages 
                (sender, content, timestamp, sentiment, classification, word_count, week_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                msg.get("sender", ""),
                msg.get("content", ""),
                msg.get("timestamp", ""),
                msg.get("sentiment", 0.0),
                msg.get("classification", "statement"),
                msg.get("word_count", 0),
                msg.get("week_id", "")
            ))
        
        conn.commit()
        conn.close()
        return True
    
    def store_weekly_bucket(self, session_id: str, bucket: Dict[str, Any]) -> bool:
        """Store a weekly bucket summary."""
        conn = self.get_session_db(session_id)
        if not conn:
            return False
        
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO weekly_buckets
            (week_id, message_count, avg_sentiment, top_words, question_ratio, participant_balance, summary)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            bucket.get("week_id", ""),
            bucket.get("message_count", 0),
            bucket.get("avg_sentiment", 0.0),
            ",".join(bucket.get("top_words", [])),
            bucket.get("question_ratio", 0.0),
            bucket.get("participant_balance", 0.5),
            bucket.get("summary", "")
        ))
        
        conn.commit()
        conn.close()
        return True
    
    def store_monthly_summary(self, session_id: str, summary: Dict[str, Any]) -> bool:
        """Store a monthly summary."""
        conn = self.get_session_db(session_id)
        if not conn:
            return False
        
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO monthly_summaries
            (month, sentiment_trend, activity_level, key_topics, narrative)
            VALUES (?, ?, ?, ?, ?)
        """, (
            summary.get("month", ""),
            summary.get("sentiment_trend", "stable"),
            summary.get("activity_level", "medium"),
            ",".join(summary.get("key_topics", [])),
            summary.get("narrative", "")
        ))
        
        conn.commit()
        conn.close()
        return True
    
    def store_yearly_summary(self, session_id: str, summary: Dict[str, Any]) -> bool:
        """Store a yearly summary."""
        conn = self.get_session_db(session_id)
        if not conn:
            return False
        
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO yearly_summaries
            (year, evolution, highlights, patterns)
            VALUES (?, ?, ?, ?)
        """, (
            summary.get("year", 0),
            summary.get("evolution", ""),
            ",".join(summary.get("highlights", [])),
            summary.get("patterns", "")
        ))
        
        conn.commit()
        conn.close()
        return True
    
    def cleanup_session(self, session_id: str) -> bool:
        """Delete a session and its database."""
        if session_id not in self._sessions:
            return False
        
        db_path = self._sessions[session_id]["db_path"]
        try:
            if os.path.exists(db_path):
                os.remove(db_path)
            del self._sessions[session_id]
            print(f"[CLEANUP] Cleaned up session: {session_id}")
            return True
        except Exception as e:
            print(f"[WARN] Error cleaning up session {session_id}: {e}")
            return False
    
    def cleanup_stale_sessions(self, hours: int = 24) -> int:
        """Cleanup sessions older than specified hours."""
        cutoff = datetime.now() - timedelta(hours=hours)
        stale_sessions = [
            sid for sid, info in self._sessions.items()
            if info["created_at"] < cutoff
        ]
        
        cleaned = 0
        for session_id in stale_sessions:
            if self.cleanup_session(session_id):
                cleaned += 1
        
        # Also clean orphaned files
        if self._session_dir.exists():
            for db_file in self._session_dir.glob("orbit_*.db"):
                try:
                    # Check file age
                    file_age = datetime.now() - datetime.fromtimestamp(db_file.stat().st_mtime)
                    if file_age > timedelta(hours=hours):
                        db_file.unlink()
                        cleaned += 1
                except Exception:
                    pass
        
        if cleaned > 0:
            print(f"[CLEANUP] Cleaned up {cleaned} stale sessions")
        
        return cleaned


# Global singleton
session_manager = SessionManager()
