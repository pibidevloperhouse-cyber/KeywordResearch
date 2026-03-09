import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Support separate API key for branding, fallback to main key
const GEMINI_API_KEY = process.env.BRANDING_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const MODEL_NAME = process.env.BRANDING_MODEL || "gemini-1.5-pro"; // Fallback if gemini-3 is not standard

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "Missing Branding Gemini API Key." }, { status: 500 });
    }

    try {
        const { blog_content } = await request.json();

        if (!blog_content) {
            return NextResponse.json({ error: "Blog content is required" }, { status: 400 });
        }

        // 3. Use Gemini 3 to match generated blog and score it
        const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Using 1.5 Pro as placeholder for 'gemini-3'

        const prompt = `
            Rate this blog on a scale 1-100 for brand alignment (Empathetic, Nurturing, Professional).
            Reference: https://www.astrokids.ai/blogs/vedic-astrology-child-mental-health
            
            Blog:
            ${blog_content.slice(0, 2000)} // Slice to save tokens
            
            JSON Output:
            - score (0-100)
            - feedback (one sentence)
            - strengths (list)
            - weaknesses (list)
            
            Output ONLY valid JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            analysis = { raw_output: text };
        }

        return NextResponse.json({
            status: "success",
            analysis
        });

    } catch (error: any) {
        console.error("Branding Agent Error:", error);
        return NextResponse.json({ error: "Failed to analyze blog for branding", details: error.message }, { status: 500 });
    }
}

