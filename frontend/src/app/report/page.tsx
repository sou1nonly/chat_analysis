"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import AuraCard from "@/components/cards/AuraCard";
import ReceiptCard from "@/components/cards/ReceiptCard";
import RhythmCard from "@/components/cards/RhythmCard";
import SummaryCard from "@/components/cards/SummaryCard";
import TrendCard from "@/components/cards/TrendCard";
import WordCloudCard from "@/components/cards/WordCloudCard";
import StreakCard from "@/components/cards/StreakCard";
import EngagementCard from "@/components/cards/EngagementCard";
import LinksCard from "@/components/cards/LinksCard";
import ActivityHeatmapCard from "../../components/cards/ActivityHeatmapCard";
import EmojiTimelineCard from "@/components/cards/EmojiTimelineCard";
import InitiatorCard from "@/components/cards/InitiatorCard";
import ReplyTimingCard from "@/components/cards/ReplyTimingCard";
import AIInsightsSection from "@/components/cards/AIInsightsSection";
import ExpandedViewContainer from "@/components/ui/ExpandedViewContainer";
import ProcessingOverlay from "@/components/ui/ProcessingOverlay";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";

export default function ReportPage() {
    const {
        stats, status, uploadId,
        setActiveCard,
        isPipelineReady, setPipelineReady
    } = useOrbitStore();
    const router = useRouter();

    useEffect(() => {
        if (!stats && status === "idle") {
            router.push("/");
        }
    }, [stats, status, router]);

    useEffect(() => {
        if (stats && !isPipelineReady) {
            setPipelineReady(true);
        }
    }, [stats, isPipelineReady, setPipelineReady]);

    const handleExpand = (card: string) => {
        setActiveCard(card);
    };

    if (!stats) return null;

    return (
        <main className="min-h-screen py-6 px-4 md:px-6 bg-[#050507]">
            <div className="max-w-[1400px] mx-auto space-y-5">

                {/* Header */}
                <motion.header
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer group"
                    >
                        <h1 className="text-xl md:text-2xl font-heading font-bold">
                            <span className="text-white">Orbit</span>
                            <span className="text-white">.</span>
                            <AuroraText
                                colors={["#a855f7", "#7c3aed", "#8b5cf6", "#a855f7"]}
                                speed={1.5}
                                className="font-bold"
                            >
                                Intelligence
                            </AuroraText>
                        </h1>
                    </button>

                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">AI Powered</span>
                    </div>
                </motion.header>

                {/* Bento Grid */}
                <motion.div
                    className="grid grid-cols-12 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Row 1: Overview + Activity Chart + Streak */}
                    <div
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <SummaryCard />
                    </div>

                    <div
                        onClick={() => handleExpand('trend')}
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer hover:border-purple-500/30 transition-all"
                    >
                        <TrendCard />
                    </div>

                    <div
                        onClick={() => handleExpand('streak')}
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer hover:border-green-500/30 transition-all"
                    >
                        <StreakCard />
                    </div>

                    {/* Row 2: Heatmap + Word Cloud */}
                    <div
                        onClick={() => handleExpand('heatmap')}
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer hover:border-purple-500/30 transition-all"
                    >
                        <ActivityHeatmapCard />
                    </div>

                    <div
                        onClick={() => handleExpand('wordcloud')}
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer hover:border-yellow-500/30 transition-all"
                    >
                        <WordCloudCard />
                    </div>

                    {/* Row 3: Engagement + Reply Speed + Aura + Rhythm */}
                    <div
                        onClick={() => handleExpand('engagement')}
                        className="col-span-12 md:col-span-4 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer hover:border-blue-500/30 transition-all"
                    >
                        <EngagementCard />
                    </div>

                    <div
                        className="col-span-12 md:col-span-4 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <ReplyTimingCard />
                    </div>

                    <div
                        className="col-span-6 md:col-span-2 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <AuraCard />
                    </div>

                    <div
                        className="col-span-6 md:col-span-2 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <RhythmCard />
                    </div>

                    {/* Row 4: Links + Emoji Timeline + Initiator */}
                    <div
                        onClick={() => handleExpand('links')}
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer hover:border-blue-500/30 transition-all"
                    >
                        <LinksCard />
                    </div>

                    <div
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer hover:border-pink-500/30 transition-all"
                    >
                        <EmojiTimelineCard />
                    </div>

                    <div
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <InitiatorCard />
                    </div>

                    {/* AI Insights - Full Width */}
                    <div className="col-span-12">
                        <AIInsightsSection />
                    </div>

                    {/* Receipt */}
                    <div className="col-span-12 flex justify-center py-6">
                        <div className="w-full max-w-sm">
                            <ReceiptCard />
                        </div>
                    </div>
                </motion.div>

                <ExpandedViewContainer />
                <ProcessingOverlay />
            </div>
        </main>
    );
}
