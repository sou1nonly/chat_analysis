"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Scale } from "lucide-react";

export default function EngagementCard() {
    const { stats, setActiveCard } = useOrbitStore();

    if (!stats) return null;

    const people = Object.entries(stats.participants);
    if (people.length < 2) return null;

    const p1 = { name: people[0][0], ...people[0][1] };
    const p2 = { name: people[1][0], ...people[1][1] };

    const total = p1.count + p2.count;
    const p1Pct = Math.round((p1.count / total) * 100);
    const p2Pct = 100 - p1Pct;

    const ratio = p1.count > p2.count
        ? (p1.count / p2.count).toFixed(1)
        : (p2.count / p1.count).toFixed(1);

    return (
        <div className="h-full flex flex-col p-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">Chat Balance</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Who Talks More</p>
                </div>
            </div>

            {/* Balance Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-blue-400 font-medium">{p1.name}</span>
                    <span className="text-pink-400 font-medium">{p2.name}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all"
                        style={{ width: `${p1Pct}%` }}
                    />
                    <div
                        className="bg-gradient-to-r from-pink-400 to-pink-500 h-full transition-all"
                        style={{ width: `${p2Pct}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>{p1Pct}%</span>
                    <span>{p2Pct}%</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 flex-1">
                <div className="bg-[#0D0D0F] rounded-xl p-2 text-center border border-white/5">
                    <p className="text-base font-bold text-white">{p1.count.toLocaleString()}</p>
                    <p className="text-[8px] text-gray-500 uppercase">Messages</p>
                </div>
                <div className="bg-[#0D0D0F] rounded-xl p-2 text-center border border-white/5">
                    <p className="text-base font-bold text-purple-400">{ratio}×</p>
                    <p className="text-[8px] text-gray-500 uppercase">Ratio</p>
                </div>
                <div className="bg-[#0D0D0F] rounded-xl p-2 text-center border border-white/5">
                    <p className="text-base font-bold text-white">{p2.count.toLocaleString()}</p>
                    <p className="text-[8px] text-gray-500 uppercase">Messages</p>
                </div>
            </div>
        </div>
    );
}
