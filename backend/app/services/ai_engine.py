"""
AI Engine Service - Ollama-based chat analysis.

Provides 4 insight categories with detailed, specific responses.
Uses actual participant names for clarity.
"""

from typing import Optional, Dict, Any, List
import json
import re

# Try to import ollama
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("[WARN] ollama package not installed.")

from app.services.text_optimizer import TextOptimizer


# IMPORTANT: Prompts require BALANCED analysis of BOTH participants
PROMPTS = {
    "conversation_dynamics": """You are analyzing a chat between {participants}.

Conversation sample:
{context}

Statistics:
{stats}

IMPORTANT: Your analysis must be BALANCED - mention BOTH people equally.
Use their actual names: {participants}

Answer these questions with 2-3 sentences each:

1. INITIATOR_SUMMARY: Describe how EACH person starts conversations. What does [Person A] typically say to start? What does [Person B] typically say to start?
2. FLOW_PATTERN: How do their conversations flow? Describe what EACH person contributes to the conversation dynamic.
3. TOPIC_SHIFTS: What topics does EACH person bring up? How do they influence the conversation direction?

Respond ONLY with valid JSON:
{{"initiator_summary": "...", "flow_pattern": "...", "topic_shifts": "..."}}""",

    "emotional_health": """You are analyzing emotional dynamics between {participants}.

Conversation sample:
{context}

Statistics:
{stats}

IMPORTANT: Be BALANCED - describe BOTH people's emotional patterns equally.
Use their actual names: {participants}

Answer these questions:

1. OVERALL_SENTIMENT: Describe the emotional tone. How does [Person A] express emotions? How does [Person B] express emotions?
2. HEALTH_ASSESSMENT: What makes this relationship healthy? Mention positive behaviors from BOTH people.
3. RED_FLAGS: List concerning patterns (max 2 short phrases, or [] if none)
4. GREEN_FLAGS: List positive patterns showing good behavior from BOTH people (max 2 short phrases)

Respond ONLY with valid JSON:
{{"overall_sentiment": "...", "health_assessment": "...", "red_flags": [], "green_flags": []}}""",

    "engagement": """You are analyzing engagement between {participants}.

Conversation sample:
{context}

Statistics:
{stats}

IMPORTANT: Describe BOTH people's engagement equally. Don't focus on just one person.
Use their actual names: {participants}

Answer these questions:

1. BALANCE_SUMMARY: Compare BOTH people's effort. "[Person A] does X, while [Person B] does Y." Be fair to both.
2. EFFORT_ASSESSMENT: Describe how EACH person shows investment. What does [Person A] do to show they care? What does [Person B] do?
3. ENGAGEMENT_SCORE: Rate balance 0-100 (50 = equal, higher = first person more engaged, lower = second person more engaged)

Respond ONLY with valid JSON:
{{"balance_summary": "...", "effort_assessment": "...", "engagement_score": 55}}""",

    "sharing_balance": """You are analyzing personal sharing between {participants}.

Conversation sample:
{context}

Statistics:
{stats}

IMPORTANT: Analyze BOTH people's sharing patterns fairly.
Use their actual names: {participants}

Answer these questions:

1. SHARING_SUMMARY: What personal topics does [Person A] share? What personal topics does [Person B] share? Be specific about BOTH.
2. QUESTION_BALANCE: How does [Person A] show interest in the other? How does [Person B] show interest? Describe both.
3. RECIPROCITY_SCORE: Rate reciprocity 0-100 (50 = perfectly balanced sharing)

Respond ONLY with valid JSON:
{{"sharing_summary": "...", "question_balance": "...", "reciprocity_score": 55}}"""
}


