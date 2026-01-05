"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MessageSquare } from "lucide-react";
import { SearchResult } from "@/hooks/useSearch";

interface EvidencePopoverProps {
    onClose: () => void;
    title: string;
    results: SearchResult[];
    isLoading: boolean;
}

export default function EvidencePopover({ onClose, title, results, isLoading }: EvidencePopoverProps) {
    // Auto-manage visibility: show if loading OR if there are results
    const isOpen = isLoading || results.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-lg h-[600px] bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                        style={{ maxHeight: "80vh" }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10">
                            <div>
                                <h3 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                                    <Search className="w-4 h-4 text-purple-400" />
                                    Evidence: "{title}"
                                </h3>
                                <p className="text-zinc-500 text-xs mt-1">
                                    {isLoading ? "Searching..." : `Found ${results.length} occurrences`}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm">Searching archives...</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                    <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-sm">No matches found in context.</p>
                                </div>
                            ) : (
                                results.map((msg, idx) => (
                                    <div key={idx} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-purple-400 font-bold text-xs">{msg.sender}</span>
                                            <span className="text-zinc-600 text-[10px]">
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                            {msg.content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
