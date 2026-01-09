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
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-orange-400 font-heading drop-shadow-md">🔥 {current}</p>
                    <p className="text-zinc-400 text-xs mt-1 uppercase tracking-wider font-medium">Current Streak</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-purple-400 font-heading drop-shadow-md">⚡ {max}</p>
                    <p className="text-zinc-400 text-xs mt-1 uppercase tracking-wider font-medium">Best Streak</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white font-heading drop-shadow-md">{consistencyScore}%</p>
                    <p className="text-zinc-400 text-xs mt-1 uppercase tracking-wider font-medium">Consistency</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white font-heading drop-shadow-md">{allDays.length}</p>
                    <p className="text-zinc-400 text-xs mt-1 uppercase tracking-wider font-medium">Total Active Days</p>
                </div>
            </section>

            {/* Calendar Heatmap */}
            <section className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" /> 365-Day Activity
                </h3>
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-1.5" style={{ minWidth: '800px' }}>
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-1.5">
                                {week.map((day, dIdx) => (
                                    <div
                                        key={`${wIdx}-${dIdx}`}
                                        className={`w-3.5 h-3.5 rounded-sm ${getColor(day.count)} transition-all duration-300 hover:scale-125 hover:shadow-[0_0_10px_currentColor] cursor-pointer`}
                                        title={`${day.date.toLocaleDateString()}: ${day.count} msgs`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3 text-[10px] text-zinc-500 items-center mt-4 border-t border-white/5 pt-3">
                    <span className="uppercase tracking-widest font-medium">Less</span>
                    <div className="w-3.5 h-3.5 bg-zinc-800/50 rounded-sm border border-white/5" />
                    <div className="w-3.5 h-3.5 bg-purple-900/40 rounded-sm" />
                    <div className="w-3.5 h-3.5 bg-purple-700/60 rounded-sm" />
                    <div className="w-3.5 h-3.5 bg-purple-500/80 rounded-sm" />
                    <div className="w-3.5 h-3.5 bg-purple-400 rounded-sm shadow-[0_0_8px_rgba(192,132,252,0.5)]" />
                    <span className="uppercase tracking-widest font-medium">More</span>
                </div>
            </section>

            {/* All Streaks */}
            <section className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" /> Notable Streaks (3+ days)
                </h3>
                {sortedStreaks.length === 0 ? (
                    <p className="text-zinc-500 italic text-center py-8">No streaks of 3+ days found yet. Keep chatting!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sortedStreaks.map((streak, i) => (
                            <div
                                key={streak.start}
                                className={`flex justify-between items-center bg-black/20 rounded-xl p-4 border border-white/5 transition-all hover:bg-white/5 ${i === 0 ? 'border-purple-500/30 bg-purple-500/5' : ''}`}
                            >
                                <span className="text-zinc-400 text-sm font-medium">
                                    {new Date(streak.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                    <span className="mx-2 text-zinc-600">→</span>
                                    {new Date(streak.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                </span>
                                <span className={`font-mono font-bold ${i === 0 ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-zinc-300'}`}>
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
