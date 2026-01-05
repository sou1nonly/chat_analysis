"use client";

import { clsx } from "clsx";

export default function RhythmCard() {
    const isNightOwl = true;
    const percentage = 78;

    return (
        <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative group">
            {/* Top Half: Day */}
            <div className="flex-1 bg-gradient-energy flex items-center justify-center relative p-6">
                <span className="text-white/20 font-heading font-bold text-6xl absolute top-4 right-4">DAY</span>
                <div className={clsx("transition-opacity duration-500 text-center", isNightOwl ? "opacity-30" : "opacity-100")}>
                    <p className="text-white font-bold text-lg">22%</p>
                    <p className="text-white/70 text-sm">Sunlight Texts</p>
                </div>
            </div>

            {/* Bottom Half: Night */}
            <div className="flex-1 bg-gradient-deep flex items-center justify-center relative p-6">
                <span className="text-white/20 font-heading font-bold text-6xl absolute bottom-4 left-4">NIGHT</span>
                <div className={clsx("transition-opacity duration-500 text-center", isNightOwl ? "opacity-100 scale-110" : "opacity-30")}>
                    <p className="text-white font-bold text-4xl">{percentage}%</p>
                    <p className="text-white/70 text-sm">After Sunset</p>
                </div>
            </div>

            {/* Overlay Insight */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full shadow-lg transform group-hover:scale-105 transition-transform">
                    <p className="text-white font-heading font-bold text-xl uppercase tracking-widest">
                        You are {isNightOwl ? "Vampires" : "Early Birds"}
                    </p>
                </div>
            </div>
        </div>
    );
}
