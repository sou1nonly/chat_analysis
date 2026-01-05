"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

interface Props {
    onClose: () => void;
}

export default function EngagementExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.participants) return null;

    const people = Object.entries(stats.participants).map(([name, data]) => ({
        name,
        count: data.count,
        avgLength: data.avgLength,
        replyTime: data.replyTime || 0,
        doubleTexts: data.doubleTextCount || 0
    }));

    const total = people.reduce((a, p) => a + p.count, 0);
    const p1 = people[0];
    const p2 = people[1];

    // Calculate who is "more invested"
    const p1Investment = (p1?.count || 0) + (p1?.doubleTexts || 0) * 2;
    const p2Investment = (p2?.count || 0) + (p2?.doubleTexts || 0) * 2;

    return (
        <div className="space-y-8">
            {/* Comparison Table */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4">Head-to-Head Comparison</h3>
                <div className="bg-zinc-800/30 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-700">
                                <th className="p-4 text-left text-zinc-500">Metric</th>
                                <th className="p-4 text-center text-blue-400">{p1?.name || "Person 1"}</th>
                                <th className="p-4 text-center text-pink-400">{p2?.name || "Person 2"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-zinc-800">
                                <td className="p-4 text-zinc-400">Total Messages</td>
                                <td className="p-4 text-center text-white font-bold">{p1?.count.toLocaleString()}</td>
                                <td className="p-4 text-center text-white font-bold">{p2?.count?.toLocaleString()}</td>
                            </tr>
                            <tr className="border-b border-zinc-800">
                                <td className="p-4 text-zinc-400">Avg Message Length</td>
                                <td className="p-4 text-center text-white">{p1?.avgLength} chars</td>
                                <td className="p-4 text-center text-white">{p2?.avgLength} chars</td>
                            </tr>
                            <tr className="border-b border-zinc-800">
                                <td className="p-4 text-zinc-400">Avg Reply Time</td>
                                <td className="p-4 text-center text-white">{p1?.replyTime}m</td>
                                <td className="p-4 text-center text-white">{p2?.replyTime}m</td>
                            </tr>
                            <tr className="border-b border-zinc-800">
                                <td className="p-4 text-zinc-400">Double Texts</td>
                                <td className="p-4 text-center text-white">{p1?.doubleTexts}</td>
                                <td className="p-4 text-center text-white">{p2?.doubleTexts}</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-zinc-400">Share of Convo</td>
                                <td className="p-4 text-center text-blue-400 font-bold">
                                    {((p1?.count / total) * 100).toFixed(1)}%
                                </td>
                                <td className="p-4 text-center text-pink-400 font-bold">
                                    {((p2?.count / total) * 100).toFixed(1)}%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Visual Balance */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">💬 Message Volume</p>
                    <div className="h-8 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(p1?.count / total) * 100}%` }}
                        />
                        <div
                            className="h-full bg-pink-500"
                            style={{ width: `${(p2?.count / total) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                        <span className="text-blue-400">{p1?.name}</span>
                        <span className="text-pink-400">{p2?.name}</span>
                    </div>
                </div>

                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">💕 Investment Score</p>
                    <p className="text-white text-2xl font-bold font-heading">
                        {p1Investment > p2Investment ? p1?.name : p2?.name} is more invested
                    </p>
                    <p className="text-zinc-500 text-sm mt-2">
                        Based on message count + double text frequency
                    </p>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{total.toLocaleString()}</p>
                    <p className="text-zinc-500 text-xs">Total Messages</p>
                </div>
                <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white font-heading">
                        {(p1?.count / p2?.count || 0).toFixed(2)}x
                    </p>
                    <p className="text-zinc-500 text-xs">Ratio ({p1?.name?.slice(0, 6)})</p>
                </div>
                <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white font-heading">
                        {(p1?.doubleTexts + p2?.doubleTexts)}
                    </p>
                    <p className="text-zinc-500 text-xs">Total Double Texts</p>
                </div>
            </section>
        </div>
    );
}
