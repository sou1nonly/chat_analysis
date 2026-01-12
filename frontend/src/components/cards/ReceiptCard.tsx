"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "@/components/ui/ShareModal";

// Personalized quotes based on chat patterns
const getPersonalizedQuote = (stats: any): string => {
    const totalMessages = stats.totalMessages;
    const streak = stats.streak?.max || 0;
    const lateNights = stats.hourlyActivity?.slice(22).reduce((a: number, b: number) => a + b, 0) +
        stats.hourlyActivity?.slice(0, 4).reduce((a: number, b: number) => a + b, 0);
    const morningMsgs = stats.hourlyActivity?.slice(5, 10).reduce((a: number, b: number) => a + b, 0);

    // Determine personality
    if (streak > 100) {
        return "You two are basically a daily ritual 💫";
    } else if (lateNights > morningMsgs * 2) {
        return "Night owls who never run out of words 🌙";
    } else if (morningMsgs > lateNights * 2) {
        return "Early birds who start the day together ☀️";
    } else if (totalMessages > 50000) {
        return "A friendship built on endless conversations 💬";
    } else if (totalMessages > 20000) {
        return "Some connections are meant to be 🔗";
    } else if (totalMessages > 10000) {
        return "Quality conversations over quantity ✨";
    } else if (streak > 30) {
        return "Consistency is your love language 📅";
    } else {
        return "Every message is a memory 💭";
    }
};

