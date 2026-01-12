"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Monitor, Sparkles, Zap, Shield, Clock, ChevronDown, Cpu, HardDrive, AlertCircle, Download, Terminal } from "lucide-react";
import { useOrbitStore } from "@/store/useOrbitStore";
import api from "@/lib/api";

interface OfflineModel {
    id: string;
    name: string;
    size: string;
    ram: string;
    gpu: string;
    speed: string;
    description: string;
    installed?: boolean;
}

// Full list of offline models with descriptions and speeds
const offlineModelDetails: Record<string, { size: string; speed: string; description: string }> = {
    'qwen2.5:0.5b': { size: '0.5B', speed: '~8-15 min', description: 'Basic quality, may miss context' },
    'qwen2.5:3b': { size: '3B', speed: '~10-20 min', description: 'Moderate quality, slower' },
    'llama3.2:8b': { size: '8B', speed: '~15-30 min', description: 'Better quality, needs good GPU' },
    'deepseek-r1:14b': { size: '14B', speed: '~20-40 min', description: 'Best local quality, very slow' },
};

// RAM-based recommendations
const getRecommendedModel = (ramGB: number): string => {
    if (ramGB >= 16) return 'deepseek-r1:14b';
    if (ramGB >= 8) return 'llama3.2:8b';
    if (ramGB >= 4) return 'qwen2.5:3b';
    return 'qwen2.5:0.5b';
};

