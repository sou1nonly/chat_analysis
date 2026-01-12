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

// Subtle spring hover animation for cards
const springHover = {
    scale: 1.01,
    transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
    }
};

const springTap = {
    scale: 0.99,
    transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
    }
};

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
                        <h1 className="text-2xl md:text-3xl font-heading font-bold">
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
                    <motion.div
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <SummaryCard />
                    </motion.div>

                    <motion.div
                        onClick={() => handleExpand('trend')}
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer"
                    >
                        <TrendCard />
                    </motion.div>

                    <motion.div
                        onClick={() => handleExpand('streak')}
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer"
                    >
                        <StreakCard />
                    </motion.div>

                    {/* Row 2: Heatmap + Word Cloud */}
                    <motion.div
                        onClick={() => handleExpand('heatmap')}
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer"
                    >
                        <ActivityHeatmapCard />
                    </motion.div>

                    <motion.div
                        onClick={() => handleExpand('wordcloud')}
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer"
                    >
                        <WordCloudCard />
                    </motion.div>

                    {/* Row 3: Engagement + Reply Speed + Aura + Rhythm */}
                    <motion.div
                        onClick={() => handleExpand('engagement')}
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-4 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer"
                    >
                        <EngagementCard />
                    </motion.div>

                    <motion.div
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-4 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <ReplyTimingCard />
                    </motion.div>

                    <motion.div
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-6 md:col-span-2 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <AuraCard />
                    </motion.div>

                    <motion.div
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-6 md:col-span-2 bg-[#111114] rounded-2xl border border-white/5 p-1 overflow-hidden"
                    >
                        <RhythmCard />
                    </motion.div>

                    {/* Row 4: Links + Emoji Timeline + Initiator */}
                    <motion.div
                        onClick={() => handleExpand('links')}
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4 cursor-pointer"
                    >
                        <LinksCard />
                    </motion.div>

                    <motion.div
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-6 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <EmojiTimelineCard />
                    </motion.div>

                    <motion.div
                        whileHover={springHover}
                        whileTap={springTap}
                        className="col-span-12 md:col-span-3 bg-[#111114] rounded-2xl border border-white/5 p-4"
                    >
                        <InitiatorCard />
                    </motion.div>

                    {/* AI Insights - Full Width */}
                    <div className="col-span-12">
                        <AIInsightsSection />
                    </div>

                    {/* Receipt */}
                    <div className="col-span-12 flex justify-center py-6">
                        <motion.div
                            className="w-full max-w-sm"
                            whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        >
                            <ReceiptCard />
                        </motion.div>
                    </div>
                </motion.div>

                <ExpandedViewContainer />
                <ProcessingOverlay />
            </div>
        </main>
    );
}
