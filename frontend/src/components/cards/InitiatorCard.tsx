"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { useSearch } from "@/hooks/useSearch";
import EvidencePopover from "@/components/ui/EvidencePopover";
import { MessageSquareMore } from "lucide-react";

export default function InitiatorCard() {
    const { stats } = useOrbitStore();
    const { search, results, isSearching, activeQuery, clear } = useSearch();

    if (!stats || !stats.initiators) return null;

    const initiators = stats.initiators;
    const totalInitiations = initiators.reduce((acc, curr) => acc + curr.count, 0) || 1;

    const handleClick = (name: string) => {
        search({ sender: name }, `${name}'s Initiations`);
    };

    const colors = [
        { bar: "bg-pink-500", text: "text-pink-400" },
        { bar: "bg-purple-500", text: "text-purple-400" },
    ];

    return (
        <>
            <div className="h-full flex flex-col min-h-[220px]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <MessageSquareMore className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">The Opener</h3>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">Conversation Starters</p>
                    </div>
                </div>

                {/* Bars */}
                <div className="space-y-4 flex-1">
                    {initiators.slice(0, 2).map((person, i) => {
                        const percent = Math.round((person.count / totalInitiations) * 100);
                        const color = colors[i % colors.length];

                        return (
                            <div
                                key={person.name}
                                className="cursor-pointer group"
                                onClick={() => handleClick(person.name)}
                            >
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className={`font-medium ${color.text}`}>
                                        {person.name}
                                    </span>
                                    <span className="text-white font-semibold">{percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${color.bar} transition-all duration-500`}
                                        style={{ width: `${percent}%` }}
                                    />
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
