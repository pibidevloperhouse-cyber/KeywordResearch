import { NextResponse } from 'next/server';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(request: Request) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const MODEL_NAME = process.env.BRANDING_MODEL || "llama-3.3-70b-versatile";

    if (!GROQ_API_KEY) {
        return NextResponse.json({ error: "Missing Groq API Key (GROQ_API_KEY)." }, { status: 500 });
    }

    try {
        const { blog_content } = await request.json();

        if (!blog_content) {
            return NextResponse.json({ error: "Blog content is required" }, { status: 400 });
        }

        const prompt = `
            Rate this blog on a scale 1-100 for brand alignment (Empathetic, Nurturing, Professional).
            Reference: https://www.astrokids.ai/blogs/vedic-astrology-child-mental-health
            
            Blog:
            ${blog_content.slice(0, 4000)}
            
            JSON Output:
            - score (0-100)
            - feedback (one sentence)
            - strengths (list)
            - weaknesses (list)
            
            Output ONLY valid JSON.
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
                    { role: "system", content: "You are a branding expert specializing in brand alignment analysis. Output ONLY valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            }),
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            throw new Error(`Groq API Error: ${errorText}`);
        }

        const data = await groqResponse.json();
        const text = data.choices?.[0]?.message?.content || "{}";

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


