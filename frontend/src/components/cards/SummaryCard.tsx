"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { MessageSquare, Clock, Calendar, Zap } from "lucide-react";

export default function SummaryCard() {
    const { stats } = useOrbitStore();

    if (!stats) return null;

    const count = stats.totalMessages;
    const topEmoji = stats.topEmojis[0]?.emoji || "✨";
    // Ghost score placeholder for now, requires deeper analysis
    const ghostScore = "???";
    const startDate = new Date(stats.startDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="w-full grid grid-cols-2 gap-4">
            {/* Stat 1: Total Messages */}
            <div className="bg-zinc-800/50 rounded-3xl p-6 border border-zinc-700/50 flex flex-col justify-between aspect-square hover:bg-zinc-800 transition-colors">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                <div>
                    <p className="text-3xl font-heading font-bold text-white">{count.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500 uppercase mt-1">Total Texts</p>
                </div>
            </div>

            {/* Stat 2: Top Emoji */}
            <div className="bg-zinc-800/50 rounded-3xl p-6 border border-zinc-700/50 flex flex-col justify-between aspect-square hover:bg-zinc-800 transition-colors">
                <span className="text-4xl">{topEmoji}</span>
                <div>
                    <p className="text-xs text-zinc-500 uppercase mt-2">Top Emoji</p>
                    <p className="text-[10px] text-zinc-600">Used {stats.topEmojis[0]?.count} times</p>
                </div>
            </div>

            {/* Stat 3: Ghost Score */}
            <div className="bg-zinc-800/50 rounded-3xl p-6 border border-zinc-700/50 flex flex-col justify-between aspect-square hover:bg-zinc-800 transition-colors">
                <Clock className="w-6 h-6 text-pink-400" />
                <div>
                    <p className="text-2xl font-heading font-bold text-white">{ghostScore}</p>
                    <p className="text-xs text-zinc-500 uppercase mt-1">Avg Reply Time</p>
                </div>
            </div>

            {/* Stat 4: Start Date */}
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-6 border border-zinc-700/50 flex flex-col justify-between aspect-square hover:from-zinc-700 hover:to-zinc-800 transition-colors">
                <Calendar className="w-6 h-6 text-blue-400" />
                <div>
                    <p className="text-sm font-heading font-bold text-white">{startDate}</p>
                    <p className="text-xs text-zinc-500 uppercase mt-1">First Text</p>
                </div>
            </div>
        </div>
    );
}
