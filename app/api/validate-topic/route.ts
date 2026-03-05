import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const ANALOGY_GROQ_KEY = process.env.GROQ_PERSONALIZATION_API_KEY;

    try {
        const { topic } = await req.json();

        if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
            return NextResponse.json({
                valid: false,
                reason: "Please enter a topic with at least 2 characters.",
                sampleAnalogy: "",
            });
        }

        const prompt = `You are a financial education expert. A user wants to learn about NPS (National Pension System) and retirement investing concepts through analogies from the world of "${topic.trim()}".

Evaluate whether investing/pension concepts (like compounding, risk allocation, regular contributions, annuity, tax benefits) can be meaningfully and clearly explained using analogies from "${topic.trim()}".

Reply with ONLY valid JSON, no markdown, no explanation outside JSON:
{
  "valid": true or false,
  "reason": "one sentence explaining why it works or doesn't work",
  "sampleAnalogy": "if valid=true, give one concrete example analogy (2-3 sentences). If valid=false, leave empty string."
}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        let response: Response;
        try {
            response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ANALOGY_GROQ_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 200,
                    temperature: 0.3,
                }),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            // Fail open — don't block the user
            return NextResponse.json({ valid: true, reason: "", sampleAnalogy: "" });
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content ?? "";

        // Parse the JSON from the model response
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({ valid: true, reason: "", sampleAnalogy: "" });
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
            valid: Boolean(parsed.valid),
            reason: parsed.reason ?? "",
            sampleAnalogy: parsed.sampleAnalogy ?? "",
        });
    } catch {
        // Network error / timeout / parse error — fail open
        return NextResponse.json({ valid: true, reason: "", sampleAnalogy: "" });
    }
}
