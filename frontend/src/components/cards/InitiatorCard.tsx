"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { useSearch } from "@/hooks/useSearch";
import EvidencePopover from "@/components/ui/EvidencePopover";

export default function InitiatorCard() {
    const { stats } = useOrbitStore();
    const { search, results, isSearching, activeQuery, clear } = useSearch();

    if (!stats || !stats.initiators) return null;

    const initiators = stats.initiators; // { name: string, count: number }[]
    const totalInitiations = initiators.reduce((acc, curr) => acc + curr.count, 0) || 1;

    const handleClick = (name: string) => {
        // Search for messages from this sender (as evidence of their initiation)
        search({ sender: name }, `${name}'s Initiations`);
    };

    return (
        <>
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 relative overflow-hidden flex flex-col justify-between h-full">
                <div className="relative z-10 mb-2">
                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Dynamics</h3>
                    <p className="text-white text-xl font-heading font-medium">The Opener</p>
                    <p className="text-zinc-500 text-xs mt-1">Who starts the conversation? (click to see)</p>
                </div>

                <div className="space-y-4 relative z-10">
                    {initiators.slice(0, 3).map((person, i) => {
                        const percent = Math.round((person.count / totalInitiations) * 100);
                        return (
                            <div
                                key={person.name}
                                className="group cursor-pointer"
                                onClick={() => handleClick(person.name)}
                            >
                                <div className="flex justify-between text-sm mb-1">
                                    <span className={`font-bold ${i === 0 ? 'text-purple-400' : 'text-zinc-300'}`}>
                                        {person.name}
                                    </span>
                                    <span className="text-zinc-500">{percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80 ${i === 0 ? 'bg-purple-500' : 'bg-zinc-600'}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Ignited {person.count} conversations → Click to see
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Decor */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
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
