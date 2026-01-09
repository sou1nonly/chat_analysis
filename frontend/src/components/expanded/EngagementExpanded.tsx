"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { User, MessageCircle, Clock, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function EngagementExpanded({ onClose }: { onClose: () => void }) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.participants) return null;

    const participantsList = Object.keys(stats.participants);
    if (participantsList.length !== 2) return null; // Only support 2 people for now

    const p1 = participantsList[0];
    const p2 = participantsList[1];
    const d1 = stats.participants[p1];
    const d2 = stats.participants[p2];

    const totalMsgs = d1.count + d2.count;
    const p1Share = totalMsgs > 0 ? Math.round((d1.count / totalMsgs) * 100) : 0;
    const p2Share = 100 - p1Share;

    // Investment score (dummy calculation or use real metric)
    const investmentWinner = p1Share > 50 ? p1 : p2;
    const investmentDiff = Math.abs(p1Share - p2Share);

    const metrics = [
        { label: "Total Messages", p1: d1.count.toLocaleString(), p2: d2.count.toLocaleString(), icon: MessageCircle },
        { label: "Avg Msg Len", p1: `${Math.round(d1.avgLength)}`, p2: `${Math.round(d2.avgLength)}`, icon: User },
        { label: "Double Texts", p1: d1.doubleTextCount.toLocaleString(), p2: d2.doubleTextCount.toLocaleString(), icon: Zap },
        { label: "Share of Convo", p1: `${p1Share}%`, p2: `${p2Share}%`, icon: Heart, highlight: true },
    ];

    return (
        <div className="space-y-8">
            {/* Header Comparison */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full" /> Head-to-Head Comparison
                </h3>

                <div className="grid grid-cols-12 gap-4 items-center mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-4">
                    <div className="col-span-4">Metric</div>
                    <div className="col-span-4 text-center text-blue-400 truncate">{participantsList[0]}</div>
                    <div className="col-span-4 text-center text-pink-400 truncate">{participantsList[1]}</div>
                </div>

                <div className="space-y-4">
                    {metrics.map((m, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-12 gap-4 items-center group py-2 border-b border-white/5 last:border-0"
                        >
                            <div className="col-span-4 flex items-center gap-3 text-zinc-300 group-hover:text-white transition-colors">
                                <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors">
                                    <m.icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm">{m.label}</span>
                            </div>
                            <div className={`col-span-4 text-center font-mono font-bold text-lg ${m.highlight ? 'text-blue-400' : 'text-zinc-400'}`}>
                                {m.p1}
                            </div>
                            <div className={`col-span-4 text-center font-mono font-bold text-lg ${m.highlight ? 'text-pink-400' : 'text-zinc-400'}`}>
                                {m.p2}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Message Volume
                    </h4>
                    <div className="relative h-4 bg-zinc-800/50 rounded-full overflow-hidden flex">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p1Share}%` }}
                            transition={{ duration: 1, ease: 'circOut' }}
                            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p2Share}%` }}
                            transition={{ duration: 1, delay: 0.2, ease: 'circOut' }}
                            className="h-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.6)]"
                        />
                    </div>
                    <div className="flex justify-between mt-3 text-xs font-bold font-mono opacity-80">
                        <span className="text-blue-400">{d1.count} msgs</span>
                        <span className="text-pink-400">{d2.count} msgs</span>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Investment Score
                    </h4>

                    <div className="py-2">
                        <p className="text-xl text-white font-heading leading-relaxed">
                            <span className="font-bold text-white border-b-2 border-white/20 pb-0.5">{investmentWinner}</span> is
                            <span className="mx-2 inline-block px-2 py-0.5 rounded bg-white/10 text-sm font-bold border border-white/5">
                                +{investmentDiff}%
                            </span>
                            more active.
                        </p>
                        <p className="text-zinc-500 text-xs mt-3">
                            Based on message count, double text frequency, and average length.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
