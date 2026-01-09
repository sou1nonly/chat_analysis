"""
Hierarchical Summarizer - Week → Month → Year aggregation pipeline.

Compresses chat history into temporal summaries for efficient AI processing.
50k messages → 52 weeks → 12 months → yearly summary → ~2-3k tokens
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from dataclasses import dataclass, asdict
import json

from app.services.preprocessing import (
    preprocess_all_messages,
    extract_top_words,
    get_week_id,
    get_month_id,
    get_year
)


@dataclass
class WeekBucket:
    """Weekly aggregated statistics."""
    week_id: str
    message_count: int
    avg_sentiment: float
    top_words: List[str]
    question_ratio: float
    participant_balance: float  # 0.5 = equal, >0.5 = P1 dominates
    participants: Dict[str, int]  # {name: count}
    narrative: str = ""  # AI-generated weekly summary
    
    def to_narrative(self, participant_names: List[str]) -> str:
        """Convert to natural language summary."""
        p1 = participant_names[0] if participant_names else "Person 1"
        p2 = participant_names[1] if len(participant_names) > 1 else "Person 2"
        
        # Sentiment description
        if self.avg_sentiment > 0.3:
            mood = "warm and positive"
        elif self.avg_sentiment > 0.1:
            mood = "friendly and casual"
        elif self.avg_sentiment > -0.1:
            mood = "neutral and routine"
        elif self.avg_sentiment > -0.3:
            mood = "somewhat tense"
        else:
            mood = "difficult"
        
        # Balance description
        if abs(self.participant_balance - 0.5) < 0.1:
            balance = f"Both {p1} and {p2} contributed equally"
        elif self.participant_balance > 0.6:
            balance = f"{p1} was more active in conversations"
        else:
            balance = f"{p2} was more active in conversations"
        
        # Activity level
        if self.message_count > 200:
            activity = "Very active week with lots of chatting"
        elif self.message_count > 100:
            activity = "Busy week with regular conversations"
        elif self.message_count > 50:
            activity = "Moderate week with casual check-ins"
        else:
            activity = "Quiet week with occasional messages"
        
        topics = ", ".join(self.top_words[:5]) if self.top_words else "general topics"
        
        return f"{activity}. {balance}. The tone was {mood}, discussing {topics}."


@dataclass
class MonthSummary:
    """Monthly aggregated summary."""
    month: str
    week_count: int
    total_messages: int
    avg_sentiment: float
    sentiment_trend: str  # "improving" | "stable" | "declining"
    activity_level: str   # "high" | "medium" | "low"
    key_topics: List[str]
    participant_balance: float
    narrative: str
    
    def to_narrative(self, participant_names: List[str]) -> str:
        """Generate natural language narrative."""
        return self.narrative


@dataclass
class YearSummary:
    """Yearly aggregated summary."""
    year: int
    month_count: int
    total_messages: int
    avg_sentiment: float
    sentiment_arc: str  # Overall trajectory
    evolution: str      # Relationship evolution description
    highlights: List[str]
    patterns: str
    
    def to_narrative(self) -> str:
        """Generate natural language narrative."""
        return f"{self.evolution} {self.patterns}"


class HierarchicalSummarizer:
    """
    Creates hierarchical summaries from chat messages.
    
    Pipeline: Raw Messages → Preprocessed → Weekly AI → Monthly AI → Yearly AI
    """
    
    def __init__(self, messages: List[Dict[str, Any]]):
        self.raw_messages = messages
        self.preprocessed: List[Dict[str, Any]] = []
        self.weekly_buckets: List[WeekBucket] = []
        self.monthly_summaries: List[MonthSummary] = []
        self.yearly_summaries: List[YearSummary] = []
        self.participants: List[str] = []
        
    def run_pipeline(self) -> Dict[str, Any]:
        """Run the full hierarchical AI summarization pipeline."""
        import time
        start_time = time.time()
        
        print("=" * 60)
        print("[PIPELINE] Starting Hierarchical AI Summarization")
        print(f"[INFO] Total messages: {len(self.raw_messages)}")
        print("=" * 60)
        
        # Step 1: Preprocess (~5 seconds)
        step_start = time.time()
        print("\n[1/5] Preprocessing messages...")
        self.preprocessed = preprocess_all_messages(self.raw_messages)
        self.participants = list(set(m.get('sender', 'Unknown') for m in self.preprocessed))
        self.participants.sort()
        print(f"      Done in {time.time() - step_start:.1f}s")
        print(f"      Participants: {', '.join(self.participants)}")
        
        # Step 2: Create weekly buckets and AI summaries (~2-3 min)
        step_start = time.time()
        print(f"\n[2/5] Generating weekly AI summaries (100 msgs/week)...")
        print(f"      Estimated time: 3-5 minutes")
        self._create_weekly_buckets_with_ai()
        print(f"      Done in {time.time() - step_start:.1f}s")
        print(f"      Generated {len(self.weekly_buckets)} weekly summaries")
        
        # Step 3: Monthly summaries from weekly AI (~30 sec)
        step_start = time.time()
        print(f"\n[3/5] Synthesizing monthly summaries from weekly...")
        self._create_monthly_summaries_from_weekly()
        print(f"      Done in {time.time() - step_start:.1f}s")
        print(f"      Generated {len(self.monthly_summaries)} monthly summaries")
        
        # Step 4: Yearly summaries from monthly AI (~15 sec)
        step_start = time.time()
        print(f"\n[4/5] Synthesizing yearly summaries from monthly...")
        self._create_yearly_summaries_with_ai()
        print(f"      Done in {time.time() - step_start:.1f}s")
        print(f"      Generated {len(self.yearly_summaries)} yearly summaries")
        
        # Step 5: Build context
        step_start = time.time()
        print(f"\n[5/5] Building AI context...")
        
        total_time = time.time() - start_time
        print("\n" + "=" * 60)
        print(f"[OK] Pipeline complete in {total_time:.1f}s ({total_time/60:.1f} min)")
        print(f"     {len(self.weekly_buckets)} weeks → {len(self.monthly_summaries)} months → {len(self.yearly_summaries)} years")
        print("=" * 60)
        
        return {
            "participants": self.participants,
            "weekly": [asdict(w) for w in self.weekly_buckets],
            "monthly": [asdict(m) for m in self.monthly_summaries],
            "yearly": [asdict(y) for y in self.yearly_summaries]
        }
    
    def _create_weekly_buckets_with_ai(self):
        """Group messages by ISO week, compute stats, and generate AI summaries."""
        weeks: Dict[str, List[Dict]] = defaultdict(list)
        
        for msg in self.preprocessed:
            week_id = msg.get('week_id', 'unknown')
            if week_id != 'unknown':
                weeks[week_id].append(msg)
        
        sorted_weeks = sorted(weeks.keys())
        total_weeks = len(sorted_weeks)
        
        for idx, week_id in enumerate(sorted_weeks):
            msgs = weeks[week_id]
            
            # Progress indicator
            if (idx + 1) % 10 == 0 or idx == 0:
                print(f"      Week {idx + 1}/{total_weeks}: {week_id}")
            
            # Calculate stats
            sentiments = [m['sentiment'] for m in msgs if m.get('sentiment', 0) != 0]
            avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0.0
            
            # Question ratio
            questions = sum(1 for m in msgs if m.get('classification') == 'question')
            question_ratio = questions / len(msgs) if msgs else 0
            
            # Participant balance
            participant_counts = defaultdict(int)
            for m in msgs:
                participant_counts[m.get('sender', 'Unknown')] += 1
            
            if len(self.participants) >= 2 and self.participants[0] in participant_counts:
                p1_count = participant_counts[self.participants[0]]
                total = sum(participant_counts.values())
                balance = p1_count / total if total > 0 else 0.5
            else:
                balance = 0.5
            
            # Top words
            texts = [m.get('content', '') for m in msgs]
            top_words = extract_top_words(texts, n=10)
            
            # Generate AI narrative for this week (50 msg sample)
            narrative = self._generate_ai_weekly_summary(week_id, msgs)
            
            bucket = WeekBucket(
                week_id=week_id,
                message_count=len(msgs),
                avg_sentiment=avg_sentiment,
                top_words=top_words,
                question_ratio=question_ratio,
                participant_balance=balance,
                participants=dict(participant_counts),
                narrative=narrative
            )
            
            self.weekly_buckets.append(bucket)
    
    def _generate_ai_weekly_summary(self, week_id: str, messages: List[Dict]) -> str:
        """Generate AI summary for a week using 50 message samples."""
        try:
            import ollama
            
            # Sample up to 100 meaningful messages
            meaningful_msgs = [
                m for m in messages 
                if m.get('classification') in ['statement', 'question'] 
                and len(m.get('content', '')) > 10
            ]
            
            sample_size = min(100, len(meaningful_msgs))
            if sample_size < 3:
                return f"A quiet week with {len(messages)} messages."
            
            # Even distribution sampling
            step = max(1, len(meaningful_msgs) // sample_size)
            sampled = meaningful_msgs[::step][:sample_size]
            
            p1 = self.participants[0] if self.participants else "Person 1"
            p2 = self.participants[1] if len(self.participants) > 1 else "Person 2"
            
            conversation_sample = "\n".join([
                f"{m.get('sender', 'Unknown')}: {m.get('content', '')[:120]}"
                for m in sampled
            ])
            
            prompt = f"""Summarize this week's conversation between {p1} and {p2} in 1-2 sentences. Focus on specific topics/events.

