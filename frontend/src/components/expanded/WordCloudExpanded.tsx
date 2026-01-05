"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

interface Props {
    onClose: () => void;
}

export default function WordCloudExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.wordCloud) return null;

    const words = stats.wordCloud; // { text: string, value: number }[]
    const totalWords = words.reduce((a, b) => a + b.value, 0);

    // Group by frequency tiers
    const highFreq = words.filter(w => w.value > 50);
    const medFreq = words.filter(w => w.value > 10 && w.value <= 50);
    const lowFreq = words.filter(w => w.value <= 10);

    return (
        <div className="space-y-8">
            {/* Summary Stats */}
            <section className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{words.length}</p>
                    <p className="text-zinc-500 text-xs">Unique Words</p>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-purple-400 font-heading">{words[0]?.text || "N/A"}</p>
                    <p className="text-zinc-500 text-xs">Top Word</p>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{words[0]?.value || 0}</p>
                    <p className="text-zinc-500 text-xs">Top Word Count</p>
                </div>
            </section>

            {/* Full Word Table */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4">All Words (Top 60)</h3>
                <div className="bg-zinc-800/30 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-zinc-500 border-b border-zinc-700">
                                <th className="text-left p-3">#</th>
                                <th className="text-left p-3">Word</th>
                                <th className="text-right p-3">Count</th>
                                <th className="text-right p-3">% of Total</th>
                                <th className="p-3 w-40">Distribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {words.slice(0, 30).map((w, i) => (
                                <tr key={w.text} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-3 text-zinc-600">{i + 1}</td>
                                    <td className="p-3 text-white font-medium">{w.text}</td>
                                    <td className="p-3 text-right font-mono text-zinc-300">{w.value.toLocaleString()}</td>
                                    <td className="p-3 text-right text-zinc-500">{((w.value / totalWords) * 100).toFixed(1)}%</td>
                                    <td className="p-3">
                                        <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                style={{ width: `${(w.value / words[0].value) * 100}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Frequency Tiers */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-900/20 rounded-2xl p-5 border border-purple-700/30">
                    <p className="text-purple-400 text-xs uppercase tracking-widest mb-2">High Frequency (50+)</p>
                    <p className="text-2xl font-bold text-white">{highFreq.length} words</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                        {highFreq.slice(0, 10).map(w => (
                            <span key={w.text} className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                {w.text}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="bg-blue-900/20 rounded-2xl p-5 border border-blue-700/30">
                    <p className="text-blue-400 text-xs uppercase tracking-widest mb-2">Medium Frequency (10-50)</p>
                    <p className="text-2xl font-bold text-white">{medFreq.length} words</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                        {medFreq.slice(0, 10).map(w => (
                            <span key={w.text} className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                                {w.text}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/30">
                    <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Low Frequency (&lt;10)</p>
                    <p className="text-2xl font-bold text-white">{lowFreq.length} words</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                        {lowFreq.slice(0, 10).map(w => (
                            <span key={w.text} className="text-[10px] bg-zinc-600/20 text-zinc-400 px-2 py-0.5 rounded">
                                {w.text}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
