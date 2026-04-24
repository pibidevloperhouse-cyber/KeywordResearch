import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(request: Request) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const MODEL_NAME = process.env.RESEARCH_MODEL || "llama-3.3-70b-versatile";

    if (!GROQ_API_KEY) {
        return NextResponse.json({ error: "Missing Groq API Key (GROQ_API_KEY)." }, { status: 500 });
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

        // 2. Use Groq (Llama 3) to analyze research output
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

        const groqResponse = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: "You are a helpful research assistant that outputs ONLY valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1, // Lower temperature for more consistent JSON
                response_format: { type: "json_object" }
            }),
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            throw new Error(`Groq API Error: ${errorText}`);
        }

        const data = await groqResponse.json();
        const text = data.choices?.[0]?.message?.content || "{}";

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