CONVERSATION SAMPLES:
{conversation_sample}

Write a brief, specific summary (1-2 sentences):"""

            response = ollama.generate(
                model="deepseek-v3.1:671b-cloud",
                prompt=prompt,
                options={"temperature": 0.6, "num_predict": 60}
            )
            
            result = response.get('response', '').strip()
            if result and len(result) > 15:
                return result
            else:
                return f"Week with {len(messages)} messages discussing various topics."
                
        except Exception as e:
            return f"Week with {len(messages)} messages."
    
    def _create_weekly_buckets(self):
        """Legacy method - redirects to AI version."""
        self._create_weekly_buckets_with_ai()
    
    def _create_monthly_summaries(self):
        """Aggregate weekly buckets into monthly summaries."""
        months: Dict[str, List[WeekBucket]] = defaultdict(list)
        
        # Also collect raw messages per month for AI summaries
        month_messages: Dict[str, List[Dict]] = defaultdict(list)
        for msg in self.preprocessed:
            month_id = msg.get('month_id', 'unknown')
            if month_id != 'unknown':
                month_messages[month_id].append(msg)
        
        for bucket in self.weekly_buckets:
            # Extract YYYY-MM from week_id (e.g., "2024-W03" -> "2024-01")
            try:
                year = int(bucket.week_id.split('-W')[0])
                week_num = int(bucket.week_id.split('-W')[1])
                # Approximate month from week number
                month_num = min(12, max(1, (week_num - 1) // 4 + 1))
                month_id = f"{year}-{month_num:02d}"
                months[month_id].append(bucket)
            except (ValueError, IndexError):
                continue
        
        for month_id in sorted(months.keys()):
            buckets = months[month_id]
            
            total_msgs = sum(b.message_count for b in buckets)
            sentiments = [b.avg_sentiment for b in buckets]
            avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
            
            # Sentiment trend
            if len(sentiments) >= 2:
                first_half = sum(sentiments[:len(sentiments)//2]) / (len(sentiments)//2)
                second_half = sum(sentiments[len(sentiments)//2:]) / (len(sentiments) - len(sentiments)//2)
                if second_half > first_half + 0.1:
                    trend = "improving"
                elif second_half < first_half - 0.1:
                    trend = "declining"
                else:
                    trend = "stable"
            else:
                trend = "stable"
            
            # Activity level
            avg_weekly_msgs = total_msgs / len(buckets) if buckets else 0
            if avg_weekly_msgs > 150:
                activity = "high"
            elif avg_weekly_msgs > 70:
                activity = "medium"
            else:
                activity = "low"
            
            # Key topics from all weeks
            all_words = []
            for b in buckets:
                all_words.extend(b.top_words[:5])
            key_topics = extract_top_words([' '.join(all_words)], n=5) if all_words else []
            
            # Balance
            total_balance = sum(b.participant_balance * b.message_count for b in buckets)
            avg_balance = total_balance / total_msgs if total_msgs > 0 else 0.5
            
            # Generate AI-powered narrative using actual message samples
            narrative = self._generate_ai_narrative_for_month(
                month_id, 
                month_messages.get(month_id, []),
                avg_sentiment,
                trend,
                activity
            )
            
            summary = MonthSummary(
                month=month_id,
                week_count=len(buckets),
                total_messages=total_msgs,
                avg_sentiment=avg_sentiment,
                sentiment_trend=trend,
                activity_level=activity,
                key_topics=key_topics,
                participant_balance=avg_balance,
                narrative=narrative
            )
            
            self.monthly_summaries.append(summary)
    
    def _generate_ai_narrative_for_month(
        self, 
        month_id: str, 
        messages: List[Dict],
        sentiment: float,
        trend: str,
        activity: str
    ) -> str:
        """Generate an AI-powered narrative for a month using actual message samples."""
        try:
            import ollama
            
            # Sample up to 30 meaningful messages (not media/reactions)
            meaningful_msgs = [
                m for m in messages 
                if m.get('classification') in ['statement', 'question'] 
                and len(m.get('content', '')) > 10
            ]
            
            # Take evenly distributed samples
            sample_size = min(30, len(meaningful_msgs))
            if sample_size == 0:
                return self._generate_fallback_narrative(month_id, sentiment, trend, activity)
            
            step = max(1, len(meaningful_msgs) // sample_size)
            sampled = meaningful_msgs[::step][:sample_size]
            
            # Build context
            p1 = self.participants[0] if self.participants else "Person 1"
            p2 = self.participants[1] if len(self.participants) > 1 else "Person 2"
            
            conversation_sample = "\n".join([
                f"{m.get('sender', 'Unknown')}: {m.get('content', '')[:150]}"
                for m in sampled
            ])
            
            prompt = f"""Based on these conversation samples between {p1} and {p2}, write a 1-2 sentence summary of what they talked about this month. Focus on specific topics, events, or themes - not generic descriptions.

