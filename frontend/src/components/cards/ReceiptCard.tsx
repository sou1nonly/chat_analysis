"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Barcode } from "lucide-react";

export default function ReceiptCard() {
    const { stats } = useOrbitStore();

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

    // Formatting helper
    const fmt = (n: number) => n.toLocaleString();

    const topics = [
        { name: "LATE NIGHT MESSAGES", value: fmt(lateNights), code: "LN01" },
        { name: "EARLY BIRD CHATS", value: fmt(earlyBirds), code: "EB02" },
        { name: "TOP EMOJI USED", value: stats.topEmojis[0]?.emoji || "-", code: "EM01" },
        { name: "RUNNER UP EMOJI", value: stats.topEmojis[1]?.emoji || "-", code: "EM02" },
        { name: "LONGEST STREAK", value: `${stats.streak.max} DAYS`, code: "SK01" },
    ];

    const startDate = new Date(stats.startDate).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    }).toUpperCase();

    const now = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <div className="flex items-center justify-center p-4">
            <motion.div
                className="w-[340px] bg-[#fdfbf7] text-[#1a1a1a] shadow-2xl relative font-mono text-xs leading-relaxed filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                initial={{ opacity: 0, y: 20, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 2 }}
                whileHover={{ rotate: 0, scale: 1.01 }}
                transition={{ duration: 0.4, type: "spring" }}
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
                            <span>{startDate}</span>
                            <span>•</span>
                            <span>{now}</span>
                        </div>
                        <p className="font-bold tracking-widest text-[10px] uppercase border px-2 py-0.5 inline-block border-black">
                            Orbit Analytics
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
                            <p className="text-[9px] font-bold uppercase tracking-widest leading-tight">Thank you <br />for texting core</p>
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
    );
}
