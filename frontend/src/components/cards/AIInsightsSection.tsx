"use client";

import { useOrbitStore, AIInsights } from "@/store/useOrbitStore";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageSquare, Heart, Users, BarChart3, Sparkles } from "lucide-react";
import api from "@/lib/api";
import InsightsDisplay from "./InsightsDisplay";
import ModelSelector from "@/components/ui/ModelSelector";

// Individual insight card components
function InsightCard({
    title,
    icon: Icon,
    gradient,
    children,
    delay = 0
}: {
    title: string;
    icon: React.ElementType;
    gradient: string;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0A0A0B]/60 backdrop-blur-xl p-6 cursor-pointer hover:border-white/[0.15] hover:bg-[#0A0A0B]/80 transition-all duration-300"
        >
            {/* Spot Gradient Background */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 ${gradient.replace('bg-', '')} opacity-10 blur-[50px] group-hover:opacity-20 transition-opacity duration-500 rounded-full`} />

            {/* Accent Line */}
            <div className={`absolute top-0 left-6 right-6 h-[1px] ${gradient} opacity-50`} />

            {/* Header */}
            <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-br')} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
            </div>

            {/* Content */}
            <div className="space-y-4 relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

function InsightText({ label, value }: { label: string; value: string | object }) {
    // Safety: convert objects to string if AI returns structured data
    const displayValue = typeof value === 'object' && value !== null
        ? JSON.stringify(value, null, 2).replace(/[{}\"]/g, '').trim()
        : String(value || 'Waiting for analysis...');

    return (
        <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</span>
            <p className="text-sm text-zinc-300 leading-relaxed">{displayValue}</p>
        </div>
    );
}


function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
    return (
        <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[11px] font-medium tracking-wide">
                <span className="text-zinc-500">{label}</span>
                <span className="text-white">{score}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(168,85,247,0.4)]`}
                />
            </div>
        </div>
    );
}

