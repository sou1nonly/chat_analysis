"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import ExpandedModal from "@/components/ui/ExpandedModal";
import WordCloudExpanded from "@/components/expanded/WordCloudExpanded";

export default function WordCloudCard() {
    const { stats, setActiveCard } = useOrbitStore();

    if (!stats) return null;

    const words = stats.wordCloud; // { text: string, value: number }[]
    const maxVal = words[0]?.value || 1;

    // Scale font size from 0.8rem to 2.5rem
    const scale = (val: number) => {
        const minPx = 12;
        const maxPx = 48;
        return minPx + (val / maxVal) * (maxPx - minPx);
    };

    return (
        <div
            onClick={() => setActiveCard('wordcloud')}
            className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-6 border border-zinc-800 relative overflow-hidden flex flex-col group cursor-pointer hover:border-zinc-700 transition-colors"
        >
            {/* Expand Hint */}
            <div className="absolute top-4 right-4 text-[9px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Click for full analysis →
            </div>

            <div className="mb-6 relative z-10">
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Vocabulary</h3>
                <p className="text-white text-xl font-heading font-medium">Common Words</p>
            </div>

            <div className="flex-1 flex flex-wrap content-center justify-center gap-x-4 gap-y-2 relative z-10">
                {words.slice(0, 30).map((w, i) => ( // limit to 30 for fit
                    <span
                        key={w.text}
                        className="font-heading font-bold text-zinc-500/80 hover:text-purple-400 transition-colors duration-300 hover:scale-110 transform inline-block"
                        style={{
                            fontSize: `${scale(w.value)}px`,
                            opacity: 0.5 + (w.value / maxVal) * 0.5
                        }}
                        title={`${w.value} times`}
                    >
                        {w.text}
                    </span>
                ))}
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-900/10 rounded-full blur-[80px]" />
        </div>
    );
}
