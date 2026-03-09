import { NextResponse } from 'next/server';

const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || "http://localhost:11434/v1/chat/completions";

export async function POST(request: Request) {
    try {
        const { instructions } = await request.json();

        if (!instructions) {
            return NextResponse.json({ error: "Instructions are required" }, { status: 400 });
        }

        const prompt = `
            You are a professional blog writer (Mistral 7B).
            Task: Write a blog post based on these instructions.
            Instructions: ${JSON.stringify(instructions).slice(0, 1500)} // Slice to save tokens
            
            Style Reference: https://www.astrokids.ai/blogs/vedic-astrology-child-mental-health
            - Tone: Empathetic, Nurturing, Informative.
            - Format: H1, H2, H3, bullets, tables for remedies.
            
            Write the complete blog post now.
        `;

        const response = await fetch(LOCAL_LLM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "mistral", // Mistral 7B
                messages: [
                    { role: "system", content: "You are an empathetic professional blog writer." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                stream: false
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to call local LLM: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || data.response;

        return NextResponse.json({
            status: "success",
            blog_content: content
        });

    } catch (error: any) {
        console.error("Writing Agent Error:", error);
        return NextResponse.json({ error: "Failed to generate blog content", details: error.message }, { status: 500 });
    }
}

