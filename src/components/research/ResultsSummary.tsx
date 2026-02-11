"use client";

import { Newspaper } from "lucide-react";
import { motion } from "framer-motion";

interface GlobalNewsSummary {
    country: string;
    top_story: {
        title: string;
        link: string;
        source: string;
        date: string;
    };
}

interface ResultsSummaryProps {
    globalNews: GlobalNewsSummary[];
}

/**
 * ResultsSummary: Displays a grid of top news stories across all major regions.
 */
export default function ResultsSummary({ globalNews }: ResultsSummaryProps) {
    if (!globalNews || globalNews.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-[2rem] p-10 shadow-[0_0_80px_rgba(34,211,238,0.1)] relative overflow-hidden"
        >
            {/* Decorative background pulses */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse"></div>

            <div className="flex items-center space-x-5 mb-10 relative z-10">
                <div className="p-4 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 shadow-inner">
                    <Newspaper className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight font-outfit uppercase">Global Headlines</h2>
                    <p className="text-slate-400 font-medium tracking-wide">The fastest-moving search stories across 5 major regions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
                {globalNews.map((news, idx) => {
                    if (!news?.top_story) return null;
                    return (
                        <motion.a
                            key={idx}
                            href={news.top_story.link}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_15px_30px_rgba(34,211,238,0.15)] h-full flex flex-col"
                        >
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-[10px] font-black text-cyan-300 border border-cyan-500/30 uppercase tracking-widest shadow-lg">
                                {news.country}
                            </div>
                            <div className="mt-8 flex-1 flex flex-col">
                                <span className="text-[10px] text-cyan-400/80 font-black uppercase tracking-[0.2em] block mb-3">
                                    {typeof news.top_story.source === 'string' ? news.top_story.source : 'Source'}
                                </span>
                                <h4 className="text-sm font-bold text-slate-100 line-clamp-3 group-hover:text-cyan-200 transition-colors leading-relaxed font-outfit flex-1">
                                    {news.top_story.title}
                                </h4>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{news.top_story.date}</p>
                                    <div className="w-6 h-6 rounded-full bg-slate-800/80 group-hover:bg-cyan-500 flex items-center justify-center transition-all duration-300 shadow-xl group-hover:shadow-cyan-500/50">
                                        <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-slate-400 group-hover:border-white transform rotate-45 ml-[-1px]"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.a>
                    );
                })}
            </div>
        </motion.div>
    );
}
