"use client";

import { useOrbitStore } from "@/store/useOrbitStore";

export default function ReceiptCard() {
    const { stats } = useOrbitStore();

    if (!stats) return null;

    // Placeholder for real Topic Modeling (Layer 2 extension)
    // For MVP, we can reuse emojis or mock categories based on time
    const topics = [
        { name: "LATE NIGHTS", price: `${stats.hourlyActivity.slice(22).reduce((a, b) => a + b, 0) + stats.hourlyActivity.slice(0, 4).reduce((a, b) => a + b, 0)} msgs` },
        { name: "EARLY BIRDS", price: `${stats.hourlyActivity.slice(5, 9).reduce((a, b) => a + b, 0)} msgs` },
        { name: "TOP EMOJI", price: stats.topEmojis[0]?.emoji || "-" },
        { name: "RUNNER UP", price: stats.topEmojis[1]?.emoji || "-" },
        { name: "TOTAL QTY", price: stats.totalMessages.toLocaleString() },
    ];

    return (
        <div className="w-full bg-white text-zinc-900 p-8 font-mono shadow-2xl skew-y-1 relative mx-auto max-w-sm rotate-1 hover:rotate-0 transition-transform duration-300">
            {/* Jagged Top */}
            <div
                className="absolute top-[-10px] left-0 w-full h-[20px] bg-white"
                style={{
                    clipPath: "polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)"
                }}
            />

            <div className="text-center border-b-2 border-dashed border-zinc-900 pb-6 mb-6">
                <h2 className="text-3xl font-bold tracking-widest uppercase">RECEIPT</h2>
                <p className="text-xs mt-2">ORBIT RELATIONSHIP ZINE</p>
                <p className="text-xs">
                    {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="space-y-4 text-sm">
                {topics.map((item) => (
                    <div key={item.name} className="flex justify-between items-end border-b border-zinc-200 pb-1">
                        <span className="uppercase font-medium">{item.name}</span>
                        <span className="font-bold">{item.price}</span>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t-2 border-zinc-900 flex justify-between items-center">
                <span className="font-bold text-xl">TOTAL</span>
                <span className="font-bold text-xl">$0.00</span>
            </div>

            <div className="text-center mt-6 text-xs opacity-60">
                <p>THANK YOU FOR TEXTING</p>
                <p className="mt-2">ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>

            {/* Jagged Bottom */}
            <div
                className="absolute bottom-[-10px] left-0 w-full h-[20px] bg-white"
                style={{
                    clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"
                }}
            />
        </div>
    );
}
