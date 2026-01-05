"use client";

import { useState } from "react";
import FileDrop from "@/components/ui/FileDrop";
import ProgressBar from "@/components/ui/ProgressBar";
import { useOrbitStore } from "@/store/useOrbitStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Home() {
  const { status, progress, setStatus, setProgress, setStats, setUploadId } = useOrbitStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setStatus("parsing", "Uploading file...");
    setProgress(10);

    try {
      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setProgress((prev: number) => Math.min(prev + 5, 80));
      }, 300);

      // Upload to backend
      const response = await api.uploadFile(file);

      clearInterval(progressInterval);
      setProgress(90);

      // Store stats and upload ID
      // Convert date strings to Date objects for compatibility
      const stats = {
        ...response.stats,
        startDate: new Date(response.stats.startDate),
        endDate: new Date(response.stats.endDate),
      };

      setStats(stats);
      setUploadId(response.upload_id);
      setStatus("complete", "Analysis complete.");
      setProgress(100);

      // Navigate to report
      setTimeout(() => {
        router.push("/report");
      }, 1000);

    } catch (err: any) {
      setStatus("error", err.message || "Failed to process file");
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600">
            Orbit.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light tracking-wide">
            The Relationship Zine
          </p>
        </div>

        {status === "idle" && <FileDrop onFileSelect={handleFileUpload} />}

        {(status === "parsing" || status === "cleaning" || status === "analyzing") && (
          <ProgressBar progress={progress} status={status} />
        )}

        {status === "complete" && (
          <div className="text-white animate-pulse">
            <p className="text-2xl font-heading">Complete!</p>
            <p className="text-zinc-400">Opening your zine...</p>
          </div>
        )}

        {status === "error" && error && (
          <div className="text-red-400 space-y-4">
            <p className="text-xl">Something went wrong</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setStatus("idle", null)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
