import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { messages, temperature = 0.7 } = await req.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ content: null, error: "No API key" }, { status: 200 });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages,
                max_tokens: 512,
                temperature,
            }),
        });

        if (!response.ok) {
            return NextResponse.json({ content: null, error: "Groq error" }, { status: 200 });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? null;
        return NextResponse.json({ content });
    } catch {
        return NextResponse.json({ content: null, error: "Server error" }, { status: 200 });
    }
}
