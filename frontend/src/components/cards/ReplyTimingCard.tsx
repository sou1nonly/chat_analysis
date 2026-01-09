"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { useSearch } from "@/hooks/useSearch";
import EvidencePopover from "@/components/ui/EvidencePopover";
import { Timer, MessageCircle } from "lucide-react";

export default function ReplyTimingCard() {
    const { stats } = useOrbitStore();
    const { search, results, isSearching, activeQuery, clear } = useSearch();

    if (!stats || !stats.participants) return null;

    const participants = Object.entries(stats.participants).map(([name, data]) => ({
        name,
        replyTime: data.replyTime || 0,
        doubleTexts: data.doubleTextCount || 0
    }));

    const formatTime = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const getSpeedColor = (mins: number) => {
        if (mins < 10) return "text-green-400";
        if (mins < 30) return "text-blue-400";
        if (mins < 60) return "text-yellow-400";
        return "text-orange-400";
    };

    const getBarColor = (mins: number) => {
        if (mins < 10) return "bg-green-500";
        if (mins < 30) return "bg-blue-500";
        if (mins < 60) return "bg-yellow-500";
        return "bg-orange-500";
    };

    const handleClick = (name: string) => {
        search({ sender: name }, `${name}'s Messages`);
    };

    const maxTime = Math.max(...participants.map(p => p.replyTime), 1);

    return (
        <>
            <div className="h-full flex flex-col p-1">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Reply Speed</h3>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">Avg Response Time</p>
                    </div>
                </div>

                {/* Participants */}
                <div className="space-y-4 flex-1">
                    {participants.map((p) => {
                        const widthPercent = Math.min((p.replyTime / maxTime) * 100, 100);

                        return (
                            <div
                                key={p.name}
                                className="cursor-pointer hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
                                onClick={() => handleClick(p.name)}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white text-sm font-medium">{p.name}</span>
                                    <span className={`text-sm font-semibold ${getSpeedColor(p.replyTime)}`}>
                                        ~{formatTime(p.replyTime)}
                                    </span>
                                </div>

                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1">
                                    <div
                                        className={`h-full rounded-full ${getBarColor(p.replyTime)} transition-all`}
                                        style={{ width: `${widthPercent}%` }}
                                    />
                                </div>

                                <div className="flex items-center gap-1 text-[9px] text-gray-500">
                                    <MessageCircle className="w-3 h-3" />
                                    <span>Double texted {p.doubleTexts}×</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
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
