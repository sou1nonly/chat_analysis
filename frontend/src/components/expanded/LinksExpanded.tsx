"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

interface Props {
    onClose: () => void;
}

export default function LinksExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.links) return null;

    const links = stats.links; // { url: string, count: number }[]
    const totalLinks = links.reduce((a, l) => a + l.count, 0);

    // Group by domain
    const domainCounts: Record<string, { count: number; urls: string[] }> = {};
    links.forEach(link => {
        try {
            const domain = new URL(link.url).hostname.replace('www.', '');
            if (!domainCounts[domain]) {
                domainCounts[domain] = { count: 0, urls: [] };
            }
            domainCounts[domain].count += link.count;
            domainCounts[domain].urls.push(link.url);
        } catch {
            // Invalid URL, skip
        }
    });

    const sortedDomains = Object.entries(domainCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10);

    return (
        <div className="space-y-8">
            {/* Summary */}
            <section className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{links.length}</p>
                    <p className="text-zinc-500 text-xs">Unique Links</p>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{totalLinks}</p>
                    <p className="text-zinc-500 text-xs">Times Shared</p>
                </div>
                <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50 text-center">
                    <p className="text-3xl font-bold text-blue-400 font-heading">{sortedDomains[0]?.[0] || "N/A"}</p>
                    <p className="text-zinc-500 text-xs">Top Domain</p>
                </div>
            </section>

            {/* Domain Breakdown */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4">By Domain</h3>
                <div className="space-y-3">
                    {sortedDomains.map(([domain, data], i) => (
                        <div key={domain} className="flex items-center gap-4">
                            <span className="w-40 text-sm text-zinc-400 truncate">{domain}</span>
                            <div className="flex-1 h-6 bg-zinc-800 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                                    style={{ width: `${(data.count / sortedDomains[0][1].count) * 100}%` }}
                                />
                            </div>
                            <span className="w-16 text-right text-sm text-zinc-300 font-mono">
                                {data.count}x
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Full Link List */}
            <section>
                <h3 className="text-white font-bold text-lg mb-4">All Links</h3>
                <div className="bg-zinc-800/30 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-zinc-900">
                            <tr className="border-b border-zinc-700">
                                <th className="p-3 text-left text-zinc-500">#</th>
                                <th className="p-3 text-left text-zinc-500">URL</th>
                                <th className="p-3 text-right text-zinc-500">Times</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map((link, i) => (
                                <tr key={link.url} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="p-3 text-zinc-600">{i + 1}</td>
                                    <td className="p-3">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline truncate block max-w-[400px]"
                                        >
                                            {link.url}
                                        </a>
                                    </td>
                                    <td className="p-3 text-right font-mono text-zinc-300">{link.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
