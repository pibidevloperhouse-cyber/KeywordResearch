"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, Brain } from "lucide-react";
import { useRouter } from "next/navigation";

import ResultsSummary from "@/components/research/ResultsSummary";
import KeywordResearchUI from "@/components/research/KeywordResearchUI";

/**
 * HOME PAGE: Global Keyword Intelligence Tool
 * Refactored for clean code, professional structure, and scalability.
 */
export default function Home() {
  // --- STATE MANAGEMENT ---
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [globalNews, setGlobalNews] = useState<any[]>([]);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [activeRegion, setActiveRegion] = useState("India");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const router = useRouter();
  const [aiLoading, setAiLoading] = useState(false);

  // --- API HANDLER ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setResults([]);
    setTotalCredits(0);
    setGlobalError(null);

    try {
      const res = await fetch(`/api/research?topic=${encodeURIComponent(topic)}`);
      const data = await res.json();

      if (data.error) {
        setGlobalError(data.error + (data.details ? ": " + data.details : ""));
      } else {
        setResults(data.results || []);
        setGlobalNews(data.global_news || []);
        setTotalCredits(data.total_credits_used || 5);

        // Auto-select India if it exists, otherwise select the first country
        const defaultRegion = data.results.find((r: any) => r.country === "India")
          ? "India"
          : data.results[0]?.country;
        setActiveRegion(defaultRegion || "India");
      }
    } catch (error) {
      console.error("Search failed", error);
      setGlobalError("Connectivity issue or server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const currentData = results.find((r) => r.country === activeRegion);

  const handleTriggerAI = async () => {
    if (!currentData || !topic) return;

    setAiLoading(true);
    try {
      const response = await fetch("/api/research-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          existingData: currentData
        }),
      });

      const data = await response.json();

      if (data.error) {
        setGlobalError("AI Blueprint Error: " + data.error);
      } else {
        localStorage.setItem("research_instructions", JSON.stringify(data.instructions));
        localStorage.setItem("research_topic", topic);
        router.push("/writing-agent");
      }
    } catch (err) {
      console.error(err);
      setGlobalError("Failed to trigger AI Agent.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-12 max-w-7xl mx-auto space-y-12 md:space-y-16 selection:bg-purple-500/30">

      {/* 🟢 HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 leading-[1.1] font-outfit tracking-tight">
          Keyword <span className="text-cyan-500 drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]">Intelligence.</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed px-4 sm:px-0">
          Unlock global search data with professional SEO insights. Analyze intent and competitors across 5 major markets.
        </p>

        {/* Credits Status Indicator */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-3 glass px-6 py-2.5 rounded-2xl text-xs font-bold text-slate-300 shadow-2xl"
          >
            <div className="relative">
              <Activity className="w-4 h-4 text-emerald-400" />
              <Activity className="w-4 h-4 text-emerald-400 absolute inset-0 animate-ping opacity-50" />
            </div>
            <span className="tracking-widest uppercase">API Credits Used: {totalCredits}</span>
          </motion.div>
        )}
      </motion.div>



      {/* 🟢 SEARCH INPUT SECTION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto relative z-20 pt-4">
        <form onSubmit={handleSearch} className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-500 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
          <div className="relative flex flex-col md:flex-row items-center bg-slate-950/80 border border-white/10 rounded-[1.5rem] p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ring-1 ring-white/5 focus-within:ring-cyan-500/50 transition-all gap-2 md:gap-0">
            <div className="flex items-center w-full">
              <Search className="ml-3 sm:ml-5 w-5 h-5 sm:w-7 h-7 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
              <input
                type="text"
                placeholder="What do you want to research?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-slate-600 text-lg sm:text-2xl px-3 sm:px-5 py-3 sm:py-4 font-semibold font-outfit"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full md:w-auto bg-white text-slate-950 hover:bg-cyan-500 hover:text-white px-6 sm:px-10 py-3.5 sm:py-4.5 rounded-[1.1rem] sm:rounded-[1.2rem] font-black transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 font-outfit tracking-tight"
            >
              {loading ? "SEARCHING..." : "ANALYZE"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* 🟢 FEEDBACK BANNERS */}
      {globalError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-200 p-5 rounded-2xl text-center backdrop-blur-md">
          <p className="font-bold underline mb-1">Search Error</p>
          <p className="text-sm opacity-90">{globalError}</p>
        </motion.div>
      )}

      {/* 🔴 RESULTS ENGINE 🔴 */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-12">

            {/* Global Roundup Section */}
            {globalNews.length > 0 && <ResultsSummary globalNews={globalNews} />}

            {/* Region Switcher Tabs + Trigger Button */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
                {results.map((r) => (
                  <button
                    key={r.country}
                    onClick={() => setActiveRegion(r.country)}
                    className={`flex-1 md:flex-none min-w-[100px] px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${activeRegion === r.country
                      ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      : "bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300"
                      }`}
                  >
                    {r.country}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTriggerAI}
                disabled={aiLoading || !currentData}
                className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_rgba(6,182,212,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {aiLoading ? <Activity className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                {aiLoading ? "GENERATING BLUEPRINT..." : "TRIGGER AI BLOG AGENT"}
              </button>
            </div>

            {/* 🟢 DYNAMIC RESEARCH MODULE (Plug-and-Play) 🟢 */}
            {currentData && <KeywordResearchUI data={currentData} />}

          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 EMPTY STATE */}
      {!results.length && !loading && !globalError && (
        <div className="text-center mt-32 space-y-4 opacity-30">
          <div className="inline-block p-6 rounded-3xl bg-slate-900 border border-white/5">
            <Search className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Waiting for search input</p>
        </div>
      )}


    </main>
  );
}