CONVERSATION SAMPLES:
{conversation_sample}

Write a natural, specific summary (1-2 sentences only). 
Summary:"""

            response = ollama.generate(
                model="deepseek-v3.1:671b-cloud",
                prompt=prompt,
                options={"temperature": 0.7, "num_predict": 80}
            )
            
            narrative = response.get('response', '').strip()
            if narrative and len(narrative) > 20:
                return narrative
            else:
                return self._generate_fallback_narrative(month_id, sentiment, trend, activity)
                
        except Exception as e:
            print(f"[WARN] AI narrative failed for {month_id}: {e}")
            return self._generate_fallback_narrative(month_id, sentiment, trend, activity)
    
    def _generate_fallback_narrative(
        self,
        month_id: str,
        sentiment: float,
        trend: str,
        activity: str
    ) -> str:
        """Generate fallback narrative when AI is unavailable."""
        p1 = self.participants[0] if self.participants else "Person 1"
        p2 = self.participants[1] if len(self.participants) > 1 else "Person 2"
        
        mood = "positive" if sentiment > 0.2 else "neutral" if sentiment > -0.2 else "challenging"
        
        if trend == "improving":
            trend_text = "and things got better as the month went on"
        elif trend == "declining":
            trend_text = "though things cooled down towards the end"
        else:
            trend_text = "with consistent energy throughout"
        
        return f"A {activity} activity month between {p1} and {p2} with a {mood} vibe, {trend_text}."
    
    def _create_monthly_summaries_from_weekly(self):
        """Synthesize monthly summaries from weekly AI narratives (hierarchical approach)."""
        months: Dict[str, List[WeekBucket]] = defaultdict(list)
        
        for bucket in self.weekly_buckets:
            try:
                year = int(bucket.week_id.split('-W')[0])
                week_num = int(bucket.week_id.split('-W')[1])
                month_num = min(12, max(1, (week_num - 1) // 4 + 1))
                month_id = f"{year}-{month_num:02d}"
                months[month_id].append(bucket)
            except (ValueError, IndexError):
                continue
        
        sorted_months = sorted(months.keys())
        print(f"      Processing {len(sorted_months)} months...")
        
        for idx, month_id in enumerate(sorted_months):
            buckets = months[month_id]
            
            # Progress
            if (idx + 1) % 3 == 0:
                print(f"      Month {idx + 1}/{len(sorted_months)}: {month_id}")
            
            total_msgs = sum(b.message_count for b in buckets)
            sentiments = [b.avg_sentiment for b in buckets]
            avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
            
            # Sentiment trend
            if len(sentiments) >= 2:
                first_half = sum(sentiments[:len(sentiments)//2]) / max(1, len(sentiments)//2)
                second_half = sum(sentiments[len(sentiments)//2:]) / max(1, len(sentiments) - len(sentiments)//2)
                if second_half > first_half + 0.1:
                    trend = "improving"
                elif second_half < first_half - 0.1:
                    trend = "declining"
                else:
                    trend = "stable"
            else:
                trend = "stable"
            
            # Activity level
            avg_weekly_msgs = total_msgs / len(buckets) if buckets else 0
            if avg_weekly_msgs > 150:
                activity = "high"
            elif avg_weekly_msgs > 70:
                activity = "medium"
            else:
                activity = "low"
            
            # Key topics
            all_words = []
            for b in buckets:
                all_words.extend(b.top_words[:5])
            key_topics = extract_top_words([' '.join(all_words)], n=5) if all_words else []
            
            # Balance
            total_balance = sum(b.participant_balance * b.message_count for b in buckets)
            avg_balance = total_balance / total_msgs if total_msgs > 0 else 0.5
            
            # Generate monthly narrative FROM WEEKLY SUMMARIES (hierarchical!)
            narrative = self._synthesize_monthly_from_weekly(month_id, buckets, avg_sentiment, activity)
            
            summary = MonthSummary(
                month=month_id,
                week_count=len(buckets),
                total_messages=total_msgs,
                avg_sentiment=avg_sentiment,
                sentiment_trend=trend,
                activity_level=activity,
                key_topics=key_topics,
                participant_balance=avg_balance,
                narrative=narrative
            )
            
            self.monthly_summaries.append(summary)
    
    def _synthesize_monthly_from_weekly(
        self,
        month_id: str,
        weekly_buckets: List[WeekBucket],
        sentiment: float,
        activity: str
    ) -> str:
        """Synthesize monthly narrative from weekly AI summaries."""
        try:
            import ollama
            
            # Combine weekly narratives
            weekly_summaries = "\n".join([
                f"- Week {b.week_id}: {b.narrative}"
                for b in weekly_buckets if b.narrative
            ])
            
            if not weekly_summaries:
                return self._generate_fallback_narrative(month_id, sentiment, "stable", activity)
            
            p1 = self.participants[0] if self.participants else "Person 1"
            p2 = self.participants[1] if len(self.participants) > 1 else "Person 2"
            
            prompt = f"""Based on these weekly summaries, write a 2-3 sentence monthly summary for {p1} and {p2}.

