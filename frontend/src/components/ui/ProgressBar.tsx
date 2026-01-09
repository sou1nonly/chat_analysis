"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
    progress: number;
    status: string;
}

const FACTS = [
    "Analyzing conversation patterns...",
    "Detecting emotional wavelengths...",
    "Counting your emojis...",
    "Finding your vibe...",
    "Mapping activity heatmaps...",
    "Calculating reply speeds...",
    "Identifying streaks...",
];

export default function ProgressBar({ progress, status }: ProgressBarProps) {
    const [fact, setFact] = useState(FACTS[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm mx-auto space-y-6 py-8">
            {/* Spinner */}
            <div className="flex justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="w-8 h-8 text-purple-400" />
                </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="h-1.5 w-full bg-[#2C2C2E] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut", duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                </div>

                <div className="flex justify-between text-xs text-[#636366]">
                    <span className="capitalize">{status}</span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Rotating Fact */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={fact}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-center text-[#8E8E93] text-sm"
                >
                    {fact}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}
