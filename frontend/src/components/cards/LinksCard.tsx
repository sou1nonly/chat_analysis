"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { ExternalLink } from "lucide-react";
import ExpandedModal from "@/components/ui/ExpandedModal";
import LinksExpanded from "@/components/expanded/LinksExpanded";

export default function LinksCard() {
    const { stats, setActiveCard } = useOrbitStore();

    if (!stats) return null;

    const links = stats.links; // { url: string, count: number }[]

    return (
        <div
            onClick={() => setActiveCard('links')}
            className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 h-full cursor-pointer hover:border-zinc-700 transition-colors group"
        >
            {/* Expand Hint */}
            <div className="absolute top-4 right-4 text-[9px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Click for full archive →
            </div>

            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Shared Links</h3>

            <div className="space-y-3">
                {links.slice(0, 5).map((link, i) => {
                    let displayUrl = link.url;
                    try {
                        displayUrl = new URL(link.url).hostname.replace('www.', '');
                    } catch { }

                    return (
                        <div key={i} className="flex justify-between items-center text-sm group/link">
                            <div className="flex items-center gap-2 truncate flex-1">
                                <ExternalLink className="w-3 h-3 text-zinc-600" />
                                <span className="text-zinc-400 truncate">{displayUrl}</span>
                            </div>
                            <span className="text-zinc-600 text-xs font-mono">{link.count}x</span>
                        </div>
                    );
                })}
            </div>

            {links.length > 5 && (
                <p className="text-zinc-600 text-xs mt-4">+{links.length - 5} more links</p>
            )}
        </div>
    );
}
