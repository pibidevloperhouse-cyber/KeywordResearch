"use client";


import PrimaryKeywords from "./PrimaryKeywords";
import ContextKeywords from "./ContextKeywords";
import Competitors from "./Competitors";
import PeopleAlsoAsk from "./PeopleAlsoAsk";
import PaidAds from "./PaidAds";
import NewsTrends from "./NewsTrends";

interface KeywordResearchUIProps {
    data: any;
}

/**
 * KeywordResearchUI: A structural component that organizes the 6 research output boxes.
 * Plug-and-play architecture for clean code.
 */
export default function KeywordResearchUI({ data }: KeywordResearchUIProps) {
    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Error Message if specific country data failed */}
            {data.error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-6 rounded-2xl text-center shadow-lg backdrop-blur-md">
                    <p className="font-bold text-lg">⚠️ Data Fetch Incomplete</p>
                    <p className="text-sm opacity-80 mt-2">Error: {data.error}</p>
                    <p className="text-xs opacity-60 mt-4 italic">Please verify your SERPAPI_KEY and search parameters.</p>
                </div>
            )}

            {/* The 6-Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Module 1: Primary Keywords */}
                <PrimaryKeywords keywords={data.primary_keywords} />

                {/* Module 2: Context Keywords */}
                <ContextKeywords keywords={data.secondary_keywords} />

                {/* Module 3: Competitors */}
                <Competitors competitors={data.competitors} />

                {/* Module 4: People Also Ask */}
                <PeopleAlsoAsk questions={data.paa_questions} />



                {/* Module 5: Paid Ads */}
                <PaidAds ads={data.ads} />

                {/* Module 6: News & Trends */}
                <NewsTrends news={data.news} />
            </div>
        </div>
    );
}
