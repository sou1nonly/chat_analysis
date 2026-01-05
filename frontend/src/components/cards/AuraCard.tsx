"use client";

import { motion } from "framer-motion";
import { useOrbitStore } from "@/store/useOrbitStore";

export default function AuraCard() {
    const { stats } = useOrbitStore();

    if (!stats) return null;

    // Simple heuristic for MVP: Check top emojis for "vibe"
    const topEmoji = stats.topEmojis[0]?.emoji || "";
    const happyEmojis = ["😂", "🤣", "❤️", "🥰", "😊", "✨"];
    const sentiment = happyEmojis.includes(topEmoji) ? "Radiant" : "Mysterious";

    // Dynamic gradient based on sentiment
    const gradient = sentiment === "Radiant"
        ? "from-yellow-400 via-orange-500 to-red-500"
        : "from-indigo-500 via-purple-500 to-pink-500";

    return (
        <div className="w-full aspect-square rounded-3xl overflow-hidden relative shadow-2xl bg-zinc-900 group">
            {/* Animated blob background */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-80 blur-[80px]`}
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                <h2 className="text-4xl font-heading font-bold text-white mb-4">
                    You are <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                        {sentiment}
                    </span>
                </h2>

                <div className="bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                    <p className="text-white/90 text-sm font-medium">
                        Based on {stats.topEmojis[0]?.emoji || "?"} usage
                    </p>
                </div>
            </div>

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
        </div>
    );
}
