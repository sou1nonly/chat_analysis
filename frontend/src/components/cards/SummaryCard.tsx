"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { MessageSquare, Clock, Calendar } from "lucide-react";

export default function SummaryCard() {
    const { stats } = useOrbitStore();

    if (!stats) return null;

    const count = stats.totalMessages;
    const topEmoji = stats.topEmojis[0]?.emoji || "✨";
    const emojiCount = stats.topEmojis[0]?.count || 0;
    const startDate = new Date(stats.startDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const daysTogether = Math.ceil(
        (new Date(stats.endDate).getTime() - new Date(stats.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">Overview</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Quick Stats</p>
                </div>
            </div>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
                {/* Total Messages */}
                <div className="bg-[#0D0D0F] rounded-xl p-3 border border-white/5">
                    <p className="text-2xl font-bold text-white font-heading">{count.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-500 uppercase mt-1">Total Messages</p>
                </div>

                {/* Top Emoji */}
                <div className="bg-[#0D0D0F] rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                    <span className="text-2xl">{topEmoji}</span>
                    <div>
                        <p className="text-xs text-purple-400 font-semibold">{emojiCount.toLocaleString()}×</p>
                        <p className="text-[9px] text-gray-500 uppercase">Top Emoji</p>
                    </div>
                </div>

                {/* Days Together */}
                <div className="bg-[#0D0D0F] rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-green-400" />
                    </div>
                    <p className="text-xl font-bold text-white font-heading">{daysTogether.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-500 uppercase">Days Together</p>
                </div>

                {/* First Message */}
                <div className="bg-[#0D0D0F] rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                    </div>
                    <p className="text-sm font-bold text-white font-heading">{startDate}</p>
                    <p className="text-[9px] text-gray-500 uppercase">First Message</p>
                </div>
            </div>
        </div>
    );
}
