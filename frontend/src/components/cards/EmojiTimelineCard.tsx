"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function EmojiTimelineCard() {
    const { stats } = useOrbitStore();

    // Process real emoji data from backend
    const emojiData = useMemo(() => {
        if (!stats || !stats.monthlyEmojis) return [];

        // Take last 12 months
        const recentMonths = stats.monthlyEmojis.slice(-12);

        if (recentMonths.length === 0) return [];

        // Find max count for scaling (sum of top emojis counts)
        const maxCount = Math.max(
            ...recentMonths.map(m => m.emojis.reduce((sum, e) => sum + e.count, 0)),
            1
        );

        return recentMonths.map(m => {
            const date = new Date(m.date + "-01");
            const total = m.emojis.reduce((sum, e) => sum + e.count, 0);

            // Limit stack to 8 emojis max for cleaner look
            const stackHeight = Math.max(1, Math.min(8, Math.ceil((total / maxCount) * 8)));

            // Expand the emojis to fill the stack height based on their distribution
            const stackEmojis: string[] = [];

            if (total > 0) {
                m.emojis.forEach(e => {
                    // How many slots should this emoji take?
                    const slots = Math.round((e.count / total) * stackHeight);
                    for (let i = 0; i < slots; i++) stackEmojis.push(e.emoji);
                });

                // Fill or trim to match exact stackHeight
                while (stackEmojis.length < stackHeight && m.emojis.length > 0) {
                    stackEmojis.push(m.emojis[0].emoji);
                }
                while (stackEmojis.length > stackHeight) {
                    stackEmojis.pop();
                }
            }

            return {
                label: MONTHS[date.getMonth()],
                emojis: stackEmojis.reverse(), // Reverse so most freq is at bottom (or top depending on render)
                total,
                rawEmojis: m.emojis
            };
        });
    }, [stats]);

    if (!stats || emojiData.length === 0) return null;

    return (
        <div className="h-full flex flex-col min-h-[280px]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">Emoji Mix Over Time</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Top Monthly Emojis</p>
                </div>
            </div>

            {/* Emoji Chart */}
            <div className="flex-1 flex items-end justify-between px-2 pb-2 gap-2">
                {emojiData.map((month, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group min-w-[32px] relative">

                        {/* Emoji Stack */}
                        <div className="flex flex-col-reverse items-center gap-[2px] w-full transition-all duration-300 hover:-translate-y-1">
                            {month.emojis.map((emoji, j) => (
                                <span
                                    key={j}
                                    className="text-xl leading-none filter drop-shadow-md hover:scale-110 transition-transform cursor-default select-none"
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>

                        {/* Month Label */}
                        <span className="text-[10px] text-gray-500 font-medium group-hover:text-pink-400 transition-colors">
                            {month.label}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-3 hidden group-hover:block z-20 left-1/2 -translate-x-1/2 pointer-events-none">
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl whitespace-nowrap min-w-[140px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <p className="font-semibold text-white mb-2 text-xs border-b border-white/10 pb-2 flex justify-between items-center">
                                    <span>{month.label}</span>
                                    <span className="text-gray-400">{month.total} Emojis</span>
                                </p>
                                <div className="space-y-1.5">
                                    {month.rawEmojis.map((e, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                                            <span>{e.emoji}</span>
                                            <span className="text-gray-400 font-mono">{e.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
