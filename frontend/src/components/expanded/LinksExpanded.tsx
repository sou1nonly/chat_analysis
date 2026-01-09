"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Link2, ExternalLink, Globe } from "lucide-react";

interface Props {
    onClose: () => void;
}

export default function LinksExpanded({ onClose }: Props) {
    const { stats } = useOrbitStore();
    if (!stats || !stats.links) return null;

    const links = stats.links;
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
            // Invalid URL
        }
    });

    const sortedDomains = Object.entries(domainCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10);

    return (
        <div className="space-y-8">
            {/* Stats Summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white font-heading">{links.length}</p>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-2">Unique Links</p>
                </div>
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-blue-400 font-heading">{totalLinks}</p>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-2">Total Shared</p>
                </div>
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-pink-400" />
                        <span className="text-lg font-bold text-white truncate max-w-[150px]">{sortedDomains[0]?.[0] || "-"}</span>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Top Domain</p>
                </div>
            </section>

            {/* Domain Breakdown */}
            <section className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full" /> Top Domains
                </h3>
                <div className="space-y-4">
                    {sortedDomains.map(([domain, data], i) => (
                        <div key={domain} className="group">
                            <div className="flex justify-between items-end mb-2 px-1">
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{domain}</span>
                                <span className="text-xs font-mono text-zinc-500 group-hover:text-blue-300 transition-colors">{data.count} links</span>
                            </div>
                            <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500"
                                    style={{ width: `${(data.count / sortedDomains[0][1].count) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Full Link List */}
            <section className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col h-[500px]">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2 flex-shrink-0">
                    <span className="w-1 h-6 bg-pink-500 rounded-full" /> Link Archive
                </h3>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid gap-2">
                        {links.map((link, i) => (
                            <a
                                key={link.url + i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5 hover:bg-white/5 hover:border-pink-500/30 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-pink-500/20 transition-colors">
                                    <Link2 className="w-4 h-4 text-zinc-400 group-hover:text-pink-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-300 truncate group-hover:text-pink-300 transition-colors">{link.url}</p>
                                    <p className="text-[10px] text-zinc-600 mt-0.5 group-hover:text-zinc-500">
                                        Shared {link.count} times
                                    </p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
