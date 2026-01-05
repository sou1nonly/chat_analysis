"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ActivityHeatmapCard() {
    const { stats, setActiveCard } = useOrbitStore();

    if (!stats || !stats.heatmap) return null;

    const heatmap = stats.heatmap; // 7x24 array

    // Find max value for normalization
    let maxVal = 0;
    heatmap.forEach(day => day.forEach(val => {
        if (val > maxVal) maxVal = val;
    }));

    // Prevent divide by zero
    maxVal = maxVal || 1;

    // Helper for color intensity
    const getIntensity = (val: number) => {
        if (val === 0) return "bg-zinc-800/50";
        const intensity = Math.ceil((val / maxVal) * 10); // 1-10 scale
        // Purple shades mapping
        if (intensity <= 2) return "bg-pink-500/20";
        if (intensity <= 4) return "bg-pink-500/40";
        if (intensity <= 7) return "bg-purple-500/60";
        return "bg-indigo-500";
    };

    return (
        <div
            onClick={() => setActiveCard('heatmap')}
            className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 relative overflow-hidden flex flex-col h-full cursor-pointer hover:border-zinc-700 transition-colors group"
        >
            {/* Expand Hint */}
            <div className="absolute top-4 right-4 text-[9px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to expand →
            </div>

            <div className="mb-4 z-10 flex justify-between items-end">
                <div>
                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Habits</h3>
                    <p className="text-white text-xl font-heading font-medium">Activity Heatmap</p>
                </div>
                <div className="flex gap-2 text-[10px] text-zinc-500 items-center">
                    <span>Less</span>
                    <div className="w-2 h-2 bg-zinc-800/50 rounded-sm" />
                    <div className="w-2 h-2 bg-purple-900/40 rounded-sm" />
                    <div className="w-2 h-2 bg-purple-600/80 rounded-sm" />
                    <div className="w-2 h-2 bg-purple-400 rounded-sm" />
                    <span>More</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-1 overflow-x-auto z-10">
                <div className="flex">
                    <div className="w-8 shrink-0" /> {/* Y-axis Label Spacer */}
                    <div className="flex flex-1 justify-between px-1">
                        {/* X-axis Labels (every 4 hours) */}
                        {HOURS.filter(h => h % 4 === 0).map(h => (
                            <span key={h} className="text-[9px] text-zinc-600 font-mono">
                                {h.toString().padStart(2, '0')}:00
                            </span>
                        ))}
                    </div>
                </div>

                {DAYS.map((day, dIndex) => (
                    <div key={day} className="flex items-center gap-1 h-full">
                        <span className="text-[9px] text-zinc-600 font-mono w-8 shrink-0">{day}</span>
                        {HOURS.map((hour) => {
                            const val = heatmap[dIndex][hour];
                            return (
                                <div
                                    key={`${day}-${hour}`}
                                    className={`flex-1 h-4 rounded-sm transition-all duration-300 ${getIntensity(val)}`}
                                    title={`${day} @ ${hour}:00 - ${val} messages`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