export default function ReceiptCard() {
    const { stats } = useOrbitStore();
    const receiptRef = useRef<HTMLDivElement>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    // Generate a stable ID
    const receiptId = useMemo(() => {
        if (!stats) return "ORBIT";
        const hash = (stats.totalMessages + new Date(stats.startDate).getTime()) % 1000000;
        return hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
    }, [stats]);

    if (!stats) return null;

    // Calculations
    const lateNights = stats.hourlyActivity.slice(22).reduce((a, b) => a + b, 0) + stats.hourlyActivity.slice(0, 4).reduce((a, b) => a + b, 0);
    const earlyBirds = stats.hourlyActivity.slice(5, 9).reduce((a, b) => a + b, 0);

    // Duration in days
    const startDate = new Date(stats.startDate);
    const endDate = new Date(stats.endDate);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Average messages per day
    const avgPerDay = Math.round(stats.totalMessages / durationDays);

    // Personalized quote
    const personalQuote = getPersonalizedQuote(stats);

    // Formatting helper
    const fmt = (n: number) => n.toLocaleString();

    const topics = [
        { name: "LATE NIGHT CHATS", value: fmt(lateNights), code: "LN01" },
        { name: "EARLY BIRD MSGS", value: fmt(earlyBirds), code: "EB02" },
        { name: "TOP EMOJI", value: stats.topEmojis[0]?.emoji || "🔥", code: "EM01" },
        { name: "LONGEST STREAK", value: `${stats.streak.max} DAYS`, code: "SK01" },
        { name: "AVG MSGS/DAY", value: fmt(avgPerDay), code: "AV01" },
        { name: "JOURNEY LENGTH", value: `${durationDays} DAYS`, code: "DU01" },
    ];

    const formattedStartDate = startDate.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    }).toUpperCase();

    const now = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <>
            <div className="flex items-center justify-center p-4 relative">
                {/* Share Button - Floating */}
                <motion.button
                    onClick={() => setShowShareModal(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors cursor-pointer"
                    title="Share Analysis"
                >
                    <Share2 className="w-4 h-4" />
                </motion.button>

                <motion.div
                    ref={receiptRef}
                    className="w-[340px] bg-[#fdfbf7] text-[#1a1a1a] shadow-2xl relative font-mono text-xs leading-relaxed filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                    initial={{ opacity: 0, y: 20, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: showShareModal ? 0 : 2 }}
                    whileHover={showShareModal ? {} : { rotate: 0, scale: 1.01 }}
                    transition={{ duration: 0.4, type: "spring" as const }}
                >
                    {/* Jagged Top */}
                    <div
                        className="absolute top-[-8px] left-0 w-full h-2 bg-[#fdfbf7]"
                        style={{
                            maskImage: 'linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)',
                            maskSize: '16px 16px',
                            maskRepeat: 'repeat-x',
                            WebkitMaskImage: 'linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)',
                            WebkitMaskSize: '16px 16px',
                        }}
                    />

                    {/* Main Content */}
                    <div className="p-5 pb-6 border-x border-[#f0eee9]">

                        {/* Header */}
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-black tracking-widest mb-1 underline decoration-2 underline-offset-4">RECEIPT</h2>
                            <div className="flex justify-center items-center gap-2 text-[10px] text-gray-500 my-1">
                                <span>{formattedStartDate}</span>
                                <span>•</span>
                                <span>{now}</span>
                            </div>
                            <p className="font-bold tracking-widest text-[10px] uppercase border px-2 py-0.5 inline-block border-black">
                                Orbit Intelligence
                            </p>
                        </div>

                        {/* Personalized Quote */}
                        <div className="text-center mb-4 py-2 border-y border-dashed border-gray-300">
                            <p className="text-[11px] italic text-gray-600 font-medium">
                                "{personalQuote}"
                            </p>
                        </div>

                        {/* Meta Info */}
                        <div className="flex justify-between text-[10px] text-gray-500 mb-3 border-b border-dashed border-gray-300 pb-2">
                            <span>TXN: #{receiptId}</span>
                            <span>TERM: WEB_01</span>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-2 mb-4">
                            {topics.map((item, i) => (
                                <div key={i} className="flex justify-between items-baseline group">
                                    <div className="flex flex-col">
                                        <span className="font-bold uppercase tracking-tight text-[11px]">{item.name}</span>
                                        <span className="text-[8px] text-gray-400 font-mono tracking-widest">{item.code}</span>
                                    </div>
                                    <div className="border-b border-dotted border-gray-300 flex-1 mx-2 relative -top-1"></div>
                                    <span className="font-bold text-sm whitespace-nowrap">{item.value}</span>
                                </div>
                            ))}

                            {/* Total Messages Line */}
                            <div className="flex justify-between items-baseline mt-3 pt-1">
                                <span className="font-bold uppercase text-[11px]">TOTAL MESSAGES</span>
                                <div className="border-b border-dotted border-gray-300 flex-1 mx-2 relative -top-1"></div>
                                <span className="font-bold text-sm">{fmt(stats.totalMessages)}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t-2 border-dashed border-black/80 my-3" />

                        {/* Total */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-black tracking-widest">TOTAL</span>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-black transform -rotate-2 border-2 border-black px-2 py-0.5 bg-yellow-300/20">
                                    PRICELESS
                                </span>
                            </div>
                        </div>

                        {/* Barcode / Footer - Side by Side */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                            <div className="h-8 w-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjQwIiB4PSIwIiBmaWxsPSJibGFjayIvPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQwIiB4PSI0IiBmaWxsPSJibGFjayIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjQwIiB4PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIgeD0iMTMiIGZpbGw9ImJsYWNrIi8+PHJlY3Qgd2lkdGg9IjIiIGheiWdodD0iNDAiIHg9IjE4IiBmaWxsPSJibGFjayIvPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjQwIiB4PSIyMiIgZmlsbD0iYmxhY2siLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIgeD0iMzAiIGZpbGw9ImJsYWNrIi8+PC9zdmc+')] opacity-80" />
                            <div className="flex-1 text-right">
                                <p className="text-[9px] font-bold uppercase tracking-widest leading-tight">Thank you <br />for the memories</p>
                                <p className="text-[8px] text-gray-400 mt-0.5 font-mono">auth: {receiptId}-X88</p>
                            </div>
                        </div>

                    </div>

                    {/* Jagged Bottom */}
                    <div
                        className="absolute bottom-[-8px] left-0 w-full h-2 bg-[#fdfbf7]"
                        style={{
                            maskImage: 'linear-gradient(225deg, transparent 50%, black 50%), linear-gradient(135deg, transparent 50%, black 50%)',
                            maskSize: '16px 16px',
                            maskRepeat: 'repeat-x',
                            WebkitMaskImage: 'linear-gradient(225deg, transparent 50%, black 50%), linear-gradient(135deg, transparent 50%, black 50%)',
                            WebkitMaskSize: '16px 16px',
                        }}
                    />
                </motion.div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                targetRef={receiptRef}
                filename={`orbit-receipt-${receiptId}`}
            />
        </>
    );
}
