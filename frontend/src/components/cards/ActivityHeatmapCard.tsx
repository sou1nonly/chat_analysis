"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Grid3X3 } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ActivityHeatmapCard() {
    const { stats } = useOrbitStore();

    if (!stats || !stats.heatmap) return null;

    const heatmap = stats.heatmap;

    // Find max value for normalization
    let maxVal = 0;
    heatmap.forEach(day => day.forEach(val => {
        if (val > maxVal) maxVal = val;
    }));
    maxVal = maxVal || 1;

    // Purple gradient intensity
    const getIntensity = (val: number) => {
        if (val === 0) return "bg-purple-500/5";
        const intensity = val / maxVal;
        if (intensity <= 0.2) return "bg-purple-500/20";
        if (intensity <= 0.4) return "bg-purple-500/40";
        if (intensity <= 0.6) return "bg-purple-500/60";
        if (intensity <= 0.8) return "bg-purple-400/80";
        return "bg-purple-400";
    };

    return (
        <div className="h-full flex flex-col min-h-[200px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Grid3X3 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Activity Heatmap</h3>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">When You Chat</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1 text-[9px] text-gray-500">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded bg-purple-500/10" />
                    <div className="w-3 h-3 rounded bg-purple-500/40" />
                    <div className="w-3 h-3 rounded bg-purple-400" />
                    <span>More</span>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex pl-10 mb-1">
                <div className="flex flex-1 justify-between text-[8px] text-gray-600 px-1">
                    <span>00</span>
                    <span>06</span>
                    <span>12</span>
                    <span>18</span>
                    <span>24</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex-1 flex flex-col gap-[3px]">
                {DAYS.map((day, dIndex) => (
                    <div key={day} className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 w-8 shrink-0 text-right">{day}</span>
                        <div className="flex gap-[2px] flex-1">
                            {Array.from({ length: 24 }, (_, hour) => {
                                const val = heatmap[dIndex]?.[hour] || 0;
                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className={`flex-1 aspect-square rounded-sm ${getIntensity(val)} hover:ring-1 hover:ring-purple-400/50 transition-all cursor-pointer min-w-[8px]`}
                                        title={`${day} ${hour}:00 - ${val} msgs`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
