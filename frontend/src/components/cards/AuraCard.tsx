"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Heart, Smile, Frown, Meh } from "lucide-react";

export default function AuraCard() {
    const { stats } = useOrbitStore();

    if (!stats) return null;

    // Calculate sentiment from available data if aura doesn't exist
    let sentiment = 0;
    let label = "Neutral";

    if (stats.aura) {
        sentiment = stats.aura.sentiment;
        label = stats.aura.label;
    } else {
        // Fallback: derive from emoji sentiment
        const positiveEmojis = ['😊', '😂', '❤️', '🥰', '😍', '💕', '🎉', '😁', '👍', '💖'];
        const negativeEmojis = ['😢', '😭', '😞', '💔', '😔', '😤', '😡', '👎'];

        let positive = 0;
        let negative = 0;

        stats.topEmojis?.forEach(e => {
            if (positiveEmojis.includes(e.emoji)) positive += e.count;
            if (negativeEmojis.includes(e.emoji)) negative += e.count;
        });

        const total = positive + negative || 1;
        sentiment = (positive - negative) / total;

        if (sentiment > 0.3) label = "Positive";
        else if (sentiment > 0) label = "Warm";
        else if (sentiment > -0.3) label = "Neutral";
        else label = "Tense";
    }

    const normalizedSentiment = ((sentiment + 1) / 2) * 100;

    // Color and icon based on sentiment
    const getConfig = () => {
        if (sentiment > 0.3) return {
            ring: "stroke-green-400",
            text: "text-green-400",
            Icon: Smile,
            gradient: "from-green-500/20 to-emerald-500/10"
        };
        if (sentiment > 0) return {
            ring: "stroke-blue-400",
            text: "text-blue-400",
            Icon: Heart,
            gradient: "from-blue-500/20 to-cyan-500/10"
        };
        if (sentiment > -0.3) return {
            ring: "stroke-yellow-400",
            text: "text-yellow-400",
            Icon: Meh,
            gradient: "from-yellow-500/20 to-amber-500/10"
        };
        return {
            ring: "stroke-orange-400",
            text: "text-orange-400",
            Icon: Frown,
            gradient: "from-orange-500/20 to-red-500/10"
        };
    };

    const config = getConfig();
    const { Icon } = config;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (normalizedSentiment / 100) * circumference;

    return (
        <div className="h-full flex flex-col items-center justify-center relative min-h-[180px]">
            {/* Subtle gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-xl`} />

            {/* Ring */}
            <div className="relative z-10">
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        {/* Background ring */}
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="5"
                            fill="transparent"
                        />
                        {/* Progress ring */}
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            className={config.ring}
                            strokeWidth="5"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                        />
                    </svg>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${config.text}`} />
                    </div>
                </div>
            </div>

            {/* Label */}
            <p className="text-white font-semibold mt-3 text-sm relative z-10">{label}</p>
            <p className="text-[9px] text-gray-500 uppercase relative z-10">Vibe Check</p>
        </div>
    );
}
