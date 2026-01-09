"""
Stats Computation Service - Ported from TypeScript ingestion.worker.ts

Computes all analytics from parsed messages.
"""

import re
from datetime import datetime
from typing import List, Dict, Any
from collections import defaultdict

from app.services.parser import ParsedMessage


# Emoji detection regex
# Emoji detection regex - Strictly emotions/faces/hearts (No objects/nature like 🍀✨)
# Ranges: Emoticons(1F600-1F64F), Supp Faces(1F910-1F92F, 1F970-1F97F), Romance/Hearts(1F48B-1F49F), Red Heart(2764)
EMOJI_REGEX = re.compile(r'[\U0001F600-\U0001F64F\U0001F910-\U0001F92F\U0001F970-\U0001F97F\U0001F48B-\U0001F49F\u2764]', re.UNICODE)
URL_REGEX = re.compile(r'(https?://[^\s]+)')

# Stopwords for word cloud
STOPWORDS = {
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well",
    "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "omitted", "image", "audio", "message", "media"
}


def compute_stats(messages: List[ParsedMessage]) -> Dict[str, Any]:
    """
    Compute all statistics from parsed messages.
    Returns a dict matching the GlobalStats interface from the frontend.
    """
    if not messages:
        return {}
    
    # Accumulators
    emoji_counts: Dict[str, int] = defaultdict(int)
    monthly_emoji_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    word_counts: Dict[str, int] = defaultdict(int)
    hourly_activity = [0] * 24
    link_counts: Dict[str, int] = defaultdict(int)
    active_days: Dict[str, int] = defaultdict(int)
    
    # Participant stats
    participants: Dict[str, Dict] = defaultdict(lambda: {
        'count': 0,
        'total_length': 0,
        'reply_times': [],
        'double_text_count': 0
    })
    
    # Heatmap: 7 days x 24 hours
    heatmap = [[0] * 24 for _ in range(7)]
    initiators_map: Dict[str, int] = defaultdict(int)
    
    last_msg_time = 0
    last_sender = ""
    
    for msg in messages:
        date = msg.timestamp
        hour = date.hour
        day = date.weekday()  # Monday = 0
        day_key = date.strftime('%Y-%m-%d')
        month_key = date.strftime('%Y-%m')
        
        # 1. Time & Streak
        hourly_activity[hour] += 1
        active_days[day_key] += 1
        heatmap[day][hour] += 1
        
        # 2. Participants
        participants[msg.sender]['count'] += 1
        participants[msg.sender]['total_length'] += len(msg.content)
        
        # 3. Emojis
        emojis = EMOJI_REGEX.findall(msg.content)
        for e in emojis:
            emoji_counts[e] += 1
            monthly_emoji_counts[month_key][e] += 1
        
        # 4. Links
        links = URL_REGEX.findall(msg.content)
        for link in links:
            link_counts[link] += 1
        
        # 5. Word Cloud
        if '<Media omitted>' not in msg.content and 'omitted' not in msg.content.lower():
            words = re.split(r'[\s,.!?":;()]+', msg.content.lower())
            for w in words:
                if len(w) > 3 and w not in STOPWORDS and not w.startswith('http'):
                    word_counts[w] += 1
        
        # 6. Engagement metrics
        time = int(date.timestamp() * 1000)
        
        if last_msg_time != 0:
            diff_ms = time - last_msg_time
            
            # Initiation (>6 hrs silence)
            if diff_ms > (6 * 60 * 60 * 1000):
                initiators_map[msg.sender] += 1
            else:
                if msg.sender != last_sender:
                    # Reply time (in minutes)
                    mins = round(diff_ms / 60000)
                    if mins < 60 * 12:  # Only count if < 12 hours
                        participants[msg.sender]['reply_times'].append(mins)
                else:
                    # Double text (same sender, < 1 hour gap)
                    if diff_ms < (60 * 60 * 1000):
                        participants[msg.sender]['double_text_count'] += 1
        else:
            # First message counts as initiation
            initiators_map[msg.sender] += 1
        
        last_msg_time = time
        last_sender = msg.sender
    
    # Aggregation
    top_emojis = sorted(emoji_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    word_cloud = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:60]
    top_links = sorted(link_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Process monthly emojis
    # Structure: [{'date': '2023-01', 'emojis': [{'emoji': '😂', 'count': 42}, ...]}, ...]
    timeline_emojis = []
    for month_key in sorted(monthly_emoji_counts.keys()):
        # Get top 20 emojis for this month to ensure variety in frontend graphs
        month_top = sorted(monthly_emoji_counts[month_key].items(), key=lambda x: x[1], reverse=True)[:20]
        timeline_emojis.append({
            'date': month_key,
            'emojis': [{'emoji': e, 'count': c} for e, c in month_top]
        })

    # Timeline (sorted by date)
    timeline = [{'date': k, 'count': v} for k, v in sorted(active_days.items())]
    
    # Streak calculation
    sorted_days = sorted(active_days.keys())
    max_streak = 0
    current_streak = 0
    temp_streak = 1
    
    if sorted_days:
        prev_date = datetime.strptime(sorted_days[0], '%Y-%m-%d')
        max_streak = 1
        
        for i in range(1, len(sorted_days)):
            curr_date = datetime.strptime(sorted_days[i], '%Y-%m-%d')
            diff_days = (curr_date - prev_date).days
            
            if diff_days == 1:
                temp_streak += 1
            else:
                if temp_streak > max_streak:
                    max_streak = temp_streak
                temp_streak = 1
            prev_date = curr_date
        
        if temp_streak > max_streak:
            max_streak = temp_streak
        
        # Check if streak is current
        last_msg_date = datetime.strptime(sorted_days[-1], '%Y-%m-%d')
        days_since_last = (datetime.now() - last_msg_date).days
        current_streak = temp_streak if days_since_last <= 2 else 0
    
    # Format participant stats
    participant_stats = {}
    for name, data in participants.items():
        reply_times = data['reply_times']
        avg_reply = round(sum(reply_times) / len(reply_times)) if reply_times else 0
        
        participant_stats[name] = {
            'count': data['count'],
            'avgLength': round(data['total_length'] / data['count']) if data['count'] else 0,
            'replyTime': avg_reply,
            'doubleTextCount': data['double_text_count']
        }
    
    # Initiators
    initiators = [{'name': k, 'count': v} for k, v in sorted(initiators_map.items(), key=lambda x: x[1], reverse=True)]
    
    return {
        'totalMessages': len(messages),
        'startDate': messages[0].timestamp.isoformat(),
        'endDate': messages[-1].timestamp.isoformat(),
        'topEmojis': [{'emoji': e, 'count': c} for e, c in top_emojis],
        'monthlyEmojis': timeline_emojis,
        'hourlyActivity': hourly_activity,
        'wordCloud': [{'text': w, 'value': c} for w, c in word_cloud],
        'streak': {
            'current': current_streak,
            'max': max_streak,
            'activeDays': dict(active_days)
        },
        'timeline': timeline,
        'links': [{'url': u, 'count': c} for u, c in top_links],
        'participants': participant_stats,
        'heatmap': heatmap,
        'initiators': initiators
    }