WEEKLY SUMMARIES:
{weekly_summaries}

Write a cohesive monthly narrative (2-3 sentences) that captures the key themes:"""

            response = ollama.generate(
                model="deepseek-v3.1:671b-cloud",
                prompt=prompt,
                options={"temperature": 0.6, "num_predict": 80}
            )
            
            result = response.get('response', '').strip()
            if result and len(result) > 20:
                return result
            else:
                return self._generate_fallback_narrative(month_id, sentiment, "stable", activity)
                
        except Exception as e:
            print(f"      [WARN] Monthly synthesis failed for {month_id}: {e}")
            return self._generate_fallback_narrative(month_id, sentiment, "stable", activity)

    def _create_yearly_summaries_with_ai(self):
        """Synthesize yearly summaries from monthly AI narratives (hierarchical approach)."""
        years: Dict[int, List[MonthSummary]] = defaultdict(list)
        
        for summary in self.monthly_summaries:
            try:
                year = int(summary.month.split('-')[0])
                years[year].append(summary)
            except (ValueError, IndexError):
                continue
        
        sorted_years = sorted(years.keys())
        print(f"      Processing {len(sorted_years)} years...")
        
        for year in sorted_years:
            months = years[year]
            print(f"      Year {year}: {len(months)} months")
            
            total_msgs = sum(m.total_messages for m in months)
            sentiments = [m.avg_sentiment for m in months]
            avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
            
            # Sentiment arc
            if len(sentiments) >= 3:
                early = sum(sentiments[:len(sentiments)//3]) / max(1, len(sentiments)//3)
                late = sum(sentiments[-len(sentiments)//3:]) / max(1, len(sentiments)//3)
                if late > early + 0.15:
                    arc = "The relationship grew warmer over the year"
                elif late < early - 0.15:
                    arc = "Things cooled down compared to start of year"
                else:
                    arc = "The connection stayed consistent throughout"
            else:
                arc = "A period of steady connection"
            
            # Highlights
            highlights = []
            high_months = [m for m in months if m.activity_level == "high"]
            if high_months:
                highlights.append(f"Most active period was around {high_months[0].month}")
            
            improving_months = [m for m in months if m.sentiment_trend == "improving"]
            if improving_months:
                highlights.append(f"Things were looking up in {improving_months[0].month}")
            
            # Patterns
            high_activity_count = sum(1 for m in months if m.activity_level == "high")
            if high_activity_count > len(months) // 2:
                patterns = "They stayed in regular touch throughout."
            elif high_activity_count > 0:
                patterns = "Communication varied in intensity."
            else:
                patterns = "A quieter year with occasional conversations."
            
            # Generate AI-powered yearly narrative FROM MONTHLY SUMMARIES
            evolution = self._synthesize_yearly_from_monthly(year, months, avg_sentiment, arc)
            
            yearly = YearSummary(
                year=year,
                month_count=len(months),
                total_messages=total_msgs,
                avg_sentiment=avg_sentiment,
                sentiment_arc=arc,
                evolution=evolution,
                highlights=highlights,
                patterns=patterns
            )
            
            self.yearly_summaries.append(yearly)
    
    def _synthesize_yearly_from_monthly(
        self,
        year: int,
        monthly_summaries: List[MonthSummary],
        sentiment: float,
        arc: str
    ) -> str:
        """Synthesize yearly narrative from monthly AI summaries."""
        try:
            import ollama
            
            # Combine monthly narratives
            monthly_texts = "\n".join([
                f"- {m.month}: {m.narrative}"
                for m in monthly_summaries if m.narrative
            ])
            
            if not monthly_texts:
                return self._generate_fallback_yearly(year, sentiment, arc)
            
            p1 = self.participants[0] if self.participants else "Person 1"
            p2 = self.participants[1] if len(self.participants) > 1 else "Person 2"
            
            prompt = f"""Based on these monthly summaries, write a comprehensive 3-4 sentence yearly summary for {p1} and {p2} in {year}. Capture the key themes, events, and how their relationship evolved.

