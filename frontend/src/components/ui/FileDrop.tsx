"use client";

import { useState, useCallback, useRef } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { motion } from "framer-motion";
import { Upload, FileText, Shield, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

interface FileDropProps {
    onFileSelect?: (file: File) => void;
}

export default function FileDrop({ onFileSelect }: FileDropProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { setStatus, setProgress, setStats, setUploadId, addLog, setPipelineReady } = useOrbitStore();

    const handleUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        setStatus("parsing", "Uploading your chat...");
        setProgress(10);
        addLog("[UPLOAD] Starting file upload...");
        setPipelineReady(false);

        try {
            // Simulate progress during upload
            setProgress(30);
            addLog(`[UPLOAD] Processing ${file.name}...`);

            // Upload to backend
            const response = await api.uploadFile(file);

            setProgress(70);
            addLog(`[PARSE] Parsed ${response.message_count.toLocaleString()} messages`);
            addLog(`[STATS] Computing statistics...`);

            setProgress(90);

            // Set the stats and upload ID
            setUploadId(response.upload_id);
            setStats(response.stats as any);

            setProgress(100);
            addLog("[COMPLETE] Analysis complete!");
            setStatus("complete");
            setPipelineReady(true);

        } catch (error) {
            console.error("Upload failed:", error);
            addLog(`[ERROR] Upload failed: ${error}`);
            setStatus("error", "Failed to process file. Please try again.");
            setPipelineReady(true);
        } finally {
            setIsUploading(false);
        }
    }, [setStatus, setProgress, setStats, setUploadId, addLog, setPipelineReady]);

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
                    handleUpload(files[0]);
                }
            }
        },
        [handleUpload, onFileSelect]
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            if (onFileSelect) {
                onFileSelect(files[0]);
            } else {
                handleUpload(files[0]);
            }
        }
    };

    if (isUploading) {
        return (
            <div className="w-full max-w-lg mx-auto">
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-4 bg-[#111114] rounded-2xl border border-purple-500/20">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    <p className="text-gray-400 text-sm">Processing your chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto">
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
                    "relative group rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden",
                    isDragging
                        ? "border-purple-500 bg-purple-500/[0.05] shadow-[0_0_40px_rgba(139,92,246,0.15)]"
                        : "border-dashed border-[#333] hover:border-[#555] bg-[#111114]"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-5">
                    {/* Icon */}
                    <motion.div
                        animate={isDragging ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.2 }}
                        className={clsx(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200",
                            isDragging
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-[#1A1A1F] text-gray-500 group-hover:text-white group-hover:bg-[#222]"
                        )}
                    >
                        {isDragging ? (
                            <FileText className="w-6 h-6" />
                        ) : (
                            <Upload className="w-6 h-6" />
                        )}
                    </motion.div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-heading font-medium text-white">
                            {isDragging ? "Drop it here" : "Drop your chat export"}
                        </h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            or click to browse your files
                        </p>
                    </div>

                    {/* Privacy Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <Shield className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">
                            100% private • runs locally
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
