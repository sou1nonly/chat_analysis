"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { Flame, Trophy } from "lucide-react";
import { clsx } from "clsx";
import ExpandedModal from "@/components/ui/ExpandedModal";
import StreakCardExpanded from "@/components/expanded/StreakCardExpanded";

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

    return (
        <div
            onClick={() => setActiveCard('streak')}
            className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-orange-500/30 transition-colors cursor-pointer h-full"
        >
            {/* Expand Hint */}
            <div className="absolute top-4 right-4 text-[9px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Click for full calendar →
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Current Streak</h3>
                    <div className="flex items-center gap-2">
                        <Flame className={clsx("w-6 h-6", current > 0 ? "text-orange-500 animate-pulse" : "text-zinc-700")} />
                        <span className="text-3xl font-heading font-bold text-white">{current} Days</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        Best: {max}
                    </div>
                </div>
            </div>

            {/* Mini Contribution Graph */}
            <div className="mt-6">
                <div className="flex justify-between text-[10px] text-zinc-600 mb-2 uppercase">
                    <span>Last 4 Weeks</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((d) => {
                        // Color scale
                        let color = "bg-zinc-800";
                        if (d.count > 0) color = "bg-emerald-900";
                        if (d.count > 10) color = "bg-emerald-700";
                        if (d.count > 50) color = "bg-emerald-500";
                        if (d.count > 100) color = "bg-emerald-400";

                        return (
                            <div
                                key={d.date}
                                className={`aspect-square rounded-sm ${color}`}
                                title={`${d.date}: ${d.count} msgs`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
