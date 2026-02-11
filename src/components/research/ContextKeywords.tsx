"use client";

import { Globe } from "lucide-react";
import BaseCard from "./BaseCard";

interface ContextKeywordsProps {
    keywords: string[];
}


export default function ContextKeywords({ keywords }: ContextKeywordsProps) {
    return (
        <BaseCard
            title="Context Keywords (Extracted)"
            icon={<Globe className="w-5 h-5 text-cyan-400" />}
            delay={0.2}
        >
            <div className="flex flex-wrap gap-2">
                {keywords && keywords.length > 0 ? (
                    keywords.map((kw: string, i: number) => (
                        <span
                            key={i}
                            className="bg-cyan-900/30 text-cyan-200 text-xs font-medium px-3 py-1.5 rounded-full border border-cyan-800/50 hover:bg-cyan-800/40 transition-colors"
                        >
                            {kw}
                        </span>
                    ))
                ) : (
                    <p className="text-slate-500 italic text-center py-4 w-full">No context keywords found.</p>
                )}
            </div>
        </BaseCard>
    );
}