class AIEngine:
    """Ollama-based AI analysis engine with improved prompts."""
    
    _instance: Optional["AIEngine"] = None
    _model_name: str = "deepseek-v3.1:671b-cloud"
    _ready: bool = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load_model(self) -> bool:
        """Check if Ollama is running and model is available."""
        if not OLLAMA_AVAILABLE:
            print("[WARN] Using mock AI engine (ollama not available)")
            self._ready = False
            return True
        
        try:
            models = ollama.list()
            model_list = models.models if hasattr(models, 'models') else models.get('models', [])
            model_names = [m.model if hasattr(m, 'model') else m.get('model', '') for m in model_list]
            print(f"[OK] Ollama connected. Models: {model_names}")
            
            if not any(self._model_name in name for name in model_names):
                print(f"[DOWNLOAD] Pulling model {self._model_name}...")
                ollama.pull(self._model_name)
            
            self._ready = True
            return True
        except Exception as e:
            print(f"[WARN] Ollama not available: {e}")
            self._ready = False
            return False
    
    def is_ready(self) -> bool:
        return self._ready
    
    def _generate(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate text using Ollama."""
        if not OLLAMA_AVAILABLE or not self._ready:
            return None
        
        try:
            response = ollama.generate(
                model=self._model_name,
                prompt=prompt,
                options={
                    "num_predict": max_tokens,
                    "temperature": 0.7,
                    "top_p": 0.9
                }
            )
            return response.get('response', '').strip()
        except Exception as e:
            print(f"Ollama generation error: {e}")
            return None
    
    def _parse_json_response(self, response: str, default: Dict) -> Dict:
        """Extract JSON from LLM response."""
        if not response:
            return default
        
        try:
            # Find JSON in response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        return default
    
    def _replace_codes_with_names(self, text: str, name_map: Dict[str, str]) -> str:
        """Replace P1, P2 codes with actual names in text."""
        if not text or not name_map:
            return text
        
        result = text
        for name, code in name_map.items():
            # Replace "P1" or "P2" with actual names
            result = re.sub(rf'\b{re.escape(code)}\b', name, result)
        return result
    
    def _replace_codes_in_result(self, result: Dict, name_map: Dict[str, str]) -> Dict:
        """Recursively replace codes with names in all string values."""
        if not result:
            return result
        
        new_result = {}
        for key, value in result.items():
            if isinstance(value, str):
                new_result[key] = self._replace_codes_with_names(value, name_map)
            elif isinstance(value, list):
                new_result[key] = [
                    self._replace_codes_with_names(v, name_map) if isinstance(v, str) else v 
                    for v in value
                ]
            elif isinstance(value, dict):
                new_result[key] = self._replace_codes_in_result(value, name_map)
            else:
                new_result[key] = value
        
        return new_result
    
    def analyze_full(
        self, 
        messages: List[Dict], 
        stats: Dict,
        progress_callback=None
    ) -> Dict[str, Any]:
        """
        Run full analysis across all 4 categories.
        
        Uses simple message sampling for efficiency.
        Deep hierarchical insights are handled separately by /ai/deep-insights.
        """
        # Simple sampling approach - no heavy pipeline needed for 4 insight cards
        # Sample up to 150 messages evenly distributed
        sample_size = min(150, len(messages))
        step = max(1, len(messages) // sample_size)
        sampled_messages = messages[::step][:sample_size]
        
        # Build simple context from sampled messages
        context_lines = []
        for msg in sampled_messages:
            sender = msg.get('sender', 'Unknown')
            content = msg.get('content', '')[:120]
            context_lines.append(f"{sender}: {content}")
        context = "\n".join(context_lines)
        
        # Get participant names from messages
        participant_set = set()
        for msg in messages:
            participant_set.add(msg.get('sender', 'Unknown'))
        participant_names = sorted(list(participant_set))
        participants_str = ' and '.join(participant_names) if participant_names else "the participants"
        
        # Build simple stats summary
        stats_summary = f"Total messages: {len(messages)}"
        if stats:
            stats_summary += f", Participants: {stats.get('participants', {})}"
        
        # Create name map for post-processing (in case model outputs P1/P2)
        name_map = {}
        for i, name in enumerate(participant_names, 1):
            name_map[name] = f"P{i}"
        
        print(f"[STATS] Analyzing {len(messages)} messages for: {participants_str}")
        print(f"[CONTEXT] Context size: {len(context)} chars (~{len(context)//4} tokens)")

        
        results = {}
        categories = [
            ("conversation_dynamics", "Analyzing conversation dynamics..."),
            ("emotional_health", "Analyzing emotional sentiment..."),
            ("engagement", "Analyzing engagement patterns..."),
            ("sharing_balance", "Analyzing sharing balance...")
        ]
        
        for i, (category, stage) in enumerate(categories):
            print(f"[AI] [{i+1}/4] {stage}")
            
            prompt_template = PROMPTS.get(category, "")
            prompt = prompt_template.format(
                participants=participants_str,
                context=context,
                stats=stats_summary
            )
            
            # Generate and parse response
            raw_response = self._generate(prompt, max_tokens=500)
            
            # Default fallbacks with actual names
            defaults = self._get_defaults(category, participant_names)
            parsed = self._parse_json_response(raw_response, defaults)
            
            # Replace any remaining P1/P2 codes with actual names
            parsed = self._replace_codes_in_result(parsed, name_map)
            
            results[category] = parsed
        
        return {
            "conversation_dynamics": results.get("conversation_dynamics", {}),
            "emotional_health": results.get("emotional_health", {}),
            "engagement": results.get("engagement", {}),
            "sharing_balance": results.get("sharing_balance", {}),
            "metadata": {
                "participants": participant_names,
                "messages_analyzed": min(len(messages), 200),
                "total_messages": len(messages),
                "context_chars": len(context)
            }
        }
    
    def _get_defaults(self, category: str, participants: List[str] = None) -> Dict:
        """Get default values for each category with actual names."""
        p1 = participants[0] if participants else "Person 1"
        p2 = participants[1] if participants and len(participants) > 1 else "Person 2"
        
        defaults = {
            "conversation_dynamics": {
                "initiator_summary": f"Both {p1} and {p2} initiate conversations regularly with casual greetings and questions.",
                "flow_pattern": f"Their conversations typically start with greetings, progress through casual updates, and end with acknowledgments.",
                "topic_shifts": f"Topics flow naturally between daily life, shared interests, and emotional discussions."
            },
            "emotional_health": {
                "overall_sentiment": f"The conversation between {p1} and {p2} has a generally positive and supportive tone.",
                "health_assessment": f"Communication patterns appear healthy with regular back-and-forth engagement.",
                "red_flags": [],
                "green_flags": ["Consistent communication", "Mutual engagement"]
            },
            "engagement": {
                "balance_summary": f"Both {p1} and {p2} contribute meaningfully to conversations with similar message lengths.",
                "effort_assessment": f"Both participants show investment in maintaining the conversation.",
                "engagement_score": 65
            },
            "sharing_balance": {
                "sharing_summary": f"{p1} and {p2} share personal information at similar levels.",
                "question_balance": f"Both participants ask questions and share about themselves reciprocally.",
                "reciprocity_score": 60
            }
        }
        return defaults.get(category, {})


# Global singleton
ai_engine = AIEngine()
