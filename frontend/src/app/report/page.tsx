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
import InitiatorCard from "@/components/cards/InitiatorCard";
import ReplyTimingCard from "@/components/cards/ReplyTimingCard";
import AIInsightsSection from "@/components/cards/AIInsightsSection";
import DetailsWrapper from "@/components/ui/DetailsWrapper";
import ExpandedViewContainer from "@/components/ui/ExpandedViewContainer";
import ProcessingOverlay from "@/components/ui/ProcessingOverlay";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";

export default function ReportPage() {
    const {
        stats, status, uploadId,
        setActiveCard,
        isPipelineReady, setPipelineReady
    } = useOrbitStore();
    const router = useRouter();

    useEffect(() => {
        // If no data, redirect to airlock
        if (!stats && status === "idle") {
            router.push("/");
        }
    }, [stats, status, router]);

    // Mark pipeline as ready when stats are loaded (AI will be separate)
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
        <main className="min-h-screen bg-background py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Orbit Intelligence</h1>
                        <p className="text-zinc-500 text-sm uppercase tracking-widest mt-2">
                            RELATIONSHIP ANALYTICS PRO MAX
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-zinc-400 font-medium">Server Mode • Powered by Ollama</span>
                    </div>
                </header>

                {/* The Bento Grid */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                    {/* Row 1: The Big Picture */}
                    <DetailsWrapper onExpand={() => handleExpand('summary')} colSpan="col-span-1 md:col-span-2 row-span-2">
                        <SummaryCard />
                    </DetailsWrapper>

                    <DetailsWrapper onExpand={() => handleExpand('trend')} colSpan="col-span-1 md:col-span-2">
                        <TrendCard />
                    </DetailsWrapper>

                    <DetailsWrapper onExpand={() => handleExpand('streak')}>
                        <StreakCard />
                    </DetailsWrapper>

                    <DetailsWrapper onExpand={() => handleExpand('initiator')}>
                        <InitiatorCard />
                    </DetailsWrapper>

                    {/* Row 2: Deep Habits */}
                    <DetailsWrapper onExpand={() => handleExpand('heatmap')} colSpan="col-span-1 md:col-span-2">
                        <ActivityHeatmapCard />
                    </DetailsWrapper>

                    <WordCloudCard />

                    {/* Row 3: Engagement Layer */}
                    <DetailsWrapper onExpand={() => handleExpand('engagement')} colSpan="col-span-1 md:col-span-2">
                        <EngagementCard />
                    </DetailsWrapper>

                    <DetailsWrapper onExpand={() => handleExpand('replyTime')} colSpan="col-span-1 md:col-span-2">
                        <ReplyTimingCard />
                    </DetailsWrapper>

                    {/* Row 4: Vibe Check */}
                    <DetailsWrapper onExpand={() => handleExpand('aura')}>
                        <AuraCard />
                    </DetailsWrapper>
                    <DetailsWrapper onExpand={() => handleExpand('rhythm')}>
                        <RhythmCard />
                    </DetailsWrapper>
                    <DetailsWrapper onExpand={() => handleExpand('links')} colSpan="col-span-1 md:col-span-2">
                        <LinksCard />
                    </DetailsWrapper>

                    {/* Row 5: AI Insights Section */}
                    <AIInsightsSection />

                    {/* Row 6: Final Receipt */}
                    <div className="col-span-1 md:col-span-4 mt-8 flex justify-center">
                        <div className="w-full max-w-md">
                            <ReceiptCard />
                        </div>
                    </div>
                </section>

                <footer className="text-center text-zinc-600 text-xs py-12">
                    Generated by Orbit v3.0 • Three-Tier Architecture
                </footer>
                <ExpandedViewContainer />
                <ProcessingOverlay />
            </div>

            {/* In-App Support Bubble */}
            <div className="fixed bottom-6 right-6 z-50 group">
                <button className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
                    <MessageCircle className="w-6 h-6" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white text-black p-3 rounded-xl text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none origin-bottom-right transform scale-95 group-hover:scale-100">
                    <p className="font-bold mb-1">Need help?</p>
                    <p>Our engineers are sleeping, but the AI is awake.</p>
                </div>
            </div>
        </main>
    );
}
