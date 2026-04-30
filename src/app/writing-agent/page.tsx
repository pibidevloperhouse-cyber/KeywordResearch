"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PenTool, ArrowRight, Loader2, FileText, Sparkles, CheckCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WritingAgentPage() {
    const [instructions, setInstructions] = useState<any>(null);
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [blogContent, setBlogContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedInstructions = localStorage.getItem("research_instructions");
        const savedTopic = localStorage.getItem("research_topic");

        if (savedInstructions) {
            setInstructions(JSON.parse(savedInstructions));
        }
        if (savedTopic) {
            setTopic(savedTopic);
        }
    }, []);

    const handleWrite = async () => {
        if (!instructions) return;

        setLoading(true);
        setError(null);
        setBlogContent("");

        try {
            const response = await fetch("/api/writing-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instructions }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error + (data.details ? ": " + data.details : ""));
            } else {
                setBlogContent(data.blog_content);
                // Save to localStorage for next agent
                localStorage.setItem("generated_blog", data.blog_content);
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to connect to the writing engine. Ensure your GROQ_API_KEY is valid in .env.local.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        router.push("/branding-agent");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30 font-outfit">

            {/* 🟢 HERO & CONTROL SECTION */}
            <section className="pt-16 sm:pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-purple-400 uppercase tracking-widest">
                        <PenTool className="w-4 h-4" />
                        <span>Agent 02: content creation engine</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 leading-tight">
                        Writing <span className="text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">Agent.</span>
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium px-4 sm:px-0">
                        Generating empathetic and informative blog content using Llama 3 70B (Powered by Groq).
                    </p>
                </motion.div>

                {/* Action Button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center flex-col items-center gap-6">
                    {!blogContent && (
                        <button
                            onClick={handleWrite}
                            disabled={loading || !instructions}
                            className="w-full sm:w-auto bg-white text-slate-950 hover:bg-purple-500 hover:text-white px-8 sm:px-12 py-4 sm:py-5 rounded-[1.2rem] sm:rounded-[1.5rem] font-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 font-outfit tracking-tight flex items-center justify-center gap-4 text-lg sm:text-xl"
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6 sm:w-8 h-8" /> : "GENERATE BLOG POST"}
                            {!loading && <Sparkles className="w-5 h-5 sm:w-6 h-6" />}
                        </button>
                    )}

                    {!instructions && (
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Waiting for instructions from Research Agent. Run Agent 01 first.
                        </p>
                    )}
                </motion.div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-200 p-5 rounded-2xl text-center backdrop-blur-md">
                        <p className="font-bold underline mb-1">Writing Error</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </motion.div>
                )}
            </section>

            {/* 🔴 CONTENT RESULTS 🔴 */}
            <AnimatePresence mode="wait">
                {blogContent && (
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
                    >
                        <div className="bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative">

                            {/* Header Info */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
                                <div className="space-y-1 w-full text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-purple-400 font-bold tracking-widest text-[10px] sm:text-xs uppercase">
                                        <FileText className="w-4 h-4" />
                                        <span>Generated Content Preview</span>
                                    </div>
                                    <h2 className="text-xl sm:text-3xl font-black text-white italic">"{topic || 'Untitled Topic'}"</h2>
                                </div>

                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={nextStep}
                                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-white hover:to-slate-100 text-slate-950 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1rem] sm:rounded-[1.2rem] font-black transition-all shadow-[0_20px_40px_rgba(168,85,247,0.3)] active:scale-95 flex items-center justify-center gap-3 sm:gap-4 group text-sm sm:text-base"
                                    >
                                        TRIGGER BRANDING AGENT
                                        <ArrowRight className="w-4 h-4 sm:w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Render Blog */}
                            <div className="max-w-4xl mx-auto prose prose-invert prose-slate prose-xl selection:bg-purple-500/40">
                                <div
                                    className="whitespace-pre-wrap font-outfit text-slate-300 leading-relaxed space-y-6"
                                >
                                    {blogContent}
                                </div>
                            </div>

                            {/* Success Badge */}
                            <div className="mt-12 flex justify-center">
                                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-6 py-2 rounded-full text-emerald-400 font-bold text-xs uppercase tracking-widest">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Writing Phase Success</span>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* 🔴 EMPTY STATE 🔴 */}
            {!blogContent && !loading && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-center mt-32 space-y-6 pb-24"
                >
                    <div className="inline-block p-8 rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl">
                        <BookOpen className="w-12 h-12 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Awaiting Agent Input</p>
                        <p className="text-slate-600 text-sm max-w-xs mx-auto">Prepare the writing phase by clicking the button above. The Llama 3 model will then author the blog post in seconds.</p>
                    </div>
                </motion.div>
            )}

        </div>
    );
}
