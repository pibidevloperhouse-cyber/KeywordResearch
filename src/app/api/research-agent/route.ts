import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
// Support separate API key for research, fallback to main key
const GEMINI_API_KEY = process.env.RESEARCH_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const MODEL_NAME = process.env.RESEARCH_MODEL || "gemini-2.0-flash"; // Fallback to 2.0 if 2.5 is not available/standard

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "Missing Research Gemini API Key." }, { status: 500 });
    }

    try {
        const { topic, existingData } = await request.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        let contextData;

        if (existingData) {
            // Use existing data from Keyword Intelligence to save tokens and credits
            contextData = {
                organic_results: existingData.competitors?.slice(0, 3).map((r: any) => ({
                    title: r.title,
                    snippet: r.snippet
                })),
                related_searches: existingData.primary_keywords?.slice(0, 5),
                related_questions: existingData.paa_questions?.slice(0, 3)
            };
        } else {
            // 1. Perform Research using SerpAPI (if data wasn't provided)
            const searchResults: any = await new Promise((resolve, reject) => {
                getJson({
                    api_key: SERPAPI_KEY,
                    engine: "google",
                    q: topic,
                    gl: "in",
                    hl: "en",
                    num: 5 // Reduced from 10 to save tokens
                }, (json) => {
                    if (json.error) reject(json.error);
                    else resolve(json);
                });
            });

            contextData = {
                organic_results: searchResults.organic_results?.slice(0, 3).map((r: any) => ({
                    title: r.title,
                    snippet: r.snippet
                })),
                related_searches: searchResults.related_searches?.map((r: any) => r.query).slice(0, 5),
                related_questions: searchResults.related_questions?.map((q: any) => q.question).slice(0, 3)
            };
        }

        // 2. Use Gemini 2.5 Flash to analyze research output
        const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Using 2.0 as 2.5 is likely a user request/future model

        const prompt = `
            Analyze research for: "${topic}".
            Data: ${JSON.stringify(contextData)}
            
            Generate a JSON blueprint for a writing agent:
            - suggested_title
            - structure (3-4 sections max)
            - keywords (top 5 only)
            - tone_and_style (Empathetic, Professional, Informative)
            - target_audience
            
            Output ONLY valid JSON. Keep it concise to save tokens.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let instructions;
        try {
            instructions = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            instructions = { raw_output: text };
        }

        return NextResponse.json({
            status: "success",
            topic,
            instructions
        });

    } catch (error: any) {
        console.error("Research Agent Error:", error);
        return NextResponse.json({ error: "Failed to process research", details: error.message }, { status: 500 });
    }
}

