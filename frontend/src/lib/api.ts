/**
 * Orbit API Client
 * 
 * Handles all communication with the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UploadResponse {
    upload_id: number;
    filename: string;
    platform: string;
    message_count: number;
    stats: GlobalStats;
}

export interface GlobalStats {
    totalMessages: number;
    startDate: string;
    endDate: string;
    topEmojis: { emoji: string; count: number }[];
    hourlyActivity: number[];
    wordCloud: { text: string; value: number }[];
    streak: {
        current: number;
        max: number;
        activeDays: Record<string, number>;
    };
    timeline: { date: string; count: number }[];
    links: { url: string; count: number }[];
    participants: Record<string, {
        count: number;
        avgLength: number;
        replyTime: number;
        doubleTextCount: number;
    }>;
    heatmap: number[][];
    initiators: { name: string; count: number }[];
}

// New AI Insights types
export interface AIInsights {
    conversation_dynamics: {
        initiator_summary: string;
        flow_pattern: string;
        topic_shifts: string;
    };
    emotional_health: {
        overall_sentiment: string;
        health_assessment: string;
        red_flags: string[];
        green_flags: string[];
    };
    engagement: {
        balance_summary: string;
        effort_assessment: string;
        engagement_score: number;
    };
    sharing_balance: {
        sharing_summary: string;
        question_balance: string;
        reciprocity_score: number;
    };
    metadata?: {
        participants: string[];
        messages_analyzed: number;
        total_messages: number;
        context_chars: number;
    };
}

export interface AIAnalyzeResponse {
    status: 'processing' | 'complete' | 'error';
    progress: number;
    stage: string;
    eta_seconds: number;
    insights: AIInsights | null;
}

export interface StatsResponse {
    upload_id: number;
    stats: GlobalStats;
    ai_insights: AIInsights | null;
}

export interface SearchResult {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
}

class OrbitAPI {
    /**
     * Upload a chat file for analysis
     */
    async uploadFile(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/api/v1/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        return response.json();
    }

    /**
     * Get stats for an upload
     */
    async getStats(uploadId: number): Promise<StatsResponse> {
        const response = await fetch(`${API_BASE}/api/v1/stats/${uploadId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }

        return response.json();
    }

    /**
     * Initialize AI engine
     */
    async initAI(): Promise<{ status: string }> {
        const response = await fetch(`${API_BASE}/api/v1/ai/init`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to initialize AI');
        }

        return response.json();
    }

    /**
     * Check AI status
     */
    async getAIStatus(): Promise<{ ready: boolean }> {
        const response = await fetch(`${API_BASE}/api/v1/ai/status`);
        return response.json();
    }

    /**
     * Run full AI analysis
     */
    async analyzeChat(uploadId: number): Promise<AIAnalyzeResponse> {
        const response = await fetch(`${API_BASE}/api/v1/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ upload_id: uploadId }),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze chat');
        }

        return response.json();
    }

    /**
     * Get cached AI insights
     */
    async getInsights(uploadId: number): Promise<{ status: string; insights: AIInsights | null }> {
        const response = await fetch(`${API_BASE}/api/v1/ai/insights/${uploadId}`);
        return response.json();
    }

    /**
     * Search messages
     */
    async searchMessages(
        uploadId: number,
        filters: {
            text?: string;
            sender?: string;
            dayOfWeek?: number;
            hourOfDay?: number;
        }
    ): Promise<{ results: SearchResult[] }> {
        const params = new URLSearchParams();
        params.append('upload_id', uploadId.toString());
        if (filters.text) params.append('text', filters.text);
        if (filters.sender) params.append('sender', filters.sender);
        if (filters.dayOfWeek !== undefined) params.append('day_of_week', filters.dayOfWeek.toString());
        if (filters.hourOfDay !== undefined) params.append('hour_of_day', filters.hourOfDay.toString());

        const response = await fetch(`${API_BASE}/api/v1/search?${params}`);
        return response.json();
    }

    /**
     * Get deep hierarchical insights (weekly, monthly, yearly summaries)
     */
    async getDeepInsights(uploadId: number): Promise<{
        status: string;
        insights: {
            participants: string[];
            total_messages: number;
            date_range: { start: string; end: string };
            yearly: Array<{
                year: number;
                messages: number;
                sentiment: number;
                evolution: string;
                patterns: string;
                highlights: string[];
            }>;
            monthly: Array<{
                month: string;
                messages: number;
                sentiment: number;
                trend: string;
                activity: string;
                topics: string[];
                narrative: string;
            }>;
            weekly: Array<{
                week: string;
                messages: number;
                sentiment: number;
                topics: string[];
                narrative: string;
            }>;
        } | null;
    }> {
        const response = await fetch(`${API_BASE}/api/v1/ai/deep-insights/${uploadId}`);
        if (!response.ok) {
            throw new Error('Failed to get deep insights');
        }
        return response.json();
    }

    /**
     * Health check
     */
    async health(): Promise<{ status: string }> {
        const response = await fetch(`${API_BASE}/health`);
        return response.json();
    }
}

export const api = new OrbitAPI();
export default api;
