"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Brain, ArrowRight, Loader2, Sparkles, CheckCircle, Globe, List } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResearchAgentPage() {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [researchData, setResearchData] = useState<any>(null);
    const [instructions, setInstructions] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setResearchData(null);
        setInstructions(null);

        try {
            const response = await fetch("/api/research-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error + (data.details ? ": " + data.details : ""));
            } else {
                setResearchData(data.research_context);
                setInstructions(data.instructions);
                // Save to localStorage for next agent
                localStorage.setItem("research_instructions", JSON.stringify(data.instructions));
                localStorage.setItem("research_topic", topic);
            }
        } catch (err: any) {
            console.error(err);
            setError("Connectivity issue or server error. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        router.push("/writing-agent");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 font-outfit">

            {/* 🟢 HERO & SEARCH SECTION */}
            <section className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-400 uppercase tracking-widest">
                        <Brain className="w-4 h-4" />
                        <span>Agent 01: Deep Intelligence Research</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 leading-tight">
                        Research <span className="text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">Agent.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                        Analyze global markets and generate data-driven instructions for the writing layer.
                    </p>
                </motion.div>

                {/* Search Input Box */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto relative z-20">
                    <form onSubmit={handleResearch} className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-500 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
                        <div className="relative flex items-center bg-slate-900/80 border border-white/10 rounded-[1.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ring-1 ring-white/5 focus-within:ring-cyan-500/50 transition-all">
                            <Search className="ml-5 w-7 h-7 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Enter topic to research..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 text-2xl px-5 py-4 font-semibold font-outfit"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !topic.trim()}
                                className="bg-white text-slate-950 hover:bg-cyan-500 hover:text-white px-10 py-4.5 rounded-[1.2rem] font-black transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 font-outfit tracking-tight flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "ANALYZE"}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-200 p-5 rounded-2xl text-center backdrop-blur-md">
                        <p className="font-bold underline mb-1">Research Error</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </motion.div>
                )}
            </section>

            {/* 🔴 RESULTS MODULE 🔴 */}
            <AnimatePresence mode="wait">
                {(researchData || instructions) && (
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Left Column: Research Engine Findings */}
                        <div className="lg:col-span-12 lg:col-start-1 bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden p-8 backdrop-blur-3xl space-y-12 shadow-2xl">

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Visual Context (Research) */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-3 text-cyan-400 font-bold tracking-widest text-sm uppercase">
                                        <Globe className="w-5 h-5" />
                                        <span>Global Context Insight</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 space-y-4">
                                            <h4 className="text-white font-bold flex items-center gap-2 underline underline-offset-4 decoration-cyan-500/30">Top Competitors</h4>
                                            <div className="space-y-3">
                                                {researchData.organic_results?.map((res: any, i: number) => (
                                                    <div key={i} className="text-sm text-slate-400 border-l-2 border-cyan-500/20 pl-4 py-1">
                                                        <p className="text-white font-medium line-clamp-1">{res.title}</p>
                                                        <p className="line-clamp-2 text-xs">{res.snippet}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 space-y-4">
                                            <h4 className="text-white font-bold flex items-center gap-2 underline underline-offset-4 decoration-purple-500/30">Target Keywords</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {researchData.related_searches?.map((kw: string, i: number) => (
                                                    <span key={i} className="bg-purple-500/10 text-purple-300 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                            <h4 className="text-white font-bold flex items-center gap-2 pt-4 underline underline-offset-4 decoration-emerald-500/30">User Questions</h4>
                                            <div className="space-y-2">
                                                {researchData.related_questions?.map((q: string, i: number) => (
                                                    <div key={i} className="text-xs text-slate-400 italic flex gap-2">
                                                        <span className="text-emerald-400">?</span> {q}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Agent Intelligence (Instruction JSON) */}
                                <div className="w-full md:w-[400px] space-y-6">
                                    <div className="bg-white/5 ring-1 ring-white/10 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                                            <Sparkles className="w-20 h-20 text-white" />
                                        </div>

                                        <div className="relative space-y-6">
                                            <div className="flex items-center gap-3 text-emerald-400 font-black tracking-widest text-sm uppercase">
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Agent Output Ready</span>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-2xl font-black text-white leading-tight">Research Analysis Complete.</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    Gemini 2.5 Flash has successfully mapped the intent and generated a blueprint for the writing agent.
                                                </p>
                                            </div>

                                            <div className="pt-6 border-t border-white/5">
                                                <button
                                                    onClick={nextStep}
                                                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-white hover:to-slate-100 text-slate-950 px-8 py-5 rounded-[1.2rem] font-black transition-all shadow-[0_20px_40px_rgba(6,182,212,0.3)] active:scale-95 flex items-center justify-center gap-4 group"
                                                >
                                                    TRIGGER WRITING AGENT
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Instruction Blueprint Preview */}
                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <div className="flex items-center gap-3 text-slate-500 font-bold tracking-widest text-xs uppercase">
                                    <List className="w-4 h-4" />
                                    <span>Instruction Blueprint (JSON)</span>
                                </div>
                                <pre className="bg-slate-950 p-8 rounded-3xl border border-white/5 text-cyan-400 text-sm font-mono overflow-x-auto selection:bg-cyan-500 selection:text-white">
                                    {JSON.stringify(instructions, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* 🔴 EMPTY STATE 🔴 */}
            {!researchData && !loading && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-center mt-32 space-y-6 pb-24"
                >
                    <div className="inline-block p-8 rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl">
                        <Search className="w-12 h-12 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Waiting for search input</p>
                        <p className="text-slate-600 text-sm max-w-xs mx-auto">Enter a topic above to initiate the research phase and map competitor data.</p>
                    </div>
                </motion.div>
            )}

        </div>
    );
}
