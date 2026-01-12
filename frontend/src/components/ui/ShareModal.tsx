"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Download, Instagram, Twitter, Share2, Check, Loader2, Image, ExternalLink } from "lucide-react";
import { toPng } from "html-to-image";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetRef: React.RefObject<HTMLDivElement | null>;
    filename?: string;
}

type SizePreset = "original" | "instagram" | "twitter" | "square";

const sizePresets: Record<SizePreset, { label: string; icon: React.ReactNode }> = {
    "original": { label: "Original", icon: <Image className="w-4 h-4" /> },
    "instagram": { label: "Instagram", icon: <Instagram className="w-4 h-4" /> },
    "twitter": { label: "Twitter/X", icon: <Twitter className="w-4 h-4" /> },
    "square": { label: "Square", icon: <Share2 className="w-4 h-4" /> },
};

export default function ShareModal({ isOpen, onClose, targetRef, filename = "orbit-analysis" }: ShareModalProps) {
    const [selectedSize, setSelectedSize] = useState<SizePreset>("original");
    const [isExporting, setIsExporting] = useState(false);
    const [exported, setExported] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && targetRef.current) {
            setTimeout(() => generatePreview(), 100);
        }
        if (!isOpen) {
            setPreviewUrl(null);
            setExported(false);
            setError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
        }
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const generatePreview = async () => {
        if (!targetRef.current) return;
        try {
            const dataUrl = await toPng(targetRef.current, {
                backgroundColor: "#fdfbf7",
                pixelRatio: 1,
                skipAutoScale: true,
            });
            setPreviewUrl(dataUrl);
        } catch (err) {
            console.error("Failed to generate preview:", err);
        }
    };

    const handleExport = async () => {
        if (!targetRef.current) return;
        setIsExporting(true);
        setExported(false);
        setError(null);

        try {
            // 1. Generate visual capture (Client Side)
            const dataUrl = await toPng(targetRef.current, {
                backgroundColor: "#fdfbf7",
                pixelRatio: 3,
                cacheBust: true,
                skipAutoScale: true,
            });

            // 2. Submit hidden form to trigger native browser download
            // This is the most reliable way to handle file downloads with explicit headers
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const form = document.createElement("form");
            form.method = "POST";
            form.action = `${API_BASE}/api/export/receipt`;
            form.target = "_self"; // Download in current window (doesn't navigate away)

            // Data URL Input
            const inputData = document.createElement("input");
            inputData.type = "hidden";
            inputData.name = "data_url";
            inputData.value = dataUrl;
            form.appendChild(inputData);

            // Filename Input
            const inputName = document.createElement("input");
            inputName.type = "hidden";
            inputName.name = "filename";
            inputName.value = `orbit-receipt-${selectedSize}.png`;
            form.appendChild(inputName);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            // 3. Assume success (fire and forget)
            // Native form submit doesn't provide callback, but download should start immediately
            setExported(true);
            setTimeout(() => setExported(false), 2000);

            // Allow UI to reset state
            setTimeout(() => setIsExporting(false), 1000);
        } catch (err) {
            console.error("Export failed:", err);
            setError("Export failed. Please try again.");
            setIsExporting(false);
        }
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 9999 }}
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/85 backdrop-blur-lg"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="relative bg-[#111114] rounded-2xl border border-white/10 p-6 max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5 text-zinc-400" />
                </button>

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-3">
                        <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Share Your Analysis</h2>
                    <p className="text-zinc-400 text-sm mt-1">Download & share on social media</p>
                </div>

                {/* Preview */}
                <div className="mb-5 flex justify-center">
                    <div className="w-40 h-auto rounded-lg overflow-hidden shadow-lg border border-white/10 bg-[#fdfbf7]">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Size Presets */}
                <div className="mb-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Format</p>
                    <div className="grid grid-cols-4 gap-2">
                        {(Object.keys(sizePresets) as SizePreset[]).map((key) => {
                            const preset = sizePresets[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedSize(key)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${selectedSize === key
                                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                        : "border-white/10 hover:border-white/20 text-zinc-400"
                                        }`}
                                >
                                    {preset.icon}
                                    <span className="text-[10px] font-medium">{preset.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Export Button */}
                <motion.button
                    onClick={handleExport}
                    disabled={isExporting || !previewUrl}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed ${exported
                        ? "bg-emerald-500 text-white"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                        }`}
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Opening...
                        </>
                    ) : exported ? (
                        <>
                            <Check className="w-5 h-5" />
                            Opened in New Tab!
                        </>
                    ) : (
                        <>
                            <ExternalLink className="w-5 h-5" />
                            Open & Save Image
                        </>
                    )}
                </motion.button>

                {/* Tip */}
                <p className="text-center text-[10px] text-zinc-500 mt-4">
                    💡 Opens in new tab → Right-click → "Save image as..."
                </p>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
