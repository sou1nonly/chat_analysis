"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Sun, Moon } from "lucide-react";

export default function RhythmCard() {
    const { stats } = useOrbitStore();

    if (!stats) return null;

    // Calculate day vs night from hourlyActivity (0-23 hours)
    const hourly = stats.hourlyActivity || new Array(24).fill(0);

    const dayMessages = hourly.slice(6, 18).reduce((a, b) => a + b, 0);
    const nightMessages = hourly.slice(18).reduce((a, b) => a + b, 0) + hourly.slice(0, 6).reduce((a, b) => a + b, 0);
    const totalMessages = dayMessages + nightMessages || 1;

    const dayPercent = Math.round((dayMessages / totalMessages) * 100);
    const nightPercent = Math.round((nightMessages / totalMessages) * 100);
    const isNightOwl = nightPercent >= dayPercent;

    return (
        <div className="h-full flex flex-col min-h-[200px] relative overflow-hidden rounded-xl">
            {/* SVG Filter for Liquid Glass Distortion */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="liquid-glass-distortion">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="3" result="noise" seed="5" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            {/* Background Scene */}
            {isNightOwl ? (
                // Night Scene
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#141432] to-[#1a1a4a]">
                    {/* Stars */}
                    {[...Array(35)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                width: `${1 + Math.random() * 2}px`,
                                height: `${1 + Math.random() * 2}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 55}%`,
                                opacity: 0.3 + Math.random() * 0.7,
                                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 3}s`,
                            }}
                        />
                    ))}

                    {/* Shooting Star */}
                    <div
                        className="absolute w-16 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                        style={{
                            top: '15%',
                            right: '15%',
                            transform: 'rotate(-35deg)',
                            animation: 'shootingStar 5s ease-in-out infinite',
                        }}
                    />

                    {/* Crescent Moon - CENTER position */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%]">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            <div className="absolute -right-1.5 top-0 w-6 h-7 rounded-full bg-[#141432]" />
                        </div>
                    </div>

                    {/* Hills */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1e1e4a] rounded-t-[100%]" style={{ transform: 'scaleX(1.5)' }} />
                        <div className="absolute bottom-0 left-[-20%] right-0 h-8 bg-[#252560] rounded-t-[100%]" style={{ transform: 'scaleX(1.3)' }} />
                        <div className="absolute bottom-0 left-0 right-[-10%] h-5 bg-[#2d2d70]" style={{ borderRadius: '50% 50% 0 0' }} />

                        {/* Trees */}
                        <div className="absolute bottom-5 left-3 flex gap-0.5">
                            <div className="w-0 h-0 border-l-[2px] border-r-[2px] border-b-[8px] border-transparent border-b-[#1a1a40]" />
                            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[10px] border-transparent border-b-[#1a1a40]" />
                        </div>
                        <div className="absolute bottom-4 right-6 flex gap-0.5">
                            <div className="w-0 h-0 border-l-[2px] border-r-[2px] border-b-[6px] border-transparent border-b-[#202050]" />
                        </div>
                    </div>
                </div>
            ) : (
                // Day Scene
                <div className="absolute inset-0 bg-gradient-to-b from-[#4FC3F7] via-[#81D4FA] to-[#B3E5FC]">
                    {/* Sun - CENTER position */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_0_30px_rgba(255,235,59,0.6)]" />
                    </div>

                    {/* Clouds */}
                    <div className="absolute top-4 left-3 flex">
                        <div className="w-6 h-3 bg-white/80 rounded-full" />
                        <div className="w-4 h-3 bg-white/80 rounded-full -ml-2 -mt-0.5" />
                        <div className="w-3 h-2 bg-white/80 rounded-full -ml-1" />
                    </div>
                    <div className="absolute top-6 right-4 flex">
                        <div className="w-4 h-2 bg-white/60 rounded-full" />
                        <div className="w-3 h-2 bg-white/60 rounded-full -ml-1.5" />
                    </div>

                    {/* Hills */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <div className="absolute bottom-0 left-[-10%] w-[60%] h-10 bg-[#7CB9E0] rounded-t-[60%]" />
                        <div className="absolute bottom-0 right-[-20%] w-[80%] h-8 bg-[#66BB6A] rounded-t-[50%]" />
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#4CAF50]" style={{ borderRadius: '40% 60% 0 0' }} />

                        {/* Trees */}
                        <div className="absolute bottom-4 left-4 flex gap-0.5">
                            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[10px] border-transparent border-b-[#2E7D32]" />
                            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[12px] border-transparent border-b-[#388E3C]" />
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-3 pt-2">

                {/* Stats Row - pushed to top */}
                <div className="flex items-center justify-center gap-5 w-full">
                    {/* Day */}
                    <div className={`flex flex-col items-center transition-all duration-500 ${!isNightOwl ? "scale-105" : "opacity-50 scale-90"}`}>
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{
                                background: !isNightOwl
                                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))'
                                    : 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: !isNightOwl
                                    ? '0 4px 15px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                    : 'inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}
                        >
                            <Sun className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold mt-1.5 text-white drop-shadow-lg">
                            {dayPercent}%
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-white/60">Day</span>
                    </div>

                    {/* Night */}
                    <div className={`flex flex-col items-center transition-all duration-500 ${isNightOwl ? "scale-105" : "opacity-50 scale-90"}`}>
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{
                                background: isNightOwl
                                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.2))'
                                    : 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: isNightOwl
                                    ? '0 4px 15px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                    : 'inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}
                        >
                            <Moon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold mt-1.5 text-white drop-shadow-lg">
                            {nightPercent}%
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-white/60">Night</span>
                    </div>
                </div>

                {/* Apple Liquid Glass Pill - 20% larger, moved up */}
                <div className="relative mb-4">
                    {/* Liquid Glass Effect Layers */}
                    <div
                        className="relative px-6 py-2.5 rounded-full overflow-hidden cursor-pointer transition-all duration-400"
                        style={{
                            boxShadow: '0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)',
                            transform: 'scale(1)',
                        }}
                    >
                        {/* Glass Distortion Layer */}
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{
                                backdropFilter: 'blur(4px)',
                                WebkitBackdropFilter: 'blur(4px)',
                                filter: 'url(#liquid-glass-distortion)',
                            }}
                        />

                        {/* Tint Layer */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                            }}
                        />

                        {/* Shine Layer - inner border glow */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                boxShadow: 'inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.3)',
                            }}
                        />

                        {/* Content */}
                        <span className="relative z-10 font-semibold text-base text-white tracking-wide flex items-center gap-2 drop-shadow-sm">
                            {isNightOwl ? (
                                <><Moon className="w-4 h-4" /> Night Owls</>
                            ) : (
                                <><Sun className="w-4 h-4" /> Early Birds</>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* CSS Keyframes */}
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes shootingStar {
                    0% { opacity: 0; transform: translateX(0) translateY(0) rotate(-35deg); }
                    10% { opacity: 0.6; }
                    25% { opacity: 0; transform: translateX(60px) translateY(40px) rotate(-35deg); }
                    100% { opacity: 0; transform: translateX(60px) translateY(40px) rotate(-35deg); }
                }
            `}</style>
        </div>
    );
}
