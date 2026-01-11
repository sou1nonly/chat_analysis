"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const whatsappSteps = [
    { step: 1, title: "Open Chat Menu", desc: "Tap the ⋮ menu in the top-right corner of the chat" },
    { step: 2, title: "Select Export", desc: "Choose 'More' → 'Export Chat' from the menu" },
    { step: 3, title: "Without Media", desc: "Select 'Without Media' to get a .txt file" },
];

const instagramSteps = [
    { step: 1, title: "Your Activity", desc: "Go to Profile → Settings → Your Activity" },
    { step: 2, title: "Download Data", desc: "Select 'Download Your Information' → Check 'Messages'" },
    { step: 3, title: "Choose JSON", desc: "Select JSON format → Create Files → Download ZIP" },
];

export default function ExportGuide() {
    const [activeTab, setActiveTab] = useState<"whatsapp" | "instagram">("whatsapp");

    const steps = activeTab === "whatsapp" ? whatsappSteps : instagramSteps;
    const guideImage = activeTab === "whatsapp" ? "/guides/whatsapp-export.png" : "/guides/instagram-export.png";
    const accentColor = activeTab === "whatsapp" ? "from-green-500 to-emerald-600" : "from-pink-500 to-purple-600";
    const bgAccent = activeTab === "whatsapp" ? "bg-green-500/10" : "bg-pink-500/10";

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-white mb-2">
                    How to Export Your Chat
                </h2>
                <p className="text-gray-500 text-sm">
                    Follow these simple steps to download your chat history
                </p>
            </div>

            {/* Platform Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setActiveTab("whatsapp")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer ${activeTab === "whatsapp"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                            : "bg-zinc-800/50 text-gray-400 hover:bg-zinc-700/50 hover:text-white"
                        }`}
                >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    WhatsApp
                </button>
                <button
                    onClick={() => setActiveTab("instagram")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer ${activeTab === "instagram"
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25"
                            : "bg-zinc-800/50 text-gray-400 hover:bg-zinc-700/50 hover:text-white"
                        }`}
                >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    Instagram
                </button>
            </div>

            {/* Guide Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Visual Guide Image */}
                    <div className={`relative rounded-2xl overflow-hidden border border-white/5 ${bgAccent}`}>
                        <Image
                            src={guideImage}
                            alt={`${activeTab} export guide`}
                            width={900}
                            height={500}
                            className="w-full h-auto"
                            priority
                        />
                    </div>

                    {/* Step Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {steps.map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative p-4 rounded-xl bg-zinc-900/50 border border-white/5 group hover:border-white/10 transition-colors cursor-pointer"
                            >
                                {/* Step Number */}
                                <div className={`absolute -top-3 -left-2 w-7 h-7 rounded-full bg-gradient-to-r ${accentColor} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                                    {item.step}
                                </div>

                                <div className="pt-2">
                                    <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
                                        {item.title}
                                        <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                                    </h3>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pro Tips */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-purple-300 text-sm font-medium mb-1">Pro Tip</p>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                {activeTab === "whatsapp"
                                    ? "Export without media to get a smaller .txt file. Limited to 40,000 messages per export."
                                    : "Choose JSON format for best results. Your messages will be in the 'inbox' folder inside the downloaded ZIP file."
                                }
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
