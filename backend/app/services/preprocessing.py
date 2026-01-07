"""
Preprocessing Service - VADER sentiment and message classification.

Enriches raw messages with sentiment scores and classifications
before hierarchical summarization.
"""

import re
from typing import List, Dict, Any
from datetime import datetime
from collections import Counter

# Try to import VADER, fallback to neutral if not available
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
    _analyzer = SentimentIntensityAnalyzer()
except ImportError:
    VADER_AVAILABLE = False
    _analyzer = None
    print("[WARN] vaderSentiment not installed. Using neutral sentiment.")


def analyze_sentiment(text: str) -> float:
    """
    Analyze sentiment of text using VADER.
    
    Returns:
        float: Compound sentiment score from -1.0 (negative) to +1.0 (positive)
    """
    if not text or not VADER_AVAILABLE:
        return 0.0
    
    try:
        scores = _analyzer.polarity_scores(text)
        return scores['compound']
    except Exception:
        return 0.0


def classify_message(text: str) -> str:
    """
    Classify message type.
    
    Returns:
        str: One of 'question', 'statement', 'reaction', 'media', 'link'
    """
    if not text:
        return "statement"
    
    text_lower = text.lower().strip()
    
    # Check for media placeholders
    media_patterns = [
        r'<media omitted>',
        r'\[media\]',
        r'\[image\]',
        r'\[video\]',
        r'\[audio\]',
        r'\[sticker\]',
        r'\[gif\]',
        r'image omitted',
        r'video omitted'
    ]
    for pattern in media_patterns:
        if re.search(pattern, text_lower):
            return "media"
    
    # Check for links
    if re.search(r'https?://|www\.', text_lower):
        return "link"
    
    # Check for reactions (very short messages, emojis only, etc.)
    if len(text_lower) <= 5:
        # Check if mostly emoji or reaction words
        reaction_words = {'ok', 'okay', 'k', 'lol', 'haha', 'yes', 'no', 'ya', 'yep', 'nope', 
                         'hmm', 'oh', 'ah', 'wow', 'nice', 'cool', 'great', '👍', '❤️', '😂'}
        if text_lower in reaction_words or not any(c.isalpha() for c in text):
            return "reaction"
    
    # Check for questions
    question_indicators = ['?', 'what', 'when', 'where', 'why', 'how', 'who', 
                          'which', 'would', 'could', 'should', 'can', 'do you',
                          'are you', 'is it', 'have you', 'did you']
    if '?' in text or any(text_lower.startswith(q) for q in question_indicators):
        return "question"
    
    return "statement"


def get_week_id(timestamp_str: str) -> str:
    """Get ISO week ID from timestamp string."""
    try:
        # Try common timestamp formats
        for fmt in [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%d/%m/%Y, %H:%M",
            "%m/%d/%Y, %H:%M",
            "%Y-%m-%d"
        ]:
            try:
                dt = datetime.strptime(timestamp_str[:19], fmt)
                return f"{dt.isocalendar()[0]}-W{dt.isocalendar()[1]:02d}"
            except ValueError:
                continue
        return "unknown"
    except Exception:
        return "unknown"


def get_month_id(timestamp_str: str) -> str:
    """Get month ID (YYYY-MM) from timestamp string."""
    try:
        for fmt in [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%d/%m/%Y, %H:%M",
            "%m/%d/%Y, %H:%M",
            "%Y-%m-%d"
        ]:
            try:
                dt = datetime.strptime(timestamp_str[:19], fmt)
                return f"{dt.year}-{dt.month:02d}"
            except ValueError:
                continue
        return "unknown"
    except Exception:
        return "unknown"


def get_year(timestamp_str: str) -> int:
    """Get year from timestamp string."""
    try:
        for fmt in [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%d/%m/%Y, %H:%M",
            "%m/%d/%Y, %H:%M",
            "%Y-%m-%d"
        ]:
            try:
                dt = datetime.strptime(timestamp_str[:19], fmt)
                return dt.year
            except ValueError:
                continue
        return 0
    except Exception:
        return 0


