import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "Missing Gemini API Key. Please add it to your .env.local" }, { status: 500 });
    }

    try {
        const { topic } = await request.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        // 1. Perform Research using SerpAPI (Simplified version for context)
        const searchResults: any = await new Promise((resolve, reject) => {
            getJson({
                api_key: SERPAPI_KEY,
                engine: "google",
                q: topic,
                gl: "in",
                hl: "en",
                num: 10
            }, (json) => {
                if (json.error) reject(json.error);
                else resolve(json);
            });
        });

        const contextData = {
            organic_results: searchResults.organic_results?.slice(0, 5).map((r: any) => ({
                title: r.title,
                snippet: r.snippet,
                link: r.link
            })),
            related_searches: searchResults.related_searches?.map((r: any) => r.query),
            related_questions: searchResults.related_questions?.map((q: any) => q.question)
        };

        // 2. Use Gemini to analyze research output and generate instruction JSON
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Analyze the following research data for the topic: "${topic}".
            
            Research Data:
            ${JSON.stringify(contextData, null, 2)}
            
            Generate a detailed instruction JSON for a writing agent to create a high-quality blog post.
            The JSON MUST include:
            - suggested_title: A catchy, SEO-friendly title.
            - structure: An array of sections (H2, H3) with brief points for each.
            - keywords: A list of primary and secondary keywords to include.
            - tone_and_style: Instructions to match an empathetic, professional, and informative tone (similar to astrokids.ai).
            - key_takeaways: What the reader should learn.
            - target_audience: Who this blog is for.
            
            Output ONLY the JSON object.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let instructions;
        try {
            instructions = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", text);
            instructions = { raw_output: text };
        }

        return NextResponse.json({
            status: "success",
            topic,
            research_context: contextData,
            instructions
        });

    } catch (error: any) {
        console.error("Research Agent Error:", error);
        return NextResponse.json({ error: "Failed to process research", details: error.message }, { status: 500 });
    }
}
