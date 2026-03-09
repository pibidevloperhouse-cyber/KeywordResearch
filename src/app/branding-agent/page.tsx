"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Star, ArrowLeft, Loader2, BarChart3, Sparkles, CheckCircle, Info, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BrandingAgentPage() {
    const [blogContent, setBlogContent] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedBlog = localStorage.getItem("generated_blog");
        if (savedBlog) {
            setBlogContent(savedBlog);
        }
    }, []);

    const handleScore = async () => {
        if (!blogContent) return;

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const response = await fetch("/api/branding-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    blog_content: blogContent,
                    target_tone: "Empathetic, Nurturing, Informative, Professional, Supportive, Reassuring"
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error + (data.details ? ": " + data.details : ""));
            } else {
                setAnalysis(data.analysis);
            }
        } catch (err: any) {
            console.error(err);
            setError("Connectivity issue or server error. Check your Gemini API key.");
        } finally {
            setLoading(false);
        }
    };

    const restartProcess = () => {
        router.push("/research-agent");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-outfit">

            {/* 🟢 HERO & SCORING SECTION */}
            <section className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400 uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Agent 03: brand integrity layer</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 leading-tight">
                        Branding <span className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">Agent.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                        Evaluating brand alignment and tone consistency using Gemini 2.5 Flash.
                    </p>
                </motion.div>

                {/* Action Button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center flex-col items-center gap-6">
                    {!analysis && (
                        <button
                            onClick={handleScore}
                            disabled={loading || !blogContent}
                            className="bg-white text-slate-950 hover:bg-emerald-500 hover:text-white px-12 py-5 rounded-[1.5rem] font-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 font-outfit tracking-tight flex items-center gap-4 text-xl"
                        >
                            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : "SCORE BLOG TONE"}
                            {!loading && <BarChart3 className="w-6 h-6" />}
                        </button>
                    )}

                    {!blogContent && (
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Waiting for content from Writing Agent. Run Agent 02 first.
                        </p>
                    )}
                </motion.div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-200 p-5 rounded-2xl text-center backdrop-blur-md">
                        <p className="font-bold underline mb-1">Branding Error</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </motion.div>
                )}
            </section>

            {/* 🔴 BRANDING ANALYSIS RESULTS 🔴 */}
            <AnimatePresence mode="wait">
                {analysis && (
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pb-24 px-6 max-w-7xl mx-auto"
                    >
                        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden p-12 backdrop-blur-3xl shadow-2xl space-y-12">

                            {/* Score Display */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                                    <div className="relative w-48 h-48 rounded-full border-[8px] border-emerald-500/10 flex flex-col items-center justify-center bg-slate-950 shadow-2xl ring-1 ring-emerald-500/30">
                                        <span className="text-6xl font-black text-white">{analysis.score}</span>
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Brand Score</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-emerald-400 font-bold tracking-widest text-xs uppercase">
                                            <Star className="w-4 h-4" />
                                            <span>Analysis Insights</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white italic">"{analysis.feedback || 'Success'}"</h2>
                                    </div>

                                    <p className="text-slate-400 leading-relaxed text-lg">
                                        The brand alignment agent has verified the tone against the reference profile. Your content reflects the necessary empathy and professional depth required for this brand.
                                    </p>
                                </div>

                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={restartProcess}
                                        className="w-full bg-slate-950 border border-white/10 hover:bg-white hover:text-slate-950 text-white px-8 py-4 rounded-[1.2rem] font-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 group"
                                    >
                                        NEW RESEARCH PHASE
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Strengths & Weaknesses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                                <div className="bg-emerald-500/5 p-8 rounded-3xl border border-emerald-500/20 space-y-4">
                                    <h3 className="text-emerald-400 font-black tracking-widest text-sm uppercase flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Brand Strengths
                                    </h3>
                                    <ul className="space-y-4">
                                        {analysis.strengths?.map((s: string, i: number) => (
                                            <li key={i} className="text-slate-300 text-sm flex gap-3 italic">
                                                <span className="text-emerald-500">✔</span> {s}
                                            </li>
                                        ))}
                                        {!analysis.strengths && <li className="text-slate-500 italic">No specific strengths listed.</li>}
                                    </ul>
                                </div>

                                <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/20 space-y-4">
                                    <h3 className="text-red-400 font-black tracking-widest text-sm uppercase flex items-center gap-2">
                                        <Award className="w-5 h-5" /> Alignment Gaps
                                    </h3>
                                    <ul className="space-y-4">
                                        {analysis.weaknesses?.map((w: string, i: number) => (
                                            <li key={i} className="text-slate-300 text-sm flex gap-3 italic">
                                                <span className="text-red-500">•</span> {w}
                                            </li>
                                        ))}
                                        {!analysis.weaknesses && <li className="text-slate-500 italic">No significant alignment gaps found.</li>}
                                    </ul>
                                </div>
                            </div>

                            {/* Progress Tracker */}
                            <div className="flex justify-center items-center gap-4 pt-8">
                                <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
                                <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
                                <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Pipeline Complete</span>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* 🔴 EMPTY STATE 🔴 */}
            {!analysis && !loading && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-center mt-32 space-y-6 pb-24"
                >
                    <div className="inline-block p-8 rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl">
                        <ShieldCheck className="w-12 h-12 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Integrity Layer Standby</p>
                        <p className="text-slate-600 text-sm max-w-xs mx-auto">Click the button above to analyze the generated content for brand alignment and tone consistency.</p>
                    </div>
                </motion.div>
            )}

        </div>
    );
}
