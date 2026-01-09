"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    onClose: () => void;
}

export default function TrendCardExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.timeline) return null;

    const timeline = stats.timeline;

    // Group by month
    const monthlyData: Record<string, { count: number; days: number }> = {};
    timeline.forEach(({ date, count }) => {
        const monthKey = date.substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, days: 0 };
        }
        monthlyData[monthKey].count += count;
        monthlyData[monthKey].days++;
    });

    const months = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
            month,
            label: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            fullLabel: new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            ...data
        }));

    const maxMonthly = Math.max(...months.map(m => m.count), 1);

    // Find peaks
    const sortedDays = [...timeline].sort((a, b) => b.count - a.count);
    const topDays = sortedDays.slice(0, 5);

    // Find longest gaps
    const gaps: { start: string; end: string; days: number }[] = [];
    for (let i = 1; i < timeline.length; i++) {
        const prev = new Date(timeline[i - 1].date);
        const curr = new Date(timeline[i].date);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            gaps.push({
                start: timeline[i - 1].date,
                end: timeline[i].date,
                days: diffDays - 1
            });
        }
    }
    const sortedGaps = gaps.sort((a, b) => b.days - a.days).slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Stats Summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <TrendingUp className="w-12 h-12 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-heading">{timeline.length}</p>
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mt-1">Active Days</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Calendar className="w-12 h-12 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-heading">
                        {Math.round(stats.totalMessages / timeline.length)}
                    </p>
                    <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mt-1">Avg Msgs/Day</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <AlertCircle className="w-12 h-12 text-pink-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-heading">{months.length}</p>
                    <p className="text-pink-300 text-xs font-bold uppercase tracking-wider mt-1">Months Tracked</p>
                </div>
            </section>

            {/* Monthly Breakdown */}
            <section className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" /> Monthly Activity
                </h3>
                <div className="space-y-3">
                    {months.map((m, i) => {
                        const prevMonth = months[i - 1];
                        const change = prevMonth ? ((m.count - prevMonth.count) / prevMonth.count * 100) : 0;

                        return (
                            <div key={m.month} className="grid grid-cols-12 gap-3 items-center group">
                                <div className="col-span-2 text-xs font-medium text-zinc-400 group-hover:text-white transition-colors truncate">
                                    {m.label}
                                </div>

                                <div className="col-span-8 h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                                        style={{ width: `${(m.count / maxMonthly) * 100}%` }}
                                    />
                                </div>

                                <div className="col-span-2 flex justify-end items-center gap-2 text-xs">
                                    <span className="text-white font-mono">{m.count.toLocaleString()}</span>
                                    <div className={`w-10 text-right ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-zinc-600'}`}>
                                        {change !== 0 ? (change > 0 ? '↑' : '↓') : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Peaks & Gaps */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-4 pb-2 border-b border-white/5">
                        🏆 Busiest Days
                    </h4>
                    <div className="space-y-2">
                        {topDays.map((day, i) => (
                            <div key={day.date} className="flex justify-between items-center py-1">
                                <span className="text-zinc-400 text-sm">
                                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                </span>
                                <span className="text-white font-mono font-bold text-sm">
                                    {day.count.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                    <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-4 pb-2 border-b border-white/5">
                        💤 Longest Breaks
                    </h4>
                    <div className="space-y-2">
                        {sortedGaps.length === 0 ? (
                            <p className="text-zinc-500 text-xs italic">No breaks found</p>
                        ) : (
                            sortedGaps.map((gap, i) => (
                                <div key={gap.start} className="flex justify-between items-center py-1">
                                    <span className="text-zinc-400 text-sm">
                                        {new Date(gap.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        <span className="mx-1 text-zinc-600">→</span>
                                        {new Date(gap.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-orange-400 font-mono font-bold text-sm">
                                        {gap.days} d
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
