"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function TrendCard() {
    const { stats } = useOrbitStore();
    const [hoveredPoint, setHoveredPoint] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

    if (!stats) return null;

    const data = stats.timeline;
    const sampleRate = Math.ceil(data.length / 60);
    const chartData = data.filter((_, i) => i % sampleRate === 0);

    const maxCount = Math.max(...chartData.map(d => d.count), 1);
    const height = 80;
    const width = 400;

    // Calculate trend
    const recentSum = chartData.slice(-7).reduce((a, b) => a + b.count, 0);
    const previousSum = chartData.slice(-14, -7).reduce((a, b) => a + b.count, 0);
    const trendPercent = previousSum > 0 ? Math.round(((recentSum - previousSum) / previousSum) * 100) : 0;
    const isPositive = trendPercent >= 0;

    // Create SVG Path Points
    const pathPoints = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1 || 1)) * width;
        const y = height - (d.count / maxCount) * height * 0.9;
        return { x, y, data: d };
    });

    const linePath = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Activity</h3>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">Message Timeline</p>
                    </div>
                </div>

                {/* Trend Badge */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isPositive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trendPercent)}%
                </div>
            </div>

            {/* Peak info */}
            <div className="text-xs text-gray-400 mb-2">
                Peak: <span className="text-white font-medium">{maxCount} msgs/day</span>
            </div>

            {/* Chart */}
            <div
                className="flex-1 relative min-h-[100px]"
                onMouseLeave={() => setHoveredPoint(null)}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    {/* Gradient */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <path d={areaPath} fill="url(#chartGradient)" />

                    {/* Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Interactive Points */}
                    {pathPoints.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="8"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPoint({
                                date: p.data.date,
                                count: p.data.count,
                                x: p.x,
                                y: p.y
                            })}
                        />
                    ))}

                    {/* Active dot */}
                    {hoveredPoint && (
                        <circle
                            cx={hoveredPoint.x}
                            cy={hoveredPoint.y}
                            r="4"
                            fill="#A855F7"
                            stroke="#111114"
                            strokeWidth="2"
                        />
                    )}
                </svg>

                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="absolute bg-[#1A1A1F] border border-purple-500/30 text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-lg z-10"
                        style={{
                            left: `${Math.min(Math.max((hoveredPoint.x / width) * 100, 10), 90)}%`,
                            top: '0',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <p className="font-semibold text-purple-400">{hoveredPoint.count} messages</p>
                        <p className="text-gray-400 text-[10px]">
                            {new Date(hoveredPoint.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
