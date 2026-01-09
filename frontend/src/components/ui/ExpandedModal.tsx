"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ExpandedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export default function ExpandedModal({ isOpen, onClose, title, subtitle, children }: ExpandedModalProps) {
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] cursor-pointer"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed inset-4 md:inset-10 lg:inset-20 bg-[#050507]/90 border border-white/10 rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden backdrop-blur-2xl ring-1 ring-white/5"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-gradient-to-b from-zinc-800/50 to-transparent">
                            <div>
                                <h2 className="text-white font-heading font-bold text-2xl">{title}</h2>
                                {subtitle && (
                                    <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
