import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';

const API_KEY = process.env.SERPAPI_KEY;

// High-commercial cities (better ad density)
const REGIONS = {
    "India": {
        gl: "in",
        loc: "Mumbai, Maharashtra, India",
        domain: "google.co.in"
    },
    "USA": {
        gl: "us",
        loc: "New York, New York, United States",
        domain: "google.com"
    },
    "Australia": {
        gl: "au",
        loc: "Sydney, New South Wales, Australia",
        domain: "google.com.au"
    },
    "Japan": {
        gl: "jp",
        loc: "Tokyo, Japan",
        domain: "google.co.jp"
    },
    "Italy": {
        gl: "it",
        loc: "Milan, Lombardy, Italy",
        domain: "google.it"
    }
};

// --------------------------------------------
// Detect Query Intent
// --------------------------------------------
function isCommercialIntent(query: string): boolean {
    return /(buy|price|booking|online|near me|best|offer|finance)/i.test(query);
}

// --------------------------------------------
// Generate Smart Region Query
// --------------------------------------------
function buildQuery(baseTopic: string, regionIndex: number): string {

    const commercial = isCommercialIntent(baseTopic);

    if (commercial) {
        const commercialBoost = [
            " price",
            " near me",
            " best deals",
            " offers",
            " financing"
        ];
        return baseTopic + commercialBoost[regionIndex];
    } else {
        const informationalBoost = [
            "",
            " news",
            " latest updates",
            " trends",
            " analysis"
        ];
        return baseTopic + informationalBoost[regionIndex];
    }
}

// --------------------------------------------
// FREE Context Keywords
// --------------------------------------------
function extractSecondaryKeywords(organicResults: any[], mainTopic: string): string[] {
    if (!organicResults || organicResults.length === 0) return [];

    const text = organicResults
        .map(r => `${r.title} ${r.snippet}`)
        .join(" ")
        .toLowerCase();

    const stopWords = new Set([
        'the', 'and', 'for', 'with', 'from', 'how', 'best', 'top', 'your',
        'this', 'that', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'of', 'a', 'an'
    ]);

    const topicWords = mainTopic.toLowerCase().split(/\s+/);
    const counts: Record<string, number> = {};

    text.split(/\W+/).forEach(word => {
        if (word.length > 3 && !stopWords.has(word) && !topicWords.includes(word)) {
            counts[word] = (counts[word] || 0) + 1;
        }
    });

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
}

// --------------------------------------------
// MAIN HANDLER
// --------------------------------------------
export async function GET(request: Request) {

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    if (!topic)
        return NextResponse.json({ error: "Topic required" }, { status: 400 });

    if (!API_KEY)
        return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    try {

        const regionEntries = Object.entries(REGIONS);

        const results = await Promise.all(
            regionEntries.map(async ([country, config], index) => {

                const smartQuery = buildQuery(topic, index);

                const data: any = await new Promise((resolve, reject) => {
                    getJson({
                        api_key: API_KEY,
                        engine: "google",
                        q: smartQuery,
                        gl: config.gl,
                        location: config.loc,
                        google_domain: config.domain,
                        hl: "en",
                        device: "desktop",
                        num: 15
                    }, (json) => {
                        if (json.error) reject(json.error);
                        else resolve(json);
                    });
                });

                return {
                    country,
                    query_used: smartQuery,

                    primary_keywords:
                        data.related_searches?.map((r: any) => r.query) || [],

                    secondary_keywords:
                        extractSecondaryKeywords(data.organic_results || [], topic),

                    paa_questions:
                        data.related_questions?.map((q: any) => q.question) || [],

                    competitors:
                        data.organic_results?.slice(0, 8).map((res: any) => ({
                            title: res.title,
                            link: res.link,
                            snippet: res.snippet,
                            source: res.source || "Website"
                        })) || [],

                    news:
                        data.top_stories?.map((n: any) => ({
                            title: n.title,
                            link: n.link,
                            date: n.date,
                            thumbnail: n.thumbnail,
                            source: n.source
                        })) || [],

                    ads:
                        data.ads?.map((ad: any) => ({
                            title: ad.title,
                            link: ad.link,
                            description: ad.description,
                            displayed_link: ad.displayed_link,
                            position: ad.position
                        })) || [],

                    trend_score:
                        data.search_information?.total_results || 0,

                    ad_count:
                        data.ads?.length || 0,

                    news_count:
                        data.top_stories?.length || 0
                };
            })
        );

        return NextResponse.json({
            topic,
            timestamp: new Date().toISOString(),
            total_credits_used: results.length, // ALWAYS 5
            results
        });

    } catch (error: any) {
        console.error("SERP Error:", error);
        return NextResponse.json({
            error: "Search failed",
            details: error.message || error
        }, { status: 500 });
    }
}




//Fshows ads but not fully completed
// import { NextResponse } from 'next/server';
// import { getJson } from 'serpapi';

