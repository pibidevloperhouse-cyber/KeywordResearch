"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BaseCardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    delay?: number;
}

/**
 * BaseCard: A reusable, professional container for all research result sections.
 * Designed for a "plug-in plug-out" architecture.
 */
export default function BaseCard({ title, icon, children, delay = 0 }: BaseCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="glass rounded-3xl overflow-hidden shadow-2xl hover:shadow-cyan-500/5 transition-all group flex flex-col h-full"
        >
            {/* Header Section */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center space-x-4 bg-white/5">
                <div className="p-2.5 bg-slate-800/80 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                    {icon}
                </div>
                <h3 className="font-bold text-slate-100 tracking-tight text-lg font-outfit">{title}</h3>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1">
                {children}
            </div>
        </motion.div>
    );
}
