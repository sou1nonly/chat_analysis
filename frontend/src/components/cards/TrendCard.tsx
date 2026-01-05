"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import ExpandedModal from "@/components/ui/ExpandedModal";
import TrendCardExpanded from "@/components/expanded/TrendCardExpanded";

export default function TrendCard() {
    const { stats, setActiveCard } = useOrbitStore();
    const [hoveredPoint, setHoveredPoint] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

    if (!stats) return null;

    const data = stats.timeline; // { date: string, count: number }[]

    // Downsample if too many points for visual clarity (max 50 points)
    const sampleRate = Math.ceil(data.length / 50);
    const chartData = data.filter((_, i) => i % sampleRate === 0);

    const maxCount = Math.max(...chartData.map(d => d.count));
    const height = 100;
    const width = 300;

    // Create SVG Path
    const points = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * width;
        const y = height - (d.count / maxCount) * height;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div
            onClick={() => setActiveCard('trend')}
            className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 relative overflow-hidden group h-full cursor-pointer hover:border-zinc-700 transition-colors"
        >
            {/* Expand Hint */}
            <div className="absolute top-4 right-4 text-[9px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to expand →
            </div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Activity Timeline</h3>
                    <p className="text-white text-2xl font-heading font-medium">Message Trends</p>
                </div>
                <div className="text-right">
                    <p className="text-emerald-400 font-mono text-xs">Peak: {maxCount} msgs/day</p>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-32 w-full flex items-end" onMouseLeave={() => setHoveredPoint(null)}>
                <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-full overflow-visible">
                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={`M0,${height} ${points} L${width},${height} Z`}
                        fill="url(#trendGradient)"
                    />
                    {/* Line */}
                    <path
                        d={`M${points}`}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Interactive Points */}
                    {chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * width;
                        const y = height - (d.count / maxCount) * height;
                        return (
                            <circle
                                key={d.date}
                                cx={x}
                                cy={y}
                                r="6"
                                fill="transparent"
                                className="cursor-pointer hover:fill-white transition-colors"
                                onMouseEnter={() => setHoveredPoint({ date: d.date, count: d.count, x, y })}
                            />
                        );
                    })}
                </svg>

                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="absolute bg-zinc-800 text-white text-xs px-2 py-1 rounded border border-zinc-700 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
                        style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
                    >
                        <p className="font-bold">{hoveredPoint.count} msgs</p>
                        <p className="text-zinc-500">{new Date(hoveredPoint.date).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
