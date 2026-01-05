"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { useSearch } from "@/hooks/useSearch";
import EvidencePopover from "@/components/ui/EvidencePopover";
import { Clock, MessageCircle } from "lucide-react";

export default function ReplyTimingCard() {
    const { stats } = useOrbitStore();
    const { search, results, isSearching, activeQuery, clear } = useSearch();

    if (!stats || !stats.participants) return null;

    const participants = Object.entries(stats.participants).map(([name, data]) => ({
        name,
        replyTime: data.replyTime || 0, // minutes
        doubleTexts: data.doubleTextCount || 0
    }));

    // Find max for scaling bars
    const maxTime = Math.max(...participants.map(p => p.replyTime), 1);

    const formatTime = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const handleClick = (name: string) => {
        search({ sender: name }, `${name}'s Messages`);
    };

    return (
        <>
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 h-full flex flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Responsiveness
                    </h3>
                    <p className="text-white text-xl font-heading font-medium mt-1">Reply Speed</p>
                    <p className="text-zinc-500 text-[10px] mt-1">Click to see their texts</p>
                </div>

                <div className="space-y-6 z-10 mt-4">
                    {participants.map((p, i) => (
                        <div
                            key={p.name}
                            className="cursor-pointer hover:bg-zinc-800/50 rounded-xl p-2 -m-2 transition-colors"
                            onClick={() => handleClick(p.name)}
                        >
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-zinc-300 font-bold">{p.name}</span>
                                <span className={`font-mono ${p.replyTime < 10 ? 'text-green-400' : p.replyTime > 60 ? 'text-orange-400' : 'text-blue-400'}`}>
                                    ~{formatTime(p.replyTime)}
                                </span>
                            </div>

                            {/* Speed Bar */}
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full mb-2 overflow-hidden">
                                <div
                                    className="h-full bg-zinc-500 rounded-full"
                                    style={{ width: `${Math.min((p.replyTime / maxTime) * 100, 100)}%` }}
                                />
                            </div>

                            {/* Double Text Stat */}
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                <MessageCircle className="w-3 h-3 text-zinc-600" />
                                <span>Double texted <b>{p.doubleTexts}</b> times</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            <EvidencePopover
                onClose={clear}
                title={activeQuery || ""}
                results={results}
                isLoading={isSearching}
            />
        </>
    );
}
