"use client";

import { clsx } from "clsx";

export default function RhythmCard() {
    const isNightOwl = true;
    const percentage = 78;

    return (
        <div className="w-full h-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative group font-sans">
            {/* Top Half: Day Section */}
            <div className="flex-1 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative p-6 transition-all duration-500 hover:flex-[1.1]">
                <span className="text-white/20 font-heading font-black text-6xl absolute top-4 right-4 rotate-[-5deg] pointer-events-none select-none">DAY</span>
                <div className={clsx("transition-all duration-500 text-center z-10", isNightOwl ? "opacity-40 scale-90 blur-[1px]" : "opacity-100 scale-110")}>
                    <p className="text-white font-black text-5xl drop-shadow-md">22<span className="text-3xl opacity-80">%</span></p>
                    <p className="text-white/90 text-xs font-bold uppercase tracking-widest mt-1">Sunlight Activity</p>
                </div>
            </div>

            {/* Bottom Half: Night Section */}
            <div className="flex-1 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative p-6 transition-all duration-500 hover:flex-[1.1]">
                <span className="text-white/10 font-heading font-black text-6xl absolute bottom-4 left-4 rotate-[5deg] pointer-events-none select-none">NIGHT</span>
                <div className={clsx("transition-all duration-500 text-center z-10", isNightOwl ? "opacity-100 scale-110" : "opacity-40 scale-90 blur-[1px]")}>
                    <p className="text-white font-black text-5xl drop-shadow-md lg:text-6xl text-glow-purple">{percentage}<span className="text-3xl opacity-80">%</span></p>
                    <p className="text-indigo-200/80 text-xs font-bold uppercase tracking-widest mt-1">After Sunset</p>
                </div>
            </div>

            {/* Verdict Badge - Centered pill, cleaner look */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-full flex justify-center">
                <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-300 pointer-events-auto">
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest text-center mb-0.5 leading-none">Verdict</p>
                    <div className="flex items-center gap-2 justify-center">
                        <span className={`font-heading font-black text-lg uppercase tracking-wider ${isNightOwl ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-amber-400'}`}>
                            {isNightOwl ? "Vampires" : "Early Birds"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
