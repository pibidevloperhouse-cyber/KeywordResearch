import { NextResponse } from 'next/server';

const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || "http://localhost:11434/v1/chat/completions";

export async function POST(request: Request) {
    try {
        const { instructions } = await request.json();

        if (!instructions) {
            return NextResponse.json({ error: "Instructions are required" }, { status: 400 });
        }

        const prompt = `
            You are a professional blog writer. Your task is to write a high-quality blog post based on the following instructions:
            
            Instructions:
            ${JSON.stringify(instructions, null, 2)}
            
            IMPORTANT: Follow the tone and formatting of "https://www.astrokids.ai/blogs/vedic-astrology-child-mental-health".
            - Tone: Empathetic, Nurturing, Informative, Professional, Supportive, Reassuring.
            - Structure: Clear headings (H1, H2, H3), bullet points for signs/symptoms/challenges, tables for complex data or remedies.
            - Focus: Provide actionable insights for parents/readers.
            - Language: Use supportive language like "Parenting becomes easier when we understand, not judge."
            - Formatting: Use Markdown for headers, bold text for key terms, and standard bulleted lists. Use a table if relevant (e.g., Issue vs Remedy).
            
            Write the complete blog post now.
        `;

        const response = await fetch(LOCAL_LLM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "mistral", // Assuming Mistral 7B is named 'mistral' in Ollama
                messages: [
                    { role: "system", content: "You are a professional blog writer specializing in empathetic and informative content." },
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
