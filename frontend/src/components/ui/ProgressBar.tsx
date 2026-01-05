"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface ProgressBarProps {
    progress: number; // 0-100
    status: string;
}

const FACTS = [
    "Did you know? You text most on Tuesdays.",
    "Analyzing the vibe...",
    "Filtering out 4,000 'lol's...",
    "Calculating emotional velocity...",
    "Finding your most used emoji...",
    "Detecting sarcasm...",
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
        <div className="w-full max-w-md mx-auto space-y-4">
            <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-500 font-medium font-sans">
                <span>{status}</span>
                <span>{Math.round(progress)}%</span>
            </div>

            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.5 }}
                    className="h-full bg-gradient-energy absolute top-0 left-0"
                />
                {/* Glow effect */}
                <motion.div
                    animate={{ left: `${progress}%` }}
                    className="absolute top-0 w-20 h-full bg-white/50 blur-md -translate-x-full"
                />
            </div>

            <motion.p
                key={fact}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center text-zinc-400 text-sm italic"
            >
                "{fact}"
            </motion.p>
        </div>
    );
}