MONTHLY SUMMARIES:
{monthly_texts}

Write a rich yearly narrative (3-4 sentences):"""

            response = ollama.generate(
                model="deepseek-v3.1:671b-cloud",
                prompt=prompt,
                options={"temperature": 0.6, "num_predict": 120}
            )
            
            result = response.get('response', '').strip()
            if result and len(result) > 30:
                return result
            else:
                return self._generate_fallback_yearly(year, sentiment, arc)
                
        except Exception as e:
            print(f"      [WARN] Yearly synthesis failed for {year}: {e}")
            return self._generate_fallback_yearly(year, sentiment, arc)
    
    def _generate_fallback_yearly(self, year: int, sentiment: float, arc: str) -> str:
        """Fallback yearly narrative when AI fails."""
        p1 = self.participants[0] if self.participants else "Person 1"
        p2 = self.participants[1] if len(self.participants) > 1 else "Person 2"
        
        if sentiment > 0.25:
            tone = "warm and supportive"
        elif sentiment > 0.1:
            tone = "friendly and comfortable"
        elif sentiment > -0.1:
            tone = "casual and routine"
        else:
            tone = "going through some challenges"
        
        return f"In {year}, {p1} and {p2} had a {tone} dynamic. {arc}."
    
    def _create_yearly_summaries(self):
        """Legacy method - redirects to AI version."""
        self._create_yearly_summaries_with_ai()
    
    def build_ai_context(self, include_recent_messages: int = 10) -> str:
        """
        Build optimized context for the AI model.
        
        Structure:
        1. Yearly overview(s)
        2. ALL monthly summaries (now AI-generated, much more valuable)
        3. Sample of very recent messages
        """
        if not self.yearly_summaries:
            self.run_pipeline()
        
        lines = []
        p1 = self.participants[0] if self.participants else "Person 1"
        p2 = self.participants[1] if len(self.participants) > 1 else "Person 2"
        
        lines.append(f"CONVERSATION ANALYSIS: {p1} and {p2}")
        lines.append(f"Total messages analyzed: {len(self.preprocessed)}")
        lines.append("")
        
        # Yearly summaries
        lines.append("=== RELATIONSHIP OVER TIME ===")
        for yearly in self.yearly_summaries:
            lines.append(f"\n{yearly.year}:")
            lines.append(yearly.evolution)
            lines.append(yearly.patterns)
            if yearly.highlights:
                lines.append("Key moments: " + "; ".join(yearly.highlights))
        
        lines.append("")
        
        # ALL monthly summaries (they now contain AI-generated specific content)
        lines.append("=== MONTHLY CONVERSATION SUMMARIES ===")
        # Group by year for readability
        current_year = None
        for month in self.monthly_summaries:
            year = month.month.split('-')[0] if '-' in month.month else month.month
            if year != current_year:
                lines.append(f"\n--- {year} ---")
                current_year = year
            lines.append(f"{month.month}: {month.narrative}")
        
        lines.append("")
        
        # Recent messages sample
        if include_recent_messages > 0 and self.raw_messages:
            lines.append("=== RECENT CONVERSATION SAMPLE ===")
            recent = self.raw_messages[-include_recent_messages:]
            for msg in recent:
                sender = msg.get('sender', 'Unknown')
                content = msg.get('content', '')[:100]  # Truncate long messages
                lines.append(f"{sender}: {content}")
        
        context = "\n".join(lines)
        print(f"[CONTEXT] Built AI context: {len(context)} chars (~{len(context)//4} tokens)")
        
        return context
    
    def get_insights_data(self) -> Dict[str, Any]:
        """Get structured data for frontend InsightsDisplay component."""
        if not self.yearly_summaries:
            self.run_pipeline()
        
        return {
            "participants": self.participants,
            "total_messages": len(self.raw_messages),
            "date_range": {
                "start": self.raw_messages[0].get('timestamp', '') if self.raw_messages else '',
                "end": self.raw_messages[-1].get('timestamp', '') if self.raw_messages else ''
            },
            "yearly": [
                {
                    "year": y.year,
                    "messages": y.total_messages,
                    "sentiment": y.avg_sentiment,
                    "evolution": y.evolution,
                    "patterns": y.patterns,
                    "highlights": y.highlights
                }
                for y in self.yearly_summaries
            ],
            "monthly": [
                {
                    "month": m.month,
                    "messages": m.total_messages,
                    "sentiment": m.avg_sentiment,
                    "trend": m.sentiment_trend,
                    "activity": m.activity_level,
                    "topics": m.key_topics,
                    "narrative": m.narrative
                }
                for m in self.monthly_summaries
            ],
            "weekly": [
                {
                    "week": w.week_id,
                    "messages": w.message_count,
                    "sentiment": w.avg_sentiment,
                    "topics": w.top_words[:5],
                    "narrative": w.to_narrative(self.participants)
                }
                for w in self.weekly_buckets[-12:]  # Last 12 weeks for detail
            ]
        }
