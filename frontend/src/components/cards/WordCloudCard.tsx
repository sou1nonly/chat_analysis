"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Type } from "lucide-react";

// Vibrant color palette for words
const COLORS = [
    "#A855F7", // purple
    "#4ADE80", // green  
    "#F472B6", // pink
    "#60A5FA", // blue
    "#FB923C", // orange
    "#FACC15", // yellow
    "#22D3EE", // cyan
    "#C084FC", // light purple
    "#86EFAC", // light green
    "#F9A8D4", // light pink
    "#FEF08A", // pale yellow
    "#A7F3D0", // pale green
];

export default function WordCloudCard() {
    const { stats } = useOrbitStore();

    if (!stats) return null;

    let words = stats.wordCloud || [];
    if (words.length === 0) return null;

    // Limits
    words = words.slice(0, 50);

    const topWord = words[0];
    const otherWords = words.slice(1);

    // Distribute words to create a "surrounding" effect
    // 3 Layers: Top, Middle (flanking hero), Bottom

    // Middle Layer needs strong medium words to flank the hero
    // Let's pick 2 strong words for left/right of hero
    const flankers = otherWords.slice(0, 2);

    // Remaining words for Top and Bottom
    const remaining = otherWords.slice(2);
    const midPoint = Math.ceil(remaining.length / 2);
    const topCluster = remaining.slice(0, midPoint).sort(() => Math.random() - 0.5); // Randomize for organic look
    const bottomCluster = remaining.slice(midPoint).sort(() => Math.random() - 0.5);

    // Dynamic Sizing
    const maxVal = topWord.value;
    const minVal = words[words.length - 1].value;

    const getSize = (val: number, isHero = false) => {
        if (isHero) return 68;
        const normalized = (val - minVal) / (maxVal - minVal || 1);
        // Range 12px - 26px for non-hero words
        return 12 + Math.pow(normalized, 0.6) * 14;
    };

    const renderWord = (word: typeof words[0], index: number) => {
        const size = getSize(word.value);
        const color = COLORS[index % COLORS.length];

        return (
            <span
                key={word.text}
                className="inline-block transition-all hover:scale-110 cursor-default font-semibold"
                style={{
                    fontSize: `${size}px`,
                    color: color,
                    padding: '2px 6px',
                    lineHeight: '1.2'
                }}
            >
                {word.text}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col min-h-[260px] relative">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Type className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">Word Cloud</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Most Used Words</p>
                </div>
            </div>

            {/* Word Cloud Container */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden py-2 w-full">

                {/* TOP CLUSTER */}
                <div className="flex flex-wrap justify-center items-end gap-1.5 opacity-90 w-[90%]">
                    {topCluster.map((w, i) => renderWord(w, i + 3))}
                </div>

                {/* MIDDLE ROW (Flanker - HERO - Flanker) */}
                <div className="flex items-center justify-center gap-4 my-1 w-full relative z-20">
                    {/* Left Flanker */}
                    <div className="hidden sm:block">
                        {renderWord(flankers[0], 1)}
                    </div>

                    {/* HERO WORD */}
                    <span
                        className="font-black inline-block transition-all hover:scale-105 cursor-default leading-none filter drop-shadow-[0_0_20px_rgba(250,204,21,0.25)]"
                        style={{
                            fontSize: '68px',
                            background: 'linear-gradient(to bottom right, #FACC15, #FB923C)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 10px'
                        }}
                    >
                        {topWord.text}
                    </span>

                    {/* Right Flanker */}
                    <div className="hidden sm:block">
                        {renderWord(flankers[1], 2)}
                    </div>
                </div>

                {/* Mobile Flankers (if screen too narrow) */}
                <div className="flex sm:hidden justify-center gap-2">
                    {flankers.map((w, i) => renderWord(w, i + 1))}
                </div>

                {/* BOTTOM CLUSTER */}
                <div className="flex flex-wrap justify-center items-start gap-1.5 opacity-90 w-[90%]">
                    {bottomCluster.map((w, i) => renderWord(w, i + 3 + topCluster.length))}
                </div>

            </div>
        </div>
    );
}
