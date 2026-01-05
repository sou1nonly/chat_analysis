"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface EvidenceDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function EvidenceDrawer({ isOpen, onClose, title, children }: EvidenceDrawerProps) {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 h-[85vh] bg-zinc-900 rounded-t-3xl border-t border-zinc-800 z-50 overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                    >
                        {/* Handle */}
                        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-zinc-700 rounded-full cursor-pointer" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-6 flex justify-between items-center border-b border-zinc-800">
                            <h3 className="text-xl font-heading font-medium text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        {/* Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
