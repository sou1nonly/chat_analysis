"use client";

import { useState, useCallback, useRef } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText } from "lucide-react";
import { clsx } from "clsx";

interface FileDropProps {
    onFileSelect?: (file: File) => void;
}

export default function FileDrop({ onFileSelect }: FileDropProps) {
    const [isDragging, setIsDragging] = useState(false);
    const { setFiles, setStatus } = useOrbitStore();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                if (onFileSelect) {
                    onFileSelect(files[0]);
                } else {
                    setFiles(files);
                    setStatus("parsing", "Reading your chat logs...");
                }
            }
        },
        [setFiles, setStatus, onFileSelect]
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            if (onFileSelect) {
                onFileSelect(files[0]);
            } else {
                setFiles(files);
                setStatus("parsing", "Reading your chat logs...");
            }
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto px-6">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.json"
                onChange={handleFileChange}
            />
            <motion.div
                layout
                onClick={handleClick}
                className={clsx(
                    "relative group rounded-3xl border-2 border-dashed transition-all duration-300 ease-out cursor-pointer overflow-hidden",
                    isDragging
                        ? "border-pink-500 bg-pink-500/5 shadow-[0_0_40px_rgba(236,72,153,0.3)]"
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Glowing Gradient Pulse Background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-aura blur-3xl opacity-30 animate-pulse" />
                </div>

                <div className="flex flex-col items-center justify-center py-24 px-8 text-center space-y-6 relative z-10">
                    <motion.div
                        animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                        className="p-6 rounded-full bg-zinc-900 border border-zinc-800 shadow-xl"
                    >
                        {isDragging ? (
                            <FileText className="w-10 h-10 text-pink-500" />
                        ) : (
                            <Upload className="w-10 h-10 text-zinc-400 group-hover:text-white transition-colors" />
                        )}
                    </motion.div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-heading font-medium text-white">
                            Drop your chat logs here
                        </h3>
                        <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                            Or click to browse <span className="text-zinc-200">_chat.txt</span> (WhatsApp) and{" "}
                            <span className="text-zinc-200">messages.json</span> (Instagram)
                        </p>
                    </div>

                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>Processing locally. Your data never leaves this device.</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