def extract_top_words(texts: List[str], n: int = 10) -> List[str]:
    """Extract top N meaningful words from a list of texts."""
    # Common stop words to exclude (English + Hindi/Hinglish)
    stop_words = {
        # English stop words
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
        'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
        'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
        'just', 'like', 'so', 'very', 'really', 'also', 'too', 'only',
        'yeah', 'yes', 'no', 'ok', 'okay', 'um', 'uh', 'oh', 'ah', 'hmm',
        'im', "i'm", "it's", "don't", "doesn't", "didn't", "won't", "can't",
        'your', 'my', 'me', 'u', 'ur', 'r', 'gonna', 'wanna', 'gotta',
        'lol', 'haha', 'hehe', 'lmao', 'omg', 'wtf', 'idk', 'lmfao',
        'good', 'nice', 'great', 'fine', 'well', 'right', 'now', 'then',
        'here', 'there', 'some', 'any', 'all', 'more', 'most', 'other',
        'been', 'being', 'much', 'such', 'same', 'than', 'them', 'their',
        
        # Hindi/Hinglish common words (romanized)
        'hai', 'hain', 'tha', 'thi', 'the', 'ho', 'hota', 'hoti', 'hote',
        'nhi', 'nahi', 'nahin', 'na', 'mat', 'maat',
        'mai', 'main', 'mein', 'me', 'mujhe', 'mujhko', 'mera', 'meri', 'mere',
        'tu', 'tum', 'tumhe', 'tumko', 'tera', 'teri', 'tere', 'aap', 'aapko',
        'kya', 'kyu', 'kyun', 'kab', 'kaise', 'kaha', 'kahan', 'kaun', 'kis',
        'yeh', 'ye', 'woh', 'wo', 'yahan', 'wahan', 'isko', 'usko', 'isse', 'usse',
        'kar', 'karo', 'karna', 'karni', 'karte', 'kiya', 'ki', 'ke', 'ka', 'ko',
        'bhi', 'hi', 'toh', 'to', 'par', 'per', 'lekin', 'magar', 'aur', 'ya',
        'se', 'pe', 'tak', 'liye', 'wala', 'wali', 'wale', 'waala', 'waali',
        'ek', 'do', 'teen', 'abhi', 'baad', 'pehle', 'phir', 'fir',
        'haan', 'han', 'ji', 'sahi', 'theek', 'thik', 'accha', 'acha', 'achha',
        'kuch', 'koi', 'sab', 'sabhi', 'bahut', 'bohot', 'zyada', 'kam', 'thoda',
        'raha', 'rahi', 'rahe', 'gaya', 'gayi', 'gaye', 'aaya', 'aayi', 'aaye',
        'bola', 'boli', 'bole', 'bol', 'baat', 'bata', 'batao', 'dekh', 'dekho',
        'chalo', 'chal', 'jao', 'aao', 'ruk', 'ruko', 'sun', 'suno',
        'arre', 'are', 'oye', 'yaar', 'bhai', 'dude', 'bro',
        'hoga', 'hogi', 'hoge', 'hua', 'hui', 'hue', 'karenge', 'karungi',
        'lena', 'dena', 'jana', 'aana', 'milna', 'batana', 'dekhna',
        'omitted', 'media', 'image', 'video', 'audio', 'sticker', 'gif',
    }

    
    word_counts = Counter()
    for text in texts:
        if not text:
            continue
        # Extract words - MINIMUM 4 characters to avoid gibberish
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        for word in words:
            if word not in stop_words:
                # Skip words that look like gibberish (all same letter, random consonants)
                if len(set(word)) < 3:  # Skip words with less than 3 unique letters
                    continue
                word_counts[word] += 1
    
    # Prefer longer, more meaningful words
    top_words = []
    for word, count in word_counts.most_common(n * 3):  # Get more candidates
        if len(top_words) >= n:
            break
        # Prefer words 5+ characters
        if len(word) >= 5 or count >= 3:
            top_words.append(word)
    
    return top_words if top_words else [word for word, _ in word_counts.most_common(n)]


def preprocess_message(message: Dict[str, Any]) -> Dict[str, Any]:
    """
    Preprocess a single message with sentiment and classification.
    
    Returns enriched message dict.
    """
    content = message.get('content', '')
    timestamp = message.get('timestamp', '')
    
    return {
        **message,
        'sentiment': analyze_sentiment(content),
        'classification': classify_message(content),
        'word_count': len(content.split()) if content else 0,
        'week_id': get_week_id(timestamp),
        'month_id': get_month_id(timestamp),
        'year': get_year(timestamp)
    }


def preprocess_all_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Preprocess all messages with sentiment and classification.
    
    Args:
        messages: List of raw message dicts with sender, content, timestamp
        
    Returns:
        List of enriched message dicts
    """
    print(f"[STATS] Preprocessing {len(messages)} messages...")
    
    enriched = []
    for msg in messages:
        enriched.append(preprocess_message(msg))
    
    # Stats
    sentiments = [m['sentiment'] for m in enriched if m['sentiment'] != 0]
    if sentiments:
        avg_sentiment = sum(sentiments) / len(sentiments)
        print(f"   Average sentiment: {avg_sentiment:.2f}")
    
    classifications = Counter(m['classification'] for m in enriched)
    print(f"   Classifications: {dict(classifications)}")
    
    return enriched
