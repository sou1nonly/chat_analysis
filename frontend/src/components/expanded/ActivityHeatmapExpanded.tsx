"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
    onClose: () => void;
}

export default function ActivityHeatmapExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.heatmap) return null;

    const heatmap = stats.heatmap; // 7x24 grid

    // Calculate totals per day
    const dayTotals = heatmap.map((day, i) => ({
        name: DAYS[i],
        short: DAYS[i].slice(0, 3),
        total: day.reduce((a, b) => a + b, 0)
    }));
    const maxDayTotal = Math.max(...dayTotals.map(d => d.total), 1);

    // Find peak hour/day
    let peakDay = 0, peakHour = 0, peakVal = 0;
    heatmap.forEach((day, dIdx) => {
        day.forEach((val, hIdx) => {
            if (val > peakVal) {
                peakVal = val;
                peakDay = dIdx;
                peakHour = hIdx;
            }
        });
    });

    // Find dead zones (hours with <5% of peak)
    const threshold = peakVal * 0.05;
    const deadZones: string[] = [];
    heatmap.forEach((day, dIdx) => {
        day.forEach((val, hIdx) => {
            if (val <= threshold && val === 0) {
                // Only note if consistent
            }
        });
    });

    // Weekend vs Weekday comparison
    const weekdayTotal = dayTotals.slice(1, 6).reduce((a, d) => a + d.total, 0);
    const weekendTotal = dayTotals[0].total + dayTotals[6].total;
    const weekendRatio = weekdayTotal > 0 ? ((weekendTotal / (weekendTotal + weekdayTotal)) * 100).toFixed(0) : "0";

    // Hourly totals (all days combined)
    const hourlyTotals = HOURS.map(h => heatmap.reduce((sum, day) => sum + day[h], 0));
    const maxHourly = Math.max(...hourlyTotals, 1);

    return (
        <div className="space-y-8">
            {/* Peak Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-purple-300 text-xs uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                        🔥 Peak Activity
                    </p>
                    <p className="text-white text-2xl font-bold font-heading relative z-10">
                        {DAYS[peakDay]} @ {peakHour}:00
                    </p>
                    <p className="text-zinc-400 text-sm mt-1 relative z-10">{peakVal.toLocaleString()} messages</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-blue-300 text-xs uppercase tracking-widest mb-2 font-bold">📅 Weekend vs Weekday</p>
                    <p className="text-white text-2xl font-bold font-heading relative z-10">
                        {weekendRatio}% Weekend
                    </p>
                    <p className="text-zinc-400 text-sm mt-1 relative z-10">
                        {weekendTotal > weekdayTotal / 2.5 ? "Heavy weekend texter" : "More active during the week"}
                    </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-indigo-300 text-xs uppercase tracking-widest mb-2 font-bold">🌙 Night Owl Score</p>
                    <p className="text-white text-2xl font-bold font-heading relative z-10">
                        {((hourlyTotals.slice(22, 24).reduce((a, b) => a + b, 0) + hourlyTotals.slice(0, 4).reduce((a, b) => a + b, 0)) / (stats.totalMessages || 1) * 100).toFixed(0)}%
                    </p>
                    <p className="text-zinc-400 text-sm mt-1 relative z-10">Messages sent 10PM - 4AM</p>
                </div>
            </section>

            {/* Day of Week Breakdown */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" />
                    Messages by Day
                </h3>
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    {dayTotals.map((day, i) => (
                        <div key={day.name} className="flex items-center gap-4 group">
                            <span className="w-24 text-sm text-zinc-400 font-medium group-hover:text-white transition-colors">{day.name}</span>
                            <div className="flex-1 h-4 bg-zinc-800/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${i === 0 || i === 6 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-zinc-600 group-hover:bg-zinc-500'}`}
                                    style={{ width: `${(day.total / maxDayTotal) * 100}%` }}
                                />
                            </div>
                            <span className="w-20 text-right text-sm text-zinc-300 font-mono group-hover:text-white transition-colors">
                                {day.total.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Hourly Distribution */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full" />
                    Messages by Hour
                </h3>
                <div className="flex items-end gap-1 h-48 bg-white/5 rounded-2xl p-6 border border-white/5 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-10">
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                    </div>

                    {hourlyTotals.map((count, h) => (
                        <div
                            key={h}
                            className="flex-1 bg-gradient-to-t from-purple-600/50 to-blue-500/50 rounded-t-sm transition-all hover:opacity-100 hover:from-purple-500 hover:to-blue-400 cursor-pointer relative group"
                            style={{ height: `${(count / maxHourly) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-white/10 shadow-xl z-20">
                                <span className="font-bold">{h}:00</span> • <span className="text-purple-300">{count.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-2 px-6 uppercase tracking-wider font-bold">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>12 AM</span>
                </div>
            </section>
        </div>
    );
}