// // ============================================
// // CONFIGURATION & REGIONS (Ad + News Optimized)
// // ============================================

// const API_KEY = process.env.SERPAPI_KEY;

// // Intent-modified queries per region (FORCE SERP BLOCKS)
// const REGION_CONFIG = {
//     "India": {
//         gl: "in",
//         loc: "Mumbai, Maharashtra, India",
//         domain: "google.co.in",
//         modifier: "" // informational
//     },
//     "USA": {
//         gl: "us",
//         loc: "New York, New York, United States",
//         domain: "google.com",
//         modifier: " news" // force news block
//     },
//     "Australia": {
//         gl: "au",
//         loc: "Sydney, New South Wales, Australia",
//         domain: "google.com.au",
//         modifier: " latest" // trending intent
//     },
//     "Japan": {
//         gl: "jp",
//         loc: "Tokyo, Japan",
//         domain: "google.co.jp",
//         modifier: " price" // commercial → ads
//     },
//     "Italy": {
//         gl: "it",
//         loc: "Milan, Lombardy, Italy",
//         domain: "google.it",
//         modifier: " buy online" // commercial → ads
//     }
// };

// // ============================================
// // FREE Context Keyword Extractor
// // ============================================

// function extractSecondaryKeywords(organicResults: any[], mainTopic: string): string[] {
//     if (!organicResults || organicResults.length === 0) return [];

//     const allText = organicResults
//         .map(r => `${r.title} ${r.snippet}`)
//         .join(" ")
//         .toLowerCase();

//     const stopWords = new Set([
//         'the', 'and', 'for', 'with', 'from', 'how', 'best', 'top', 'your', 'this',
//         'that', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'of', 'a', 'an'
//     ]);

//     const topicWords = mainTopic.toLowerCase().split(/\s+/);
//     const wordCounts: Record<string, number> = {};

//     allText.split(/\W+/).forEach(word => {
//         if (word.length > 3 && !stopWords.has(word) && !topicWords.includes(word)) {
//             wordCounts[word] = (wordCounts[word] || 0) + 1;
//         }
//     });

//     return Object.entries(wordCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 10)
//         .map(([word]) => word);
// }

// // ============================================
// // MAIN API HANDLER
// // ============================================

// export async function GET(request: Request) {
//     const { searchParams } = new URL(request.url);
//     const topic = searchParams.get('topic');

//     if (!topic)
//         return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

//     if (!API_KEY)
//         return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

//     try {

//         const results = await Promise.all(
//             Object.entries(REGION_CONFIG).map(async ([country, config]) => {

//                 const query = topic + config.modifier;

//                 const data: any = await new Promise((resolve, reject) => {
//                     getJson({
//                         api_key: API_KEY,
//                         engine: "google",
//                         q: query,
//                         gl: config.gl,
//                         location: config.loc,
//                         google_domain: config.domain,
//                         hl: "en",
//                         device: "desktop",
//                         num: 15
//                     }, (json) => {
//                         if (json.error) reject(json.error);
//                         else resolve(json);
//                     });
//                 });

//                 const trendScore =
//                     data.search_information?.total_results || 0;

//                 return {
//                     country,
//                     query_used: query,

//                     // TAB 1: Related Searches
//                     primary_keywords:
//                         data.related_searches?.map((r: any) => r.query) || [],

//                     // TAB 2: Context Keywords (FREE)
//                     secondary_keywords:
//                         extractSecondaryKeywords(data.organic_results || [], topic),

//                     // TAB 3: People Also Ask
//                     paa_questions:
//                         data.related_questions?.map((q: any) => q.question) || [],

//                     // TAB 4: Organic Competitors
//                     competitors:
//                         data.organic_results?.slice(0, 8).map((res: any) => ({
//                             title: res.title,
//                             link: res.link,
//                             snippet: res.snippet,
//                             source: res.source || "Website"
//                         })) || [],

//                     // TAB 5: News (Top Stories block)
//                     news:
//                         data.top_stories?.map((n: any) => ({
//                             title: n.title,
//                             link: n.link,
//                             date: n.date,
//                             thumbnail: n.thumbnail,
//                             source: n.source
//                         })) || [],

//                     // TAB 6: Paid Ads
//                     ads:
//                         data.ads?.map((ad: any) => ({
//                             title: ad.title,
//                             link: ad.link,
//                             description: ad.description,
//                             displayed_link: ad.displayed_link,
//                             position: ad.position
//                         })) || [],

//                     // FREE Trend Indicator
//                     trend_score: trendScore
//                 };
//             })
//         );

//         const globalNews = results
//             .map(r => ({
//                 country: r.country,
//                 top_story: r.news[0] || null
//             }))
//             .filter(n => n.top_story);

//         return NextResponse.json({
//             topic,
//             timestamp: new Date().toISOString(),
//             total_credits_used: results.length, // STILL 5
//             global_news: globalNews,
//             results
//         });

