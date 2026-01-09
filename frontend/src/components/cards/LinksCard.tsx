"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Link2, ExternalLink } from "lucide-react";

export default function LinksCard() {
    const { stats, setActiveCard } = useOrbitStore();

    if (!stats) return null;

    const links = stats.links;

    return (
        <div className="h-full flex flex-col min-h-[220px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Link2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Shared Links</h3>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">{links.length} Total</p>
                    </div>
                </div>
            </div>

            {/* Links List */}
            <div className="space-y-2 flex-1 overflow-hidden">
                {links.slice(0, 5).map((link, i) => {
                    let displayUrl = link.url;
                    try {
                        displayUrl = new URL(link.url).hostname.replace('www.', '');
                    } catch { }

                    return (
                        <div
                            key={i}
                            className="flex justify-between items-center text-xs py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                        >
                            <div className="flex items-center gap-2 truncate flex-1">
                                <ExternalLink className="w-3 h-3 text-gray-500 shrink-0" />
                                <span className="text-gray-400 truncate">{displayUrl}</span>
                            </div>
                            <span className="text-blue-400 font-medium shrink-0 ml-2">{link.count}×</span>
                        </div>
                    );
                })}
            </div>

            {links.length > 5 && (
                <p className="text-[9px] text-gray-500 mt-2 text-center">
                    +{links.length - 5} more
                </p>
            )}
        </div>
    );
}