function FlagBadge({ type, text }: { type: 'red' | 'green'; text: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const colors = type === 'red'
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    const emoji = type === 'red' ? '🚩' : '💚';

    return (
        <motion.div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs cursor-pointer hover:opacity-80 transition-all ${colors}`}
            layout
        >
            <span>{emoji}</span>
            <motion.span
                className={isExpanded ? '' : 'truncate max-w-[200px]'}
                layout
            >
                {text}
            </motion.span>
        </motion.div>
    );
}

// Pipeline stages for progress display
const PIPELINE_STAGES = [
    { id: 'init', label: 'Initializing AI engine', percent: 5 },
    { id: 'timeline', label: 'Building your timeline', percent: 20 },
    { id: 'weekly', label: 'Analyzing weekly patterns', percent: 40 },
    { id: 'monthly', label: 'Generating monthly insights', percent: 60 },
    { id: 'yearly', label: 'Creating yearly overview', percent: 80 },
    { id: 'insights', label: 'Generating AI insights', percent: 95 },
];

// Improved loading overlay with accurate progress
function LoadingOverlay({ stage, progress, eta }: { stage: string; progress: number; eta: number }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-black/60 rounded-2xl">
            <div className="w-full max-w-md px-8 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
                    >
                        <Brain className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Analyzing Your Chat</h3>
                        <p className="text-sm text-zinc-400">{stage}</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-3">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>{progress}% complete</span>
                        <span>~{eta} seconds remaining</span>
                    </div>
                </div>

                {/* Current stage indicator */}
                <div className="mt-6 space-y-2">
                    {PIPELINE_STAGES.map((s) => {
                        const isComplete = progress >= s.percent;
                        const isCurrent = progress >= s.percent - 15 && progress < s.percent + 5;

                        return (
                            <div key={s.id} className={`flex items-center gap-2 text-sm ${isComplete ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-zinc-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-400' : isCurrent ? 'bg-purple-400 animate-pulse' : 'bg-zinc-700'}`} />
                                {s.label}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


export default function AIInsightsSection() {
    const {
        uploadId,
        aiInsights, setAiInsights,
        aiStatus, setAiStatus,
        aiProgress, aiStage, aiEta, setAiProgress,
        aiStarted,
        aiModelType,
        selectedOfflineModel,
        stats
    } = useOrbitStore();

    const [metadata, setMetadata] = useState<{
        participants?: string[];
        messages_analyzed?: number;
        total_messages?: number;
    } | null>(null);

    // Deep insights for hierarchical timeline
    const [deepInsights, setDeepInsights] = useState<{
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
    } | null>(null);

    // Refs to prevent duplicate API calls
    const analysisStartedRef = useRef(false);

    // Reset when upload changes
    useEffect(() => {
        setDeepInsights(null);
        analysisStartedRef.current = false;
    }, [uploadId]);

    // Calculate ETA based on message count
    const calculateEta = (messageCount: number, currentProgress: number) => {
        const baseTime = 30; // seconds
        const timePerThousand = 15;
        const totalEstimate = baseTime + (messageCount / 1000) * timePerThousand;
        return Math.max(5, Math.round(totalEstimate * (1 - currentProgress / 100)));
    };

    // Run unified analysis pipeline when user clicks start
    useEffect(() => {
        if (!uploadId || !stats || !aiStarted || analysisStartedRef.current) {
            return;
        }
        analysisStartedRef.current = true;

        const runUnifiedAnalysis = async () => {
            const messageCount = stats.totalMessages || 1000;

            try {
                // Stage 0: Pre-flight check
                setAiStatus('analyzing');
                setAiProgress(2, 'Checking AI availability...', calculateEta(messageCount, 2));
                const modelId = aiModelType === 'offline' ? selectedOfflineModel : undefined;

                const preflight = await api.preflight(aiModelType, modelId);

                if (!preflight.ready) {
                    // Show specific error message in UI (don't throw to avoid dev overlay)
                    let errorMsg = preflight.message || 'AI is not available.';
                    if (preflight.rate_limited) {
                        errorMsg = 'Rate limit reached. Please wait or upgrade to continue.';
                    } else if (!preflight.ollama_running) {
                        errorMsg = 'Ollama is not running. Please start Ollama first.';
                    }
                    setAiStatus('error');
                    setAiProgress(0, errorMsg, 0);
                    return; // Exit analysis early
                }

                // Stage 1: Initialize (now safe to proceed)
                setAiProgress(5, 'Initializing AI engine...', calculateEta(messageCount, 5));
                await api.initAI(aiModelType, modelId);

                // Stage 2: Get deep insights FIRST (timeline, weekly, monthly, yearly)
                setAiProgress(20, 'Building your timeline...', calculateEta(messageCount, 20));

                // Pass model config to API
                const deepResponse = await api.getDeepInsights(uploadId, aiModelType, modelId);

                if (deepResponse.status === 'complete' && deepResponse.insights) {
                    setDeepInsights(deepResponse.insights);
                    setAiProgress(70, 'Timeline complete, generating insights...', calculateEta(messageCount, 70));
                }

                // Stage 3: Generate AI insights
                setAiProgress(80, 'Generating AI insights...', calculateEta(messageCount, 80));

                const response = await api.analyzeChat(uploadId, aiModelType, modelId);

                if (response.status === 'complete' && response.insights) {
                    // Store metadata if available
                    if ((response as any).insights?.metadata) {
                        setMetadata((response as any).insights.metadata);
                    }

                    // Map API response to store format
                    setAiInsights({
                        conversationDynamics: {
                            initiatorSummary: response.insights.conversation_dynamics?.initiator_summary || "",
                            flowPattern: response.insights.conversation_dynamics?.flow_pattern || "",
                            topicShifts: response.insights.conversation_dynamics?.topic_shifts || "",
                        },
                        emotionalHealth: {
                            overallSentiment: response.insights.emotional_health?.overall_sentiment || "",
                            healthAssessment: response.insights.emotional_health?.health_assessment || "",
                            redFlags: response.insights.emotional_health?.red_flags || [],
                            greenFlags: response.insights.emotional_health?.green_flags || [],
                        },
                        engagement: {
                            balanceSummary: response.insights.engagement?.balance_summary || "",
                            effortAssessment: response.insights.engagement?.effort_assessment || "",
                            engagementScore: response.insights.engagement?.engagement_score || 50,
                        },
                        sharingBalance: {
                            sharingSummary: response.insights.sharing_balance?.sharing_summary || "",
                            questionBalance: response.insights.sharing_balance?.question_balance || "",
                            reciprocityScore: response.insights.sharing_balance?.reciprocity_score || 50,
                        }
                    });

                    setAiProgress(100, 'Analysis complete!', 0);
                    setAiStatus('complete');
                }
            } catch (error: any) {
                console.error('AI analysis failed:', error);
                setAiStatus('error');
                const errorMessage = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
                setAiProgress(0, errorMessage, 0);
            }
        };

        runUnifiedAnalysis();
    }, [uploadId, stats, aiStarted]);

    const isLoading = aiStatus === 'preprocessing' || aiStatus === 'analyzing';
    const hasError = aiStatus === 'error';
    const showModelSelector = !aiStarted && aiStatus === 'idle' && !aiInsights;

    return (
        <div className="col-span-1 md:col-span-4 mt-8">
            <div className="relative">
                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-white">AI Insights</h2>
                            <p className="text-[10px] text-[#636366] uppercase tracking-widest">Deep pattern analysis</p>
                        </div>
                    </div>

                    {/* Metadata badge */}
                    {metadata && (
                        <div className="hidden md:flex items-center gap-2 bg-[#1C1C1E] px-3 py-2 rounded-full border border-white/[0.06]">
                            <span className="text-xs text-[#8E8E93]">
                                {metadata.messages_analyzed?.toLocaleString()} messages analyzed
                            </span>
                        </div>
                    )}
                </div>

                {/* Model Selector - shown before analysis starts */}
                {showModelSelector && (
                    <ModelSelector />
                )}

                {/* Analysis content - shown after analysis starts */}
                {(aiStarted || aiInsights) && (
                    <div className="relative min-h-[300px]">
                        {/* Loading overlay */}
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <LoadingOverlay
                                        stage={aiStage}
                                        progress={aiProgress}
                                        eta={aiEta}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error state */}
                        {hasError && !isLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/80 rounded-2xl">
                                <div className="text-center space-y-3">
                                    <p className="text-red-400 font-medium">Analysis failed</p>
                                    <button
                                        onClick={() => {
                                            setAiStatus('idle');
                                            setAiInsights(null as any);
                                            analysisStartedRef.current = false;
                                        }}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors cursor-pointer"
                                    >
                                        Retry Analysis
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Cards grid */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ${isLoading ? 'blur-sm opacity-30' : ''}`}>
                            {/* Card 1: Conversation Dynamics */}
                            <InsightCard
                                title="Conversation Flow"
                                icon={MessageSquare}
                                gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
                                delay={0}
                            >
                                <InsightText
                                    label="Who Initiates"
                                    value={aiInsights?.conversationDynamics.initiatorSummary || "Waiting for analysis..."}
                                />
                                <InsightText
                                    label="Flow Pattern"
                                    value={aiInsights?.conversationDynamics.flowPattern || "Waiting for analysis..."}
                                />
                            </InsightCard>

                            {/* Card 2: Emotional Health */}
                            <InsightCard
                                title="Emotional Sentiment"
                                icon={Heart}
                                gradient="bg-gradient-to-r from-pink-500 to-rose-500"
                                delay={0.1}
                            >
                                <InsightText
                                    label="Overall Tone"
                                    value={aiInsights?.emotionalHealth.overallSentiment || "Waiting for analysis..."}
                                />
                                {aiInsights && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {aiInsights.emotionalHealth.greenFlags.slice(0, 2).map((flag, i) => (
                                            <FlagBadge key={`g-${i}`} type="green" text={flag} />
                                        ))}
                                        {aiInsights.emotionalHealth.redFlags.slice(0, 1).map((flag, i) => (
                                            <FlagBadge key={`r-${i}`} type="red" text={flag} />
                                        ))}
                                    </div>
                                )}
                            </InsightCard>

                            {/* Card 3: Engagement */}
                            <InsightCard
                                title="Engagement Depth"
                                icon={BarChart3}
                                gradient="bg-gradient-to-r from-purple-500 to-violet-500"
                                delay={0.2}
                            >
                                <InsightText
                                    label="Balance"
                                    value={aiInsights?.engagement.balanceSummary || "Waiting for analysis..."}
                                />
                                <ScoreBar
                                    label="Engagement Score"
                                    score={aiInsights?.engagement.engagementScore || 0}
                                    color="bg-gradient-to-r from-purple-500 to-violet-500"
                                />
                            </InsightCard>

                            {/* Card 4: Sharing Balance */}
                            <InsightCard
                                title="Personal Sharing"
                                icon={Users}
                                gradient="bg-gradient-to-r from-amber-500 to-orange-500"
                                delay={0.3}
                            >
                                <InsightText
                                    label="Openness"
                                    value={aiInsights?.sharingBalance.sharingSummary || "Waiting for analysis..."}
                                />
                                <ScoreBar
                                    label="Reciprocity Score"
                                    score={aiInsights?.sharingBalance.reciprocityScore || 0}
                                    color="bg-gradient-to-r from-amber-500 to-orange-500"
                                />
                            </InsightCard>
                        </div>

                        {/* Deep Insights - Your Story Together (Timeline) */}
                        {deepInsights && (
                            <div className="mt-8">
                                <InsightsDisplay
                                    data={deepInsights}
                                    isLoading={false}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