//     } catch (error: any) {
//         console.error("SerpAPI Bulk Error:", error);
//         return NextResponse.json({
//             error: "Search failed",
//             details: error.message || error
//         }, { status: 500 });
//     }
// }



// import { NextResponse } from 'next/server';
// import { getJson } from 'serpapi';

// // ============================================
// // CONFIGURATION & REGIONS
// // ============================================
// const API_KEY = process.env.SERPAPI_KEY;

// // 5 Specific Countries requested by you
// const REGIONS = {
//     "India": { gl: "in", loc: "New Delhi, Delhi, India", domain: "google.co.in" },
//     "USA": { gl: "us", loc: "New York, New York, United States", domain: "google.com" },
//     "Australia": { gl: "au", loc: "Sydney, New South Wales, Australia", domain: "google.com.au" },
//     "Japan": { gl: "jp", loc: "Tokyo, Japan", domain: "google.co.jp" },
//     "Italy": { gl: "it", loc: "Rome, Lazio, Italy", domain: "google.it" }
// };

// /**
//  * HELPER: Extract "Context Keywords" locally (FREE).
//  * Analyzes the top 15 results to find recurring meaningful words.
//  */
// function extractSecondaryKeywords(organicResults: any[], mainTopic: string): string[] {
//     if (!organicResults || organicResults.length === 0) return [];
//     const allText = organicResults.map(r => `${r.title} ${r.snippet}`).join(" ").toLowerCase();
//     const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'how', 'best', 'top', 'your', 'this', 'that', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'web', 'site']);
//     const topicWords = mainTopic.toLowerCase().split(/\s+/);
//     const wordCounts: Record<string, number> = {};

//     allText.split(/\W+/).forEach(word => {
//         if (word.length > 3 && !stopWords.has(word) && !topicWords.includes(word)) {
//             wordCounts[word] = (wordCounts[word] || 0) + 1;
//         }
//     });

//     return Object.entries(wordCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 10)
//         .map(([word]) => word);
// }

// // ============================================
// // MAIN API HANDLER
// // ============================================
// export async function GET(request: Request) {
//     const { searchParams } = new URL(request.url);
//     const topic = searchParams.get('topic');

//     if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
//     if (!API_KEY) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

//     try {
//         // Run all 5 regions in parallel (1 Search per country = 5 Credits Total)
//         const results = await Promise.all(
//             Object.entries(REGIONS).map(async ([country, config]) => {
//                 const data: any = await new Promise((resolve, reject) => {
//                     getJson({
//                         api_key: API_KEY,
//                         engine: "google",
//                         q: topic,
//                         gl: config.gl,
//                         location: config.loc,
//                         google_domain: config.domain,
//                         hl: "en",           // Result language set to English
//                         device: "desktop",  // Desktop usually yields more Ads
//                         num: 15             // Standard page results
//                     }, (json) => {
//                         if (json.error) reject(json.error);
//                         else resolve(json);
//                     });
//                 });

//                 // --- DATA EXTRACTION PER COUNTRY ---

//                 return {
//                     country,
//                     // TAB 1: Primary Keywords from Related Searches
//                     primary_keywords: data.related_searches?.map((r: any) => r.query) || [],

//                     // TAB 2: Secondary Keywords (Calculated locally for FREE)
//                     secondary_keywords: extractSecondaryKeywords(data.organic_results || [], topic),

//                     // TAB 3: People Also Ask Questions
//                     paa_questions: data.related_questions?.map((q: any) => q.question) || [],

//                     // TAB 4: organic Competitors (Top 8)
//                     competitors: data.organic_results?.slice(0, 8).map((res: any) => ({
//                         title: res.title,
//                         link: res.link,
//                         snippet: res.snippet,
//                         source: res.source || "Website"
//                     })) || [],

//                     // TAB 5: News (Extracted from "top_stories" block - FREE with main search)
//                     news: data.top_stories?.map((n: any) => ({
//                         title: n.title,
//                         link: n.link,
//                         date: n.date,
//                         thumbnail: n.thumbnail,
//                         source: n.source
//                     })) || [],

//                     // TAB 6: Paid Ads (Sponsored results)
//                     ads: data.ads?.map((ad: any) => ({
//                         title: ad.title,
//                         link: ad.link,
//                         description: ad.description,
//                         displayed_link: ad.displayed_link,
//                         position: ad.position
//                     })) || []
//                 };
//             })
//         );

//         // Calculate total summary news for the roundup section
//         const globalNews = results.map(r => ({
//             country: r.country,
//             top_story: r.news[0] || null
//         })).filter(n => n.top_story);

//         return NextResponse.json({
//             topic,
//             timestamp: new Date().toISOString(),
//             total_credits_used: results.length, // Exactly 5 credits
//             global_news: globalNews,
//             results
//         });

//     } catch (error: any) {
//         console.error("SerpAPI Bulk Error:", error);
//         return NextResponse.json({
//             error: "Search failed",
//             details: error.message || error
//         }, { status: 500 });
//     }
// }
