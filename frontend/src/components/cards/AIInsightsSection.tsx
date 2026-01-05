"use client";

import { useOrbitStore, AIInsights } from "@/store/useOrbitStore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageSquare, Heart, Users, BarChart3, Sparkles } from "lucide-react";
import api from "@/lib/api";

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
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl p-5 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        >
            {/* Gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${gradient}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h3>
            </div>

            {/* Content */}
            <div className="space-y-3">
                {children}
            </div>
        </motion.div>
    );
}

function InsightText({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</span>
            <p className="text-sm text-zinc-300 leading-relaxed">{value}</p>
        </div>
    );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-zinc-500">{label}</span>
                <span className="text-zinc-300 font-medium">{score}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
}

function FlagBadge({ type, text }: { type: 'red' | 'green'; text: string }) {
    const colors = type === 'red'
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    const emoji = type === 'red' ? '🚩' : '💚';

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs ${colors}`}>
            <span>{emoji}</span>
            <span className="truncate max-w-[200px]">{text}</span>
        </div>
    );
}

// Honest loading overlay with indeterminate animation
function LoadingOverlay({ stage }: { stage: string }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-black/50 rounded-2xl">
            <div className="text-center space-y-5 px-8">
                {/* Animated brain icon with pulse */}
                <div className="relative">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
                    >
                        <Brain className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Sparkles around the brain */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
                        <Sparkles className="w-3 h-3 text-pink-400 absolute -bottom-1 -left-1" />
                    </motion.div>
                </div>

                {/* Indeterminate progress bar */}
                <div className="w-72 mx-auto">
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="h-full w-1/3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Status text */}
                <div className="space-y-1">
                    <p className="text-base text-white font-medium">{stage}</p>
                    <p className="text-xs text-zinc-400">
                        This may take 30-60 seconds for large chats
                    </p>
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
        setAiProgress,
        stats
    } = useOrbitStore();

    const [loadingStage, setLoadingStage] = useState("Initializing AI...");
    const [metadata, setMetadata] = useState<{
        participants?: string[];
        messages_analyzed?: number;
        total_messages?: number;
    } | null>(null);

    // Trigger AI analysis when stats are ready
    useEffect(() => {
        if (!uploadId || !stats || aiInsights || aiStatus === 'analyzing') {
            return;
        }

        const runAnalysis = async () => {
            setAiStatus('analyzing');
            setLoadingStage("Connecting to AI engine...");

            try {
                // Init AI
                await api.initAI();
                setLoadingStage("Analyzing your chat history...");

                // Run analysis
                const response = await api.analyzeChat(uploadId);

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
                    setAiStatus('complete');
                }
            } catch (error) {
                console.error('AI analysis failed:', error);
                setAiStatus('error');
                setLoadingStage("Analysis failed. Please try again.");
            }
        };

        runAnalysis();
    }, [uploadId, stats, aiInsights, aiStatus]);

    const isLoading = aiStatus === 'preprocessing' || aiStatus === 'analyzing';
    const hasError = aiStatus === 'error';

    return (
        <div className="col-span-1 md:col-span-4 mt-8">
            <div className="relative">
                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Insights</h2>
                            <p className="text-xs text-zinc-500">Powered by Ollama • qwen2.5</p>
                        </div>
                    </div>

                    {/* Metadata badge */}
                    {metadata && (
                        <div className="hidden md:flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50">
                            <span className="text-xs text-zinc-400">
                                Analyzed {metadata.messages_analyzed?.toLocaleString()} of {metadata.total_messages?.toLocaleString()} messages
                            </span>
                        </div>
                    )}
                </div>

                {/* Cards grid with blur overlay when loading */}
                <div className="relative min-h-[300px]">
                    {/* Loading overlay */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <LoadingOverlay stage={loadingStage} />
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
                                    }}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors"
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
                </div>
            </div>
        </div>
    );
}
