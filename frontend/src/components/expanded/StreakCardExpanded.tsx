"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

interface Props {
    onClose: () => void;
}

export default function StreakCardExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.streak) return null;

    const { activeDays, current, max } = stats.streak;
    const allDays = Object.keys(activeDays).sort();

    if (allDays.length === 0) return null;

    // Build calendar grid (last 365 days)
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setDate(yearAgo.getDate() - 364);

    const calendarDays: { date: Date; count: number }[] = [];
    for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        calendarDays.push({
            date: new Date(d),
            count: activeDays[key] || 0
        });
    }

    // Group by week for grid display
    const weeks: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];

    calendarDays.forEach((day, i) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Find all streaks
    const streaks: { start: string; end: string; length: number }[] = [];
    let streakStart = allDays[0];
    let streakLength = 1;

    for (let i = 1; i < allDays.length; i++) {
        const prev = new Date(allDays[i - 1]);
        const curr = new Date(allDays[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streakLength++;
        } else {
            if (streakLength >= 3) {
                streaks.push({ start: streakStart, end: allDays[i - 1], length: streakLength });
            }
            streakStart = allDays[i];
            streakLength = 1;
        }
    }
    if (streakLength >= 3) {
        streaks.push({ start: streakStart, end: allDays[allDays.length - 1], length: streakLength });
    }

    const sortedStreaks = streaks.sort((a, b) => b.length - a.length).slice(0, 10);

    // Consistency score
    const firstDay = new Date(allDays[0]);
    const lastDay = new Date(allDays[allDays.length - 1]);
    const totalPossibleDays = Math.round((lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const consistencyScore = Math.round((allDays.length / totalPossibleDays) * 100);

    // Color helper
    const getColor = (count: number) => {
        if (count === 0) return "bg-zinc-800/30";
        if (count < 10) return "bg-purple-900/40";
        if (count < 30) return "bg-purple-700/60";
        if (count < 60) return "bg-purple-500/80";
        return "bg-purple-400";
    };

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-orange-400 font-heading">🔥 {current}</p>
                    <p className="text-zinc-500 text-xs mt-1">Current Streak</p>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-purple-400 font-heading">⚡ {max}</p>
                    <p className="text-zinc-500 text-xs mt-1">Best Streak</p>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{consistencyScore}%</p>
                    <p className="text-zinc-500 text-xs mt-1">Consistency</p>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{allDays.length}</p>
                    <p className="text-zinc-500 text-xs mt-1">Total Active Days</p>
                </div>
            </section>

            {/* Calendar Heatmap */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4">365-Day Activity</h3>
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-1" style={{ minWidth: '800px' }}>
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-1">
                                {week.map((day, dIdx) => (
                                    <div
                                        key={`${wIdx}-${dIdx}`}
                                        className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-all hover:ring-1 hover:ring-white/50 cursor-pointer`}
                                        title={`${day.date.toLocaleDateString()}: ${day.count} msgs`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2 text-[10px] text-zinc-500 items-center mt-2">
                    <span>Less</span>
                    <div className="w-3 h-3 bg-zinc-800/30 rounded-sm" />
                    <div className="w-3 h-3 bg-purple-900/40 rounded-sm" />
                    <div className="w-3 h-3 bg-purple-700/60 rounded-sm" />
                    <div className="w-3 h-3 bg-purple-400 rounded-sm" />
                    <span>More</span>
                </div>
            </section>

            {/* All Streaks */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4">Notable Streaks (3+ days)</h3>
                {sortedStreaks.length === 0 ? (
                    <p className="text-zinc-500 italic">No streaks of 3+ days found</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sortedStreaks.map((streak, i) => (
                            <div key={streak.start} className="flex justify-between items-center bg-zinc-800/30 rounded-xl p-3">
                                <span className="text-zinc-400 text-sm">
                                    {new Date(streak.start).toLocaleDateString()} → {new Date(streak.end).toLocaleDateString()}
                                </span>
                                <span className={`font-mono font-bold ${i === 0 ? 'text-purple-400' : 'text-zinc-300'}`}>
                                    {streak.length} days
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
