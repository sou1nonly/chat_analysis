"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

interface Props {
    onClose: () => void;
}

export default function TrendCardExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.timeline) return null;

    const timeline = stats.timeline; // { date: string, count: number }[]

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
            label: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            ...data
        }));

    const maxMonthly = Math.max(...months.map(m => m.count), 1);

    // Find peaks and gaps
    const sortedDays = [...timeline].sort((a, b) => b.count - a.count);
    const topDays = sortedDays.slice(0, 5);

    // Find gaps (days with 0 or missing)
    const gaps: { start: string; end: string; days: number }[] = [];
    let gapStart: string | null = null;
    let gapCount = 0;

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
            {/* Monthly Breakdown */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4">Monthly Activity</h3>
                <div className="space-y-3">
                    {months.map((m, i) => {
                        const prevMonth = months[i - 1];
                        const change = prevMonth ? ((m.count - prevMonth.count) / prevMonth.count * 100) : 0;

                        return (
                            <div key={m.month} className="flex items-center gap-4">
                                <span className="w-24 text-sm text-zinc-400">{m.label}</span>
                                <div className="flex-1 h-6 bg-zinc-800 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500"
                                        style={{ width: `${(m.count / maxMonthly) * 100}%` }}
                                    />
                                </div>
                                <span className="w-24 text-right text-sm text-zinc-300 font-mono">
                                    {m.count.toLocaleString()}
                                </span>
                                {change !== 0 && (
                                    <span className={`w-16 text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {change > 0 ? '+' : ''}{change.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Milestones */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">🏆 Biggest Days</p>
                    <div className="space-y-2">
                        {topDays.map((day, i) => (
                            <div key={day.date} className="flex justify-between">
                                <span className="text-zinc-400 text-sm">
                                    {i + 1}. {new Date(day.date).toLocaleDateString()}
                                </span>
                                <span className="text-purple-400 font-mono text-sm">{day.count} msgs</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">💤 Longest Silences</p>
                    <div className="space-y-2">
                        {sortedGaps.length === 0 ? (
                            <p className="text-zinc-500 text-sm italic">No significant gaps found</p>
                        ) : (
                            sortedGaps.map((gap, i) => (
                                <div key={gap.start} className="flex justify-between">
                                    <span className="text-zinc-400 text-sm">
                                        {new Date(gap.start).toLocaleDateString()} → {new Date(gap.end).toLocaleDateString()}
                                    </span>
                                    <span className="text-orange-400 font-mono text-sm">{gap.days} days</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Summary */}
            <section className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{timeline.length}</p>
                    <p className="text-zinc-500 text-xs">Active Days</p>
                </div>
                <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white font-heading">
                        {Math.round(stats.totalMessages / timeline.length)}
                    </p>
                    <p className="text-zinc-500 text-xs">Avg Msgs/Day</p>
                </div>
                <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{months.length}</p>
                    <p className="text-zinc-500 text-xs">Months Covered</p>
                </div>
            </section>
        </div>
    );
}
