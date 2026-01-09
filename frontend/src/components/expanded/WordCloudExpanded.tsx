"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

interface Props {
    onClose: () => void;
}

export default function WordCloudExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.wordCloud) return null;

    const words = stats.wordCloud;
    const totalWords = words.reduce((a, b) => a + b.value, 0);

    // Group by frequency tiers
    const highFreq = words.filter(w => w.value > 50);
    const medFreq = words.filter(w => w.value > 10 && w.value <= 50);
    const lowFreq = words.filter(w => w.value <= 10);

    return (
        <div className="space-y-8">
            {/* Stats Summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{words.length}</p>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-2">Unique Words</p>
                </div>
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-yellow-400 font-heading">{words[0]?.text}</p>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-2">Most Used</p>
                </div>
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{words[0]?.value}</p>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-2">Occurrences</p>
                </div>
            </section>

            {/* Word Table */}
            <section className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-yellow-500 rounded-full" /> Vocabulary Breakdown
                </h3>

                <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-[#0A0A0B] z-10 border-b border-white/10">
                                <tr>
                                    <th className="text-left p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-16">Rank</th>
                                    <th className="text-left p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Word</th>
                                    <th className="text-right p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Count</th>
                                    <th className="p-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider w-40">Frequency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {words.slice(0, 50).map((w, i) => (
                                    <tr key={w.text} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-zinc-500 font-mono text-xs">{i + 1}</td>
                                        <td className="p-4 text-white font-bold text-base group-hover:text-yellow-400 transition-colors">{w.text}</td>
                                        <td className="p-4 text-right font-mono text-zinc-300">{w.value.toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                                    style={{ width: `${(w.value / words[0].value) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
