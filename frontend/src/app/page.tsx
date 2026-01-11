"use client";

import FileDrop from "@/components/ui/FileDrop";
import ProgressBar from "@/components/ui/ProgressBar";
import ExportGuide from "@/components/ui/ExportGuide";
import { useOrbitStore } from "@/store/useOrbitStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";

export default function Home() {
  const { status, progress, stats } = useOrbitStore();
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (stats && status === "complete") {
      router.push("/report");
    }
  }, [stats, status, router]);

  useEffect(() => {
    switch (status) {
      case "parsing":
        setStatusMessage("Parsing your chat...");
        break;
      case "cleaning":
        setStatusMessage("Cleaning data...");
        break;
      case "analyzing":
        setStatusMessage("AI is thinking...");
        break;
      default:
        setStatusMessage("");
    }
  }, [status]);

  const isProcessing = status === "parsing" || status === "cleaning";

  const scrollToGuide = () => {
    document.getElementById('export-guide')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#050507] relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-2 tracking-tight">
            Orbit<span className="text-purple-400">.</span>
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">
            The Relationship Zine
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isProcessing ? (
            <ProgressBar progress={progress} status={statusMessage} />
          ) : (
            <FileDrop />
          )}
        </motion.div>

        {/* Platform Badges */}
        <motion.div
          className="flex items-center gap-6 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">WhatsApp</span>
            <span className="text-[10px] text-gray-600">(.txt)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="text-xs text-gray-500">Instagram</span>
            <span className="text-[10px] text-gray-600">(.json)</span>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToGuide}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-[10px] uppercase tracking-widest">Need help exporting?</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.button>
      </section>

      {/* Export Guide Section */}
      <section id="export-guide" className="py-20 px-4 relative">
        {/* Subtle gradient separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <ExportGuide />
      </section>

      {/* Footer */}
      <footer className="py-8 flex items-center justify-center gap-1 text-[10px] text-gray-600 border-t border-white/5">
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>AI-powered insights</span>
      </footer>
    </main>
  );
}
