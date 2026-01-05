"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import ExpandedModal from "@/components/ui/ExpandedModal";
import EngagementExpanded from "@/components/expanded/EngagementExpanded";

export default function EngagementCard() {
    const { stats, setActiveCard } = useOrbitStore();

    if (!stats) return null;

    const people = Object.entries(stats.participants);
    if (people.length < 2) return null; // Need at least 2 for comparison

    const p1 = { name: people[0][0], ...people[0][1] };
    const p2 = { name: people[1][0], ...people[1][1] };

    const total = p1.count + p2.count;
    const p1Pct = Math.round((p1.count / total) * 100);

    return (
        <div
            onClick={() => setActiveCard('engagement')}
            className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 h-full cursor-pointer hover:border-zinc-700 transition-colors group"
        >
            {/* Expand Hint */}
            <div className="absolute top-4 right-4 text-[9px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Click for comparison →
            </div>

            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Chat Balance</h3>

            {/* Bars */}
            <div className="flex items-center gap-4 mb-2">
                <span className="text-xs font-bold w-12 truncate text-right text-blue-400">- {p1.name.slice(0, 6)}...</span>
                <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${p1Pct}%` }} />
                    <div className="bg-pink-500 h-full transition-all duration-1000" style={{ width: `${100 - p1Pct}%` }} />
                </div>
                <span className="text-xs font-bold w-12 truncate text-pink-400">- {p2.name.slice(0, 6)}...</span>
            </div>

            {/* Ratios */}
            <div className="flex justify-between text-xs text-zinc-500 mt-6 px-4">
                <div className="text-center">
                    <p className="text-white text-lg font-bold">{p1.count.toLocaleString()}</p>
                    <p>Messages Sent</p>
                    <p className="mt-2 text-zinc-600">Avg {p1.avgLength} chars</p>
                </div>
                <div className="text-center">
                    <p className="text-white text-lg font-bold">{(p1.count / p2.count).toFixed(2)}x</p>
                    <p>Ratio</p>
                </div>
                <div className="text-center">
                    <p className="text-white text-lg font-bold">{p2.count.toLocaleString()}</p>
                    <p>Messages Sent</p>
                    <p className="mt-2 text-zinc-600">Avg {p2.avgLength} chars</p>
                </div>
            </div>
        </div>
    );
}
