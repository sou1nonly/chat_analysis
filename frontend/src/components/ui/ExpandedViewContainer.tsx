"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import ExpandedModal from "@/components/ui/ExpandedModal";

// Expanded Views
import ActivityHeatmapExpanded from "@/components/expanded/ActivityHeatmapExpanded";
import TrendCardExpanded from "@/components/expanded/TrendCardExpanded";
import StreakCardExpanded from "@/components/expanded/StreakCardExpanded";
import WordCloudExpanded from "@/components/expanded/WordCloudExpanded";
import EngagementExpanded from "@/components/expanded/EngagementExpanded";
import LinksExpanded from "@/components/expanded/LinksExpanded";

// Card titles and descriptions mapping
const cardInfo: Record<string, { title: string; subtitle: string }> = {
    heatmap: { title: "Activity Heatmap", subtitle: "Deep dive into your messaging patterns" },
    trend: { title: "Message Trends", subtitle: "Monthly breakdown, milestones, and activity patterns" },
    streak: { title: "Streak Analysis", subtitle: "365-day activity calendar and consistency breakdown" },
    wordcloud: { title: "Vocabulary Analysis", subtitle: "Full word frequency breakdown and distribution" },
    engagement: { title: "Engagement Analysis", subtitle: "Head-to-head comparison and investment metrics" },
    links: { title: "Link Archive", subtitle: "All shared links with domain breakdown" },
    // Cards without expanded views yet
    summary: { title: "Summary", subtitle: "Overview of your conversation" },
    aura: { title: "Aura Analysis", subtitle: "The energy of your relationship" },
    rhythm: { title: "Rhythm", subtitle: "Communication tempo patterns" },
    initiator: { title: "Initiator Stats", subtitle: "Who starts conversations" },
    replyTime: { title: "Reply Timing", subtitle: "Response speed analysis" },
};

export default function ExpandedViewContainer() {
    const { activeCard, setActiveCard } = useOrbitStore();

    if (!activeCard) return null;

    const close = () => setActiveCard(null);

    const renderContent = () => {
        switch (activeCard) {
            case "heatmap":
                return <ActivityHeatmapExpanded onClose={close} />;
            case "trend":
                return <TrendCardExpanded onClose={close} />;
            case "streak":
                return <StreakCardExpanded onClose={close} />;
            case "wordcloud":
                return <WordCloudExpanded onClose={close} />;
            case "engagement":
                return <EngagementExpanded onClose={close} />;
            case "links":
                return <LinksExpanded onClose={close} />;
            default:
                // For cards without expanded views, show coming soon
                return (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-400 space-y-4">
                        <div className="text-6xl">🚧</div>
                        <p className="text-lg font-medium">Expanded view coming soon</p>
                        <p className="text-sm text-zinc-500">
                            This detailed view is being built for the next update.
                        </p>
                    </div>
                );
        }
    };

    const info = cardInfo[activeCard] || { title: "Details", subtitle: "" };

    return (
        <ExpandedModal
            isOpen={true}
            onClose={close}
            title={info.title}
            subtitle={info.subtitle}
        >
            {renderContent()}
        </ExpandedModal>
    );
}
