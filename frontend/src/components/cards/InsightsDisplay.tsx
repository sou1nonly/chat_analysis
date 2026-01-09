"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface InsightsData {
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
}

interface InsightsDisplayProps {
    data: InsightsData | null;
    isLoading?: boolean;
}

// Mood indicator based on sentiment
function MoodIndicator({ sentiment }: { sentiment: number }) {
    let emoji = "😐";
    let label = "Neutral";
    let color = "text-zinc-400";

    if (sentiment > 0.3) {
        emoji = "😊";
        label = "Positive";
        color = "text-emerald-400";
    } else if (sentiment > 0.1) {
        emoji = "🙂";
        label = "Friendly";
        color = "text-green-400";
    } else if (sentiment < -0.3) {
        emoji = "😔";
        label = "Challenging";
        color = "text-rose-400";
    } else if (sentiment < -0.1) {
        emoji = "😕";
        label = "Mixed";
        color = "text-amber-400";
    }

    return (
        <span className={`inline-flex items-center gap-1.5 ${color}`}>
            <span className="text-lg">{emoji}</span>
            <span className="text-sm font-medium">{label}</span>
        </span>
    );
}

// Activity badge
function ActivityBadge({ level }: { level: string }) {
    const colors: Record<string, string> = {
        high: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        low: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
    };

    const labels: Record<string, string> = {
        high: "Very Active",
        medium: "Regular",
        low: "Quiet"
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs border ${colors[level] || colors.medium}`}>
            {labels[level] || level}
        </span>
    );
}

// Year card with expandable months
function YearCard({
    data,
    isExpanded,
    onToggle
}: {
    data: InsightsData['yearly'][0];
    isExpanded: boolean;
    onToggle: () => void;
}) {
    return (
        <motion.div
            layout
            className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden"
        >
            {/* Header - Always visible */}
            <button
                onClick={onToggle}
                className="w-full p-5 flex items-start justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-white">{data.year}</span>
                        <MoodIndicator sentiment={data.sentiment} />
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                        {data.evolution}
                    </p>
                </div>
                <div className="ml-4 p-2 rounded-lg bg-white/5">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                </div>
            </button>

            {/* Expandable content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/5"
                    >
                        <div className="p-5 space-y-3">
                            <p className="text-zinc-400 text-sm">{data.patterns}</p>

                            {data.highlights.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                                        Key Moments
                                    </span>
                                    <ul className="space-y-1">
                                        {data.highlights.map((h, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                                                <Sparkles className="w-3 h-3 text-purple-400" />
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="pt-2 flex items-center gap-4 text-xs text-zinc-500">
                                <span>{data.messages.toLocaleString()} messages</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Month card (for timeline view) - NOW EXPANDABLE
function MonthCard({
    data,
    isExpanded,
    onToggle
}: {
    data: InsightsData['monthly'][0];
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const monthName = new Date(data.month + "-01").toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });

    return (
        <motion.div
            layout
            onClick={onToggle}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${isExpanded
                ? 'border-purple-500/50 bg-zinc-800/70 col-span-1 md:col-span-2 lg:col-span-3 shadow-lg shadow-purple-500/10'
                : 'border-white/5 bg-zinc-800/30 hover:bg-zinc-800/50 hover:border-white/10'
                }`}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{monthName}</span>
                <div className="flex items-center gap-2">
                    <ActivityBadge level={data.activity} />
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xs text-purple-400"
                        >
                            Click to collapse
                        </motion.span>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.p
                    key={isExpanded ? 'full' : 'truncated'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`text-sm text-zinc-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'
                        }`}
                >
                    {data.narrative}
                </motion.p>
            </AnimatePresence>

            {data.topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {(isExpanded ? data.topics : data.topics.slice(0, 3)).map((topic, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-zinc-400 border border-white/5"
                        >
                            {topic}
                        </span>
                    ))}
                </div>
            )}

            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-zinc-500"
                >
                    <span>{data.messages.toLocaleString()} messages</span>
                    <span>Trend: {data.trend}</span>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function InsightsDisplay({ data, isLoading }: InsightsDisplayProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
    const [expandedYear, setExpandedYear] = useState<number | null>(null);
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

    // Auto-expand latest year
    useEffect(() => {
        if (data?.yearly?.length) {
            setExpandedYear(data.yearly[data.yearly.length - 1].year);
        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-8">
                <div className="flex items-center justify-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Calendar className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <span className="text-zinc-400">Building your relationship timeline...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Your Story Together</h2>
                        <p className="text-xs text-zinc-500">
                            {data.total_messages.toLocaleString()} messages analyzed
                        </p>
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="flex rounded-lg bg-zinc-800/50 p-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === 'overview'
                            ? 'bg-purple-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === 'timeline'
                            ? 'bg-purple-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Timeline
                    </button>
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {data.yearly.map((year) => (
                            <YearCard
                                key={year.year}
                                data={year}
                                isExpanded={expandedYear === year.year}
                                onToggle={() => setExpandedYear(
                                    expandedYear === year.year ? null : year.year
                                )}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="timeline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                        {data.monthly.slice(-12).reverse().map((month) => (
                            <MonthCard
                                key={month.month}
                                data={month}
                                isExpanded={expandedMonth === month.month}
                                onToggle={() => setExpandedMonth(
                                    expandedMonth === month.month ? null : month.month
                                )}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