export default function ModelSelector() {
    const {
        aiModelType,
        setAiModelType,
        startAiAnalysis,
        selectedOfflineModel,
        setSelectedOfflineModel,
        stats
    } = useOrbitStore();

    const [showOfflineDropdown, setShowOfflineDropdown] = useState(false);
    const [availableModels, setAvailableModels] = useState<OfflineModel[]>([]);
    const [ollamaRunning, setOllamaRunning] = useState<boolean | null>(null); // null = checking
    const [rateLimited, setRateLimited] = useState<boolean>(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [installedCount, setInstalledCount] = useState(0);
    const [statusChecking, setStatusChecking] = useState(false);

    // Check Ollama status on mount
    useEffect(() => {
        checkOllamaStatus();
    }, []);

    // Fetch available models when offline is selected
    useEffect(() => {
        if (aiModelType === 'offline') {
            fetchAvailableModels();
        }
    }, [aiModelType]);

    const checkOllamaStatus = async () => {
        setStatusChecking(true);
        try {
            const preflight = await api.preflight('cloud');
            setOllamaRunning(preflight.ollama_running);
            setRateLimited(preflight.rate_limited);
        } catch (error) {
            setOllamaRunning(false);
            setRateLimited(false);
        } finally {
            setStatusChecking(false);
        }
    };

    const fetchAvailableModels = async () => {
        setLoadingModels(true);
        try {
            const response = await api.getAvailableModels();
            setOllamaRunning(response.ollama_running);
            setInstalledCount(response.installed_count);

            // Merge API response with full details
            const models: OfflineModel[] = response.models.map(m => ({
                id: m.id,
                name: m.name,
                ram: m.ram,
                gpu: m.gpu,
                installed: m.installed,
                ...offlineModelDetails[m.id]
            }));

            setAvailableModels(models);

            // Auto-select first installed model if current selection isn't installed
            const installedModels = models.filter(m => m.installed);
            if (installedModels.length > 0) {
                const currentlySelectedInstalled = installedModels.find(m => m.id === selectedOfflineModel);
                if (!currentlySelectedInstalled) {
                    setSelectedOfflineModel(installedModels[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
            setOllamaRunning(false);
        } finally {
            setLoadingModels(false);
        }
    };

    // Find the selected model object
    const selectedModel = availableModels.find(m => m.id === selectedOfflineModel) || availableModels[0];
    const installedModels = availableModels.filter(m => m.installed);
    const notInstalledModels = availableModels.filter(m => !m.installed);

    const estimatedTime = stats?.totalMessages
        ? Math.round(30 + (stats.totalMessages / 1000) * 15)
        : 45;

    // Can only start if cloud OR (offline with installed model)
    const canStartAnalysis = aiModelType === 'cloud' || (aiModelType === 'offline' && installedCount > 0 && selectedModel?.installed);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0A0A0B]/80 to-[#111114]/80 backdrop-blur-xl p-5"
        >
            {/* Compact Header */}
            <div className="text-center mb-3">
                <h2 className="text-base font-bold text-white">Choose AI Model</h2>
                <p className="text-zinc-500 text-xs">Select how to analyze your chat</p>

                {/* Ollama Status Banner */}
                {ollamaRunning === false && (
                    <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-300">Ollama is not running</span>
                        </div>
                        <button
                            onClick={checkOllamaStatus}
                            disabled={statusChecking}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {statusChecking ? (
                                <Cpu className="w-3 h-3 animate-spin" />
                            ) : (
                                <Cpu className="w-3 h-3" />
                            )}
                            Recheck
                        </button>
                    </div>
                )}
                {ollamaRunning === true && rateLimited && (
                    <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-amber-300">Rate limit reached. Please wait or upgrade.</span>
                        </div>
                        <button
                            onClick={checkOllamaStatus}
                            disabled={statusChecking}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {statusChecking ? (
                                <Cpu className="w-3 h-3 animate-spin" />
                            ) : (
                                <Cpu className="w-3 h-3" />
                            )}
                            Recheck
                        </button>
                    </div>
                )}
                {ollamaRunning === true && !rateLimited && (
                    <div className="mt-3 flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-300">Ollama connected • Ready</span>
                    </div>
                )}
                {ollamaRunning === null && (
                    <div className="mt-3 flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-500/10 border border-zinc-500/30">
                        <Cpu className="w-3 h-3 text-zinc-400 animate-spin" />
                        <span className="text-xs text-zinc-400">Checking status...</span>
                    </div>
                )}
            </div>

            {/* Model Cards */}
            {/* Model Cards */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Cloud Option */}
                <motion.button
                    onClick={() => setAiModelType('cloud')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${aiModelType === 'cloud'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                >
                    {/* Recommended badge */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500 text-[8px] font-bold text-white rounded-full uppercase tracking-wider shadow-lg shadow-emerald-900/20">
                        Recommended
                    </div>

                    {aiModelType === 'cloud' && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-500 border-2 border-[#0A0A0B] flex items-center justify-center shadow-lg shadow-purple-500/20 z-10">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Icon + Name */}
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${aiModelType === 'cloud' ? 'bg-purple-500/20' : 'bg-zinc-700/50'}`}>
                                <Cloud className={`w-4.5 h-4.5 ${aiModelType === 'cloud' ? 'text-purple-400' : 'text-zinc-400'}`} />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <h3 className="text-sm font-semibold text-white leading-none">Cloud</h3>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-medium leading-none">deepseek-v3.1</p>
                            </div>
                        </div>
                        {/* Right: Details */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Zap className="w-3 h-3" />
                                <span>Fast</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 px-1.5 py-0.5">
                                <Clock className="w-3 h-3" />
                                <span>~1 min</span>
                            </div>
                        </div>
                    </div>
                </motion.button>

                {/* Offline Option */}
                <motion.button
                    onClick={() => setAiModelType('offline')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${aiModelType === 'offline'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                >
                    {aiModelType === 'offline' && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-500 border-2 border-[#0A0A0B] flex items-center justify-center shadow-lg shadow-purple-500/20 z-10">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Icon + Name */}
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${aiModelType === 'offline' ? 'bg-purple-500/20' : 'bg-zinc-700/50'}`}>
                                <Monitor className={`w-4.5 h-4.5 ${aiModelType === 'offline' ? 'text-purple-400' : 'text-zinc-400'}`} />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <h3 className="text-sm font-semibold text-white leading-none">Offline</h3>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-medium leading-none">Local Ollama</p>
                            </div>
                        </div>
                        {/* Right: Details */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium px-1.5 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/20">
                                <Shield className="w-3 h-3" />
                                <span>Private</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 px-1.5 py-0.5">
                                <Clock className="w-3 h-3" />
                                <span>10-15 min</span>
                            </div>
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Offline Model Selector (shown when offline selected) */}
            <AnimatePresence>
                {aiModelType === 'offline' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        {/* Loading state */}
                        {loadingModels && (
                            <div className="flex items-center justify-center py-4 text-zinc-400 text-sm">
                                <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full mr-2" />
                                Checking installed models...
                            </div>
                        )}

                        {/* Recommendation notice */}
                        {!loadingModels && (
                            <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 mb-3">
                                <div className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-blue-300">
                                            <span className="font-semibold">Tip:</span> Cloud is 10-20x faster with much higher accuracy.
                                            Local models may miss context and produce generic insights.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No models installed */}
                        {!loadingModels && ollamaRunning && installedCount === 0 && (
                            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                                <div className="flex items-start gap-3">
                                    <Download className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-400">No Models Installed</p>
                                        <p className="text-xs text-zinc-400 mt-1 mb-3">
                                            Install a model based on your system RAM:
                                        </p>
                                        <div className="space-y-2">
                                            {availableModels.map((model) => (
                                                <div key={model.id} className="flex items-center justify-between text-xs bg-black/20 rounded px-2 py-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <HardDrive className="w-3 h-3 text-zinc-500" />
                                                        <span className="text-zinc-300">{model.ram} RAM</span>
                                                        <span className="text-zinc-500">→</span>
                                                        <span className="text-white font-medium">{model.name}</span>
                                                    </div>
                                                    <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                                        ollama pull {model.id}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500">
                                            <Terminal className="w-3 h-3" />
                                            <span>Run the command in terminal, then refresh this page</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Models available */}
                        {!loadingModels && ollamaRunning && installedCount > 0 && (
                            <>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                                    Installed Models ({installedCount} available)
                                </p>

                                {/* Dropdown Trigger */}
                                <button
                                    onClick={() => setShowOfflineDropdown(!showOfflineDropdown)}
                                    className="w-full p-3 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Cpu className="w-4 h-4 text-purple-400" />
                                        <div className="text-left">
                                            <p className="text-sm text-white font-medium">{selectedModel?.name || 'Select model'}</p>
                                            <p className="text-[10px] text-zinc-500">
                                                RAM: {selectedModel?.ram || '-'} · GPU: {selectedModel?.gpu || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showOfflineDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {showOfflineDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="mt-2 rounded-lg border border-white/10 bg-[#1a1a1f] overflow-hidden"
                                        >
                                            {/* Installed models */}
                                            {installedModels.map((model) => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => {
                                                        setSelectedOfflineModel(model.id);
                                                        setShowOfflineDropdown(false);
                                                    }}
                                                    className={`w-full p-3 flex items-start gap-3 text-left hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 ${selectedOfflineModel === model.id ? 'bg-purple-500/10' : ''
                                                        }`}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm text-white font-medium">{model.name}</p>
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Ready</span>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">{model.description}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-400">
                                                            <span className="flex items-center gap-1">
                                                                <HardDrive className="w-3 h-3" /> {model.ram}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Cpu className="w-3 h-3" /> {model.gpu}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {model.speed}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedOfflineModel === model.id && (
                                                        <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}

                                            {/* Not installed models (grayed out) */}
                                            {notInstalledModels.length > 0 && (
                                                <>
                                                    <div className="px-3 py-2 text-[10px] text-zinc-600 uppercase tracking-wider bg-black/20">
                                                        Not Installed
                                                    </div>
                                                    {notInstalledModels.map((model) => (
                                                        <div
                                                            key={model.id}
                                                            className="w-full p-3 flex items-start gap-3 text-left border-b border-white/5 last:border-0 opacity-50"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm text-zinc-400 font-medium">{model.name}</p>
                                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">Not installed</span>
                                                                </div>
                                                                <p className="text-[10px] text-zinc-600 mt-0.5">
                                                                    Run: <code className="text-zinc-500">ollama pull {model.id}</code>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Estimated Time & Start Button */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] text-zinc-400">
                        ~{aiModelType === 'offline' && selectedModel ? selectedModel.speed?.replace('~', '') : `${estimatedTime}s`}
                    </span>
                </div>

                <motion.button
                    onClick={startAiAnalysis}
                    disabled={!canStartAnalysis}
                    whileHover={canStartAnalysis ? { scale: 1.02 } : {}}
                    whileTap={canStartAnalysis ? { scale: 0.98 } : {}}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${canStartAnalysis
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    {canStartAnalysis ? 'Start Analysis' : 'Install a model first'}
                </motion.button>
            </div>
        </motion.div>
    );
}
