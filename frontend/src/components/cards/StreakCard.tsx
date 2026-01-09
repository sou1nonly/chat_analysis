"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Flame, Trophy } from "lucide-react";

export default function StreakCard() {
    const { stats, setActiveCard } = useOrbitStore();

    if (!stats) return null;

    const { current, max, activeDays } = stats.streak;

    // Generate last 28 days grid (4 weeks)
    const days = [];
    for (let i = 27; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const count = activeDays[iso] || 0;
        days.push({ date: iso, count });
    }

    // Green intensity
    const getIntensity = (count: number) => {
        if (count === 0) return "bg-green-500/10";
        if (count <= 10) return "bg-green-500/30";
        if (count <= 50) return "bg-green-500/50";
        if (count <= 100) return "bg-green-400/70";
        return "bg-green-400";
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${current > 0 ? 'text-orange-400' : 'text-gray-600'}`} />
                    <span className="text-xl font-bold text-white font-heading">{current}</span>
                    <span className="text-xs text-gray-500">days</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-yellow-500">
                    <Trophy className="w-3 h-3" />
                    <span>Best: {max}</span>
                </div>
            </div>

            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Current Streak</p>

            {/* Grid - Last 4 Weeks */}
            <div className="flex-1 flex flex-col justify-end">
                <div className="grid grid-cols-7 gap-1">
                    {days.map((d) => (
                        <div
                            key={d.date}
                            className={`aspect-square rounded ${getIntensity(d.count)} hover:ring-1 hover:ring-green-400/50 transition-all`}
                            title={`${d.date}: ${d.count} msgs`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
