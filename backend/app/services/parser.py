"""
Parser Service - Ported from TypeScript ingestion.worker.ts

Handles parsing of WhatsApp and Instagram chat exports.
"""

import re
from datetime import datetime
from dataclasses import dataclass
from typing import List, Optional
import hashlib


@dataclass
class ParsedMessage:
    id: str
    sender: str
    content: str
    timestamp: datetime
    week_id: Optional[str] = None


def get_week_id(date: datetime) -> str:
    """Get ISO week ID in format YYYY-Wxx."""
    iso_cal = date.isocalendar()
    return f"{iso_cal[0]}-W{iso_cal[1]:02d}"


# Regex patterns for WhatsApp formats
WHATSAPP_PATTERNS = [
    # iOS / Standard: [25/06/23, 11:23:45] Name: Msg
    re.compile(r'^\[?(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\]?(?:\s-\s)?\s([^:]+):\s(.+)', re.DOTALL),
    # Android: 25/06/2023, 11:23 - Name: Msg
    re.compile(r'^(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?:\s?[AaPp][Mm])?)\s-\s([^:]+):\s(.+)', re.DOTALL),
    # US format: 6/25/23, 11:23 PM - Name: Msg
    re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}\s?[AaPp][Mm])\s-\s([^:]+):\s(.+)', re.DOTALL),
]


def parse_datetime(date_str: str, time_str: str) -> Optional[datetime]:
    """Try to parse date/time from various formats."""
    # Normalize separators
    normalized = f"{date_str.replace('.', '/').replace('-', '/')} {time_str}"
    
    formats = [
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%d/%m/%y %H:%M:%S",
        "%d/%m/%y %H:%M",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M",
        "%m/%d/%y %H:%M:%S",
        "%m/%d/%y %H:%M",
        "%d/%m/%Y %I:%M %p",
        "%d/%m/%y %I:%M %p",
        "%m/%d/%Y %I:%M %p",
        "%m/%d/%y %I:%M %p",
        "%d/%m/%Y %I:%M%p",
        "%d/%m/%y %I:%M%p",
        "%m/%d/%Y %I:%M%p",
        "%m/%d/%y %I:%M%p",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(normalized, fmt)
        except ValueError:
            continue
    
    return None


def parse_whatsapp(text: str) -> List[ParsedMessage]:
    """Parse WhatsApp chat export text."""
    messages: List[ParsedMessage] = []
    lines = text.split('\n')
    
    current_message: Optional[dict] = None
    last_valid_date: Optional[datetime] = None
    
    for i, line in enumerate(lines):
        match = None
        for pattern in WHATSAPP_PATTERNS:
            match = pattern.match(line)
            if match:
                break
        
        if match:
            # Save previous message
            if current_message and current_message.get('id'):
                messages.append(ParsedMessage(**current_message))
            
            date_part = match.group(1)
            time_part = match.group(2)
            sender = match.group(3).strip()
            content = match.group(4).strip()
            
            date = parse_datetime(date_part, time_part)
            
            if date is None:
                date = last_valid_date or datetime(1970, 1, 1)
            else:
                last_valid_date = date
            
            current_message = {
                'id': f"wa-{i}",
                'sender': sender,
                'content': content,
                'timestamp': date,
                'week_id': get_week_id(date)
            }
        elif current_message and current_message.get('content'):
            # Continuation of previous message
            current_message['content'] += f"\n{line.strip()}"
    
    # Push final message
    if current_message and current_message.get('id'):
        messages.append(ParsedMessage(**current_message))
    
    return messages


def fix_instagram_encoding(text: str) -> str:
    """
    Fix Instagram's encoding quirk.
    
    Instagram exports UTF-8 text encoded as Latin-1 escape sequences.
    E.g., Hindi text appears as "à¤à¤¨à¥à¤·à¥à¤à¤¾" instead of actual Devanagari.
    
    This function decodes such text back to proper UTF-8.
    """
    if not text:
        return text
    try:
        # Instagram encodes UTF-8 bytes as Latin-1, so we:
        # 1. Encode the string back to Latin-1 bytes (treating each char as a byte)
        # 2. Decode those bytes as UTF-8
        return text.encode('latin-1').decode('utf-8')
    except (UnicodeDecodeError, UnicodeEncodeError):
        # If it fails, the text might already be correct or use different encoding
        return text


def parse_instagram(json_string: str) -> List[ParsedMessage]:
    """Parse Instagram chat export JSON with proper encoding handling."""
    import json
    
    try:
        data = json.loads(json_string)
        messages: List[ParsedMessage] = []
        
        # Instagram export structure varies
        raw_messages = data if isinstance(data, list) else data.get('messages', [])
        
        for i, msg in enumerate(raw_messages):
            if msg.get('content') and msg.get('sender_name'):
                timestamp = datetime.fromtimestamp(msg.get('timestamp_ms', 0) / 1000)
                
                # Fix Instagram's encoding quirk for sender name and content
                sender = fix_instagram_encoding(msg['sender_name'])
                content = fix_instagram_encoding(msg['content'])
                
                messages.append(ParsedMessage(
                    id=f"ig-{i}",
                    sender=sender,
                    content=content,
                    timestamp=timestamp,
                    week_id=get_week_id(timestamp)
                ))
        
        # Often newest first, so reverse
        return list(reversed(messages))
    
    except json.JSONDecodeError as e:
        print(f"Failed to parse Instagram JSON: {e}")
        return []


def detect_platform(filename: str, content: str) -> str:
    """Detect chat platform from filename or content."""
    if filename.endswith('.json'):
        return 'instagram'
    if 'WhatsApp' in content[:500] or re.search(r'^\[?\d{1,2}[./-]', content[:100]):
        return 'whatsapp'
    return 'whatsapp'  # Default
