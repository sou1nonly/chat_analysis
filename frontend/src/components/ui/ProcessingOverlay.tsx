"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ProcessingOverlay() {
    const { isPipelineReady, processingLog } = useOrbitStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [processingLog]);

    if (isPipelineReady) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-purple-500" />
                        <span className="font-mono text-sm font-bold text-zinc-300">ORBIT_SYSTEM_LOG</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        <span className="text-xs text-zinc-500 font-mono">PROCESSING_DATA</span>
                    </div>
                </div>

                {/* Log View */}
                <div
                    ref={scrollRef}
                    className="h-96 overflow-y-auto p-6 font-mono text-sm space-y-2 scrollbar-thin scrollbar-thumb-zinc-800"
                >
                    <AnimatePresence mode="popLayout">
                        {processingLog.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3"
                            >
                                <span className="text-zinc-600 select-none">
                                    {new Date().toLocaleTimeString('en-US', { hour12: false })}
                                </span>
                                <span className="text-indigo-400">➜</span>
                                <span className="text-zinc-300">
                                    {log.split(' ').map((word, idx) => {
                                        if (word.startsWith('[')) return <span key={idx} className="text-purple-400 font-bold">{word} </span>
                                        return word + ' ';
                                    })}
                                </span>
                            </motion.div>
                        ))}
                        {processingLog.length === 0 && (
                            <div className="text-zinc-600 italic">Initializing systems...</div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Decor */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-pulse" />
            </div>

            <p className="mt-8 text-zinc-500 font-mono text-xs animate-pulse">
                Feeding your data to the AI... This might take a moment.
            </p>
        </div>
    );
}
