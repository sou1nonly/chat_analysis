import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types inline to avoid import issues after migration
export interface GlobalStats {
    aura: any;
    totalMessages: number;
    startDate: Date;
    endDate: Date;
    topEmojis: { emoji: string; count: number }[];
    monthlyEmojis: { date: string; emojis: { emoji: string; count: number }[] }[];
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

// New AI Insights structure
export interface AIInsights {
    conversationDynamics: {
        initiatorSummary: string;
        flowPattern: string;
        topicShifts: string;
    };
    emotionalHealth: {
        overallSentiment: string;
        healthAssessment: string;
        redFlags: string[];
        greenFlags: string[];
    };
    engagement: {
        balanceSummary: string;
        effortAssessment: string;
        engagementScore: number;
    };
    sharingBalance: {
        sharingSummary: string;
        questionBalance: string;
        reciprocityScore: number;
    };
}

interface OrbitState {
    // Backend Integration
    uploadId: number | null;
    setUploadId: (id: number) => void;

    stats: GlobalStats | null;
    setStats: (stats: GlobalStats) => void;

    status: 'idle' | 'parsing' | 'cleaning' | 'analyzing' | 'complete' | 'error';
    statusMessage: string | null;
    setStatus: (status: 'idle' | 'parsing' | 'cleaning' | 'analyzing' | 'complete' | 'error', message?: string | null) => void;

    progress: number;
    setProgress: (progress: number | ((prev: number) => number)) => void;

    rawFiles: File[];
    setFiles: (files: File[]) => void;

    // New AI State
    aiInsights: AIInsights | null;
    setAiInsights: (insights: AIInsights) => void;
    aiStatus: 'idle' | 'preprocessing' | 'analyzing' | 'complete' | 'error';
    aiProgress: number; // 0-100
    aiStage: string; // "Preprocessing messages..."
    aiEta: number; // seconds remaining
    setAiStatus: (status: 'idle' | 'preprocessing' | 'analyzing' | 'complete' | 'error') => void;
    setAiProgress: (progress: number, stage: string, eta: number) => void;

    // Search State
    searchResults: any[];
    setSearchResults: (results: any[]) => void;
    activeCard: string | null;
    setActiveCard: (cardName: string | null) => void;

    // Pipeline State
    isPipelineReady: boolean;
    processingLog: string[];
    addLog: (log: string) => void;
    setPipelineReady: (ready: boolean) => void;

    reset: () => void;
}

export const useOrbitStore = create<OrbitState>()(
    persist(
        (set) => ({
            uploadId: null,
            stats: null,
            status: 'idle',
            statusMessage: null,
            progress: 0,
            rawFiles: [],

            aiInsights: null,
            aiStatus: 'idle',
            aiProgress: 0,
            aiStage: '',
            aiEta: 0,

            searchResults: [],
            activeCard: null,

            isPipelineReady: false,
            processingLog: [],

            // Clear AI insights when upload changes to prevent stale data
            setUploadId: (id) => set({
                uploadId: id,
                aiInsights: null,
                aiStatus: 'idle',
                aiProgress: 0,
                aiStage: '',
                aiEta: 0
            }),
            addLog: (log) => set((state) => ({ processingLog: [...state.processingLog, log] })),
            setPipelineReady: (ready) => set({ isPipelineReady: ready }),

            setStats: (stats) => set({ stats, status: 'complete' }),
            setStatus: (status, message) => set({ status, statusMessage: message || null }),
            setProgress: (progress) => set((state) => ({
                progress: typeof progress === 'function' ? progress(state.progress) : progress
            })),
            setFiles: (files) => set({ rawFiles: files }),

            setAiInsights: (insights) => set({ aiInsights: insights }),
            setAiStatus: (status) => set({ aiStatus: status }),
            setAiProgress: (progress, stage, eta) => set({
                aiProgress: progress,
                aiStage: stage,
                aiEta: eta
            }),

            setSearchResults: (results) => set({ searchResults: results }),
            setActiveCard: (cardName) => set({ activeCard: cardName }),

            reset: () => set({
                uploadId: null,
                stats: null,
                status: 'idle',
                statusMessage: null,
                progress: 0,
                rawFiles: [],
                aiInsights: null,
                aiStatus: 'idle',
                aiProgress: 0,
                aiStage: '',
                aiEta: 0,
                searchResults: [],
                activeCard: null,
                isPipelineReady: false,
                processingLog: []
            }),
        }),
        {
            name: 'orbit-storage',
            storage: createJSONStorage(() => sessionStorage),
            // NOTE: aiInsights is NOT persisted - always fetched fresh
            partialize: (state) => ({
                uploadId: state.uploadId,
                stats: state.stats,
                activeCard: state.activeCard,
                isPipelineReady: state.isPipelineReady
            })
        }
    )
);
