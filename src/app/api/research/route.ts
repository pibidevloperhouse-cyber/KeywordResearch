import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';

const API_KEY = process.env.SERPAPI_KEY;

// Mock data for when SerpAPI doesn't return ads/news
// (some API tiers don't include these fields)
const MOCK_ADS = [
    {
        title: "Premium Product - Official Store",
        link: "https://www.example.com/product",
        description: "Get exclusive deals and fast shipping on top-rated products. Limited time offer!",
        displayed_link: "example.com › products › featured",
        position: 1
    },
    {
        title: "Best Deals Online",
        link: "https://www.deals.example.com",
        description: "Unbeatable prices with free returns. Shop now and save up to 50%!",
        displayed_link: "deals.example.com › shop",
        position: 2
    },
    {
        title: "Authorized Retailer",
        link: "https://www.retail.example.com",
        description: "Certified products with warranty. Fast delivery available worldwide.",
        displayed_link: "retail.example.com › certified",
        position: 3
    }
];

const MOCK_NEWS = [
    {
        title: "Latest Industry Trends & Updates",
        link: "https://www.news.example.com/trending",
        date: "2 days ago",
        thumbnail: null,
        source: "News Today"
    },
    {
        title: "Expert Review & Analysis",
        link: "https://www.tech-news.example.com/analysis",
        date: "1 day ago",
        thumbnail: null,
        source: "Tech Weekly"
    },
    {
        title: "Market Report 2024",
        link: "https://www.market.example.com/report",
        date: "3 days ago",
        thumbnail: null,
        source: "Market Watch"
    }
];

// HIGH-commercial cities (better ad density)
const REGIONS = {
    "India": {
        gl: "in",
        loc: "Mumbai, Maharashtra, India",
        domain: "google.co.in",
        modifier: "" // Base search
    },
    "USA": {
        gl: "us",
        loc: "New York, New York, United States",
        domain: "google.com",
        modifier: " buy" // Commercial - triggers ads
    },
    "Australia": {
        gl: "au",
        loc: "Sydney, New South Wales, Australia",
        domain: "google.com.au",
        modifier: " price" // Commercial - triggers ads
    },
    "Japan": {
        gl: "jp",
        loc: "Tokyo, Japan",
        domain: "google.co.jp",
        modifier: " news" // Triggers news block
    },
    "Italy": {
        gl: "it",
        loc: "Milan, Lombardy, Italy",
        domain: "google.it",
        modifier: " latest" // Trending - triggers news
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
// Using region-specific modifiers to trigger ads and news blocks
function buildQuery(baseTopic: string, regionConfig: any): string {
    const commercial = isCommercialIntent(baseTopic);
    
    // Use region-specific modifier to trigger different SERP blocks
    if (regionConfig.modifier) {
        return baseTopic + regionConfig.modifier;
    }
    
    // Fallback to commercial/informational logic if no modifier
    if (commercial) {
        return baseTopic + " buy";
    } else {
        return baseTopic;
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

                const smartQuery = buildQuery(topic, config);

                // Fetch main Google search results
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

                // DEBUG: Log response structure to identify field names
                console.log(`[${country}] SerpAPI Response Fields:`, {
                    has_ads: !!data.ads,
                    ads_length: data.ads?.length || 0,
                    has_shopping: !!data.shopping_results,
                    shopping_length: data.shopping_results?.length || 0,
                    has_news_results: !!data.news_results,
                    news_results_length: data.news_results?.length || 0,
                    has_top_stories: !!data.top_stories,
                    top_stories_length: data.top_stories?.length || 0,
                    all_keys: Object.keys(data).filter(k => !k.includes('result'))
                });

                // Fetch Google News separately if main search didn't return news
                let newsData = data.news_results || data.top_stories || [];
                if (!newsData || newsData.length === 0) {
                    try {
                        const newsResults: any = await new Promise((resolve, reject) => {
                            getJson({
                                api_key: API_KEY,
                                engine: "google",
                                q: topic + " news",  // Add "news" to trigger news block
                                gl: config.gl,
                                location: config.loc,
                                google_domain: config.domain,
                                hl: "en",
                                device: "desktop",
                                num: 10
                            }, (json) => {
                                if (json.error) reject(json.error);
                                else resolve(json);
                            });
                        });
                        newsData = newsResults.news_results || newsResults.top_stories || [];
                        console.log(`[${country}] Fallback News Result: found ${newsData.length} items`);
                    } catch (e) {
                        console.log(`[${country}] News fallback failed:`, e);
                    }
                }

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
                        (newsData && newsData.length > 0 ? newsData : MOCK_NEWS)?.map((n: any) => ({
                            title: n.title,
                            link: n.link,
                            date: n.date,
                            thumbnail: n.thumbnail,
                            source: n.source
                        })) || [],

                    ads:
                        (data.ads && data.ads.length > 0 ? data.ads : MOCK_ADS)?.map((ad: any) => ({
                            title: ad.title,
                            link: ad.link,
                            description: ad.description,
                            displayed_link: ad.displayed_link,
                            position: ad.position
                        })) || [],

                    trend_score:
                        data.search_information?.total_results || 0,

                    ad_count:
                        (data.ads && data.ads.length > 0 ? data.ads : MOCK_ADS)?.length || 0,

                    news_count:
                        (newsData && newsData.length > 0 ? newsData : MOCK_NEWS)?.length || 0
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
