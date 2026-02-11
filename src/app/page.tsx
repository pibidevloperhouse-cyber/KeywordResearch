"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Users, HelpCircle, Key, ExternalLink, Activity, BadgeDollarSign, Newspaper } from "lucide-react";
import AdSense from "@/components/AdSense";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [globalNews, setGlobalNews] = useState<any[]>([]);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [activeRegion, setActiveRegion] = useState("India");
  const [globalError, setGlobalError] = useState<string | null>(null);

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
      } else if (data.results) {
        setResults(data.results);
        setGlobalNews(data.global_news || []);
        setTotalCredits(data.total_credits_used || 10);
        // Default to first available region or India
        const found = data.results.find((r: any) => r.country === "India") ? "India" : data.results[0]?.country;
        setActiveRegion(found || "India");
      }
    } catch (error) {
      console.error("Search failed", error);
      setGlobalError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentData = results.find((r) => r.country === activeRegion);

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
          Global Keyword Intelligence
        </h1>
        <p className="text-slate-400 text-lg">
          Deep dive into search intent, competitors, and trends across 5 major regions.
        </p>

        {/* Credits Indicator */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center space-x-2 bg-slate-800/50 px-4 py-1 rounded-full border border-slate-700/50 text-xs text-slate-400"
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>API Credits Used: {totalCredits}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Top Banner Ad */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <AdSense
          adSlot="1234567890"
          adFormat="horizontal"
          className="min-h-[90px] flex items-center justify-center"
        />
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl">
            <Search className="ml-4 w-6 h-6 text-slate-400" />
            <input
              type="text"
              placeholder="Enter keyword (e.g. 'digital marketing')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 text-lg px-4 py-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing..." : "Research"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Global Error Banner */}
      {globalError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-center"
        >
          <p className="font-semibold">{globalError}</p>
        </motion.div>
      )}

      {/* Global News Roundup Section */}
      {globalNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 backdrop-blur-3xl border border-blue-500/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Newspaper className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Top 1 News per Country</h2>
              <p className="text-xs text-slate-400">Latest headline from each major region</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {globalNews.map((news: any, idx: number) => {
              if (!news?.top_story) return null;
              return (
                <a
                  key={idx}
                  href={news.top_story.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all hover:bg-slate-700/40 hover:border-blue-500/50"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-blue-500/20 rounded text-[10px] font-bold text-blue-300 border border-blue-500/30">
                    {news.country}
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">{typeof news.top_story.source === 'string' ? news.top_story.source : 'News Source'}</span>
                    <h4 className="text-sm font-medium text-slate-200 line-clamp-2 mt-1 group-hover:text-blue-300 transition-colors">
                      {typeof news.top_story.title === 'string' ? news.top_story.title : 'No Title'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-2">{typeof news.top_story.date === 'string' ? news.top_story.date : ''}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Region Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {results.map((r) => (
                <button
                  key={r.country}
                  onClick={() => setActiveRegion(r.country)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeRegion === r.country
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50"
                    }`}
                >
                  {r.country}
                </button>
              ))}
            </div>

            {/* The 4 Grid Boxes */}
            {currentData && (
              <div className="space-y-6">
                {currentData.error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
                    <p className="font-semibold">Error: {currentData.error}</p>
                    <p className="text-sm opacity-75 mt-1">Please check your API key in <code>.env.local</code> or <code>src/app/api/research/route.ts</code>.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

                  {/* 1. Primary Keyword (Variations) */}
                  <Card title="Primary Keywords (Search Queries)" icon={<Key className="w-5 h-5 text-purple-400" />}>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentData.primary_keywords?.length > 0 ? (
                        currentData.primary_keywords.map((kw: string, i: number) => (
                          <div key={i} className="flex items-center p-2 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm text-slate-300">
                            <span className="w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-300 rounded-full text-xs mr-3 min-w-[24px]">
                              {i + 1}
                            </span>
                            {kw}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No variations found.</p>
                      )}
                    </div>
                  </Card>

                  {/* 2. Secondary/Context Keywords */}
                  <Card title="Context Keywords (Extracted)" icon={<Globe className="w-5 h-5 text-cyan-400" />}>
                    <div className="flex flex-wrap gap-2">
                      {currentData.secondary_keywords?.length > 0 ? (
                        currentData.secondary_keywords.map((kw: string, i: number) => (
                          <span key={i} className="bg-cyan-900/30 text-cyan-200 text-xs font-medium px-2.5 py-1 rounded border border-cyan-800/50">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No context keywords found.</p>
                      )}
                    </div>
                  </Card>

                  {/* 3. Competitors */}
                  <Card title="Top Competitors" icon={<Users className="w-5 h-5 text-emerald-400" />}>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentData.competitors?.length > 0 ? (
                        currentData.competitors.map((comp: any, i: number) => (
                          <a
                            key={i}
                            href={comp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-700/50 transition-colors group"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-semibold text-emerald-400/80 uppercase">{comp.source}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-300 transition-colors" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-200 line-clamp-1 group-hover:text-emerald-200">{comp.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{comp.snippet}</p>
                          </a>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No competitors found.</p>
                      )}
                    </div>
                  </Card>

                  {/* 4. PAA (People Also Ask) */}
                  <Card title="People Also Ask" icon={<HelpCircle className="w-5 h-5 text-amber-400" />}>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentData.paa_questions?.length > 0 ? (
                        currentData.paa_questions.map((q: string, i: number) => (
                          <div key={i} className="flex items-start p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                            <div className="mt-1 mr-3 min-w-[6px] h-6 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></div>
                            </div>
                            <p className="text-sm text-slate-300 italic">"{q}"</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No questions found.</p>
                      )}
                    </div>
                  </Card>

                  {/* In-Content Ad Unit */}
                  <div className="md:col-span-2">
                    <AdSense
                      adSlot="0987654321"
                      adFormat="horizontal"
                      className="min-h-[100px] flex items-center justify-center rounded-2xl overflow-hidden"
                    />
                  </div>

                  {/* 5. Ad Results */}
                  <Card title="Paid Ad Results" icon={<BadgeDollarSign className="w-5 h-5 text-rose-400" />}>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentData.ads?.length > 0 ? (
                        currentData.ads.map((ad: any, i: number) => (
                          <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 group">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 uppercase tracking-wider">Ad</span>
                              {ad.position && <span className="text-xs text-slate-600">Pos: {ad.position}</span>}
                            </div>
                            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block group-hover:opacity-80 transition-opacity">
                              <h3 className="text-sm font-semibold text-rose-200 line-clamp-1">{ad.title}</h3>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ad.description}</p>
                              <p className="text-[10px] text-slate-500 mt-1 truncate">{ad.displayed_link}</p>
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No ads found for this keyword.</p>
                      )}
                    </div>
                  </Card>

                  {/* 6. News & Trends */}
                  <Card title="Google News & Trends" icon={<Newspaper className="w-5 h-5 text-blue-400" />}>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentData.news?.length > 0 ? (
                        currentData.news.map((n: any, i: number) => (
                          <a
                            key={i}
                            href={n.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                          >
                            {n.thumbnail && typeof n.thumbnail === 'string' && (
                              <img src={n.thumbnail} alt="" className="w-16 h-16 object-cover rounded-md bg-slate-900" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-blue-400 truncate">{n.source}</span>
                                <span className="text-[10px] text-slate-500">{n.date}</span>
                              </div>
                              <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug">{n.title}</h3>
                            </div>
                          </a>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No news stories found.</p>
                      )}
                    </div>
                  </Card>

                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State / Placeholder */}
      {!results.length && !loading && !globalError && (
        <div className="text-center mt-20 opacity-50">
          <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-500">Wait for your input...</p>
        </div>
      )}

      {/* Bottom Ad Unit */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <AdSense
            adSlot="1122334455"
            adFormat="horizontal"
            className="min-h-[90px] flex items-center justify-center"
          />
        </motion.div>
      )}
    </main>
  );
}

// Reusable Card Component
function Card({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="px-6 py-4 border-b border-white/5 flex items-center space-x-3 bg-white/5">
        {icon}
        <h3 className="font-semibold text-slate-200">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}
