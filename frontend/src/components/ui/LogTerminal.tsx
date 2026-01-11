"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogTerminalProps {
    logs: string[];
    isLoading: boolean;
    className?: string;
}

export default function LogTerminal({ logs, isLoading, className = "" }: LogTerminalProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (logs.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Terminal Container */}
            <div className="rounded-xl border border-white/5 bg-[#0A0A0B] overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#111114]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono ml-2">
                        AI Pipeline Logs
                    </span>
                    {isLoading && (
                        <span className="ml-auto flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] text-green-400 font-mono">running</span>
                        </span>
                    )}
                </div>

                {/* Terminal Content */}
                <div
                    ref={scrollRef}
                    className="p-4 max-h-[250px] overflow-y-auto custom-scrollbar"
                >
                    <AnimatePresence mode="popLayout">
                        {logs.length === 0 && isLoading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-purple-400 font-mono"
                            >
                                Connecting to pipeline...
                            </motion.div>
                        ) : (
                            logs.map((log, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-xs font-mono leading-relaxed text-gray-400 whitespace-pre-wrap"
                                >
                                    {colorizeLog(log)}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// Helper to colorize log lines based on content
function colorizeLog(log: string): React.ReactNode {
    // Pipeline markers
    if (log.includes('[PIPELINE]') || log.includes('[OK]')) {
        return <span className="text-green-400">{log}</span>;
    }
    // Step indicators
    if (log.match(/^\[?\d\/\d\]/) || log.includes('[1/') || log.includes('[2/') || log.includes('[3/') || log.includes('[4/') || log.includes('[5/')) {
        return <span className="text-purple-400">{log}</span>;
    }
    // Info lines
    if (log.includes('[INFO]')) {
        return <span className="text-blue-400">{log}</span>;
    }
    // Progress lines (indented with spaces)
    if (log.startsWith('      ')) {
        return <span className="text-gray-500">{log}</span>;
    }
    // Separator lines
    if (log.includes('===')) {
        return <span className="text-gray-600">{log}</span>;
    }
    // Default
    return log;
}
