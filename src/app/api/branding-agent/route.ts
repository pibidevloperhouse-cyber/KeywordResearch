import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "Missing Gemini API Key. Please add it to your .env.local" }, { status: 500 });
    }

    try {
        const { blog_content, target_tone } = await request.json();

        if (!blog_content) {
            return NextResponse.json({ error: "Blog content is required" }, { status: 400 });
        }

        // 3. Use Gemini to match generated blog and score it (1-100)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Rate the following blog article on a scale of 1 to 100 based on its brand tone and alignment with the target reference: "https://www.astrokids.ai/blogs/vedic-astrology-child-mental-health".
            
            Target Tone to match: Empathetic, Nurturing, Informative, Professional, Supportive, Reassuring. 
            
            Blog Article:
            ${blog_content}
            
            Provide the following in JSON format:
            - score: A number between 1 and 100.
            - feedback: A short explanation of the score.
            - strengths: What worked well.
            - weaknesses: Areas for improvement.
            
            Output ONLY the JSON object.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", text);
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
