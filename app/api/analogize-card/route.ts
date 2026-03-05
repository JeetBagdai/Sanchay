import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LANG_NAMES: Record<string, string> = {
    as: "Assamese", bn: "Bengali", brx: "Bodo", doi: "Dogri",
    gu: "Gujarati", hi: "Hindi", kn: "Kannada", ks: "Kashmiri",
    kok: "Konkani", mai: "Maithili", ml: "Malayalam", mni: "Manipuri",
    mr: "Marathi", ne: "Nepali", or: "Odia", pa: "Punjabi",
    sa: "Sanskrit", sd: "Sindhi", ta: "Tamil", te: "Telugu", ur: "Urdu",
};

export async function POST(req: NextRequest) {
    const ANALOGY_GROQ_KEY = process.env.GROQ_PERSONALIZATION_API_KEY;

    let topic = "", cardType = "", title = "", content = "", targetLang = "en";
    try {
        const body = await req.json();
        topic = body.topic ?? "";
        cardType = body.cardType ?? "";
        title = body.title ?? "";
        content = body.content ?? "";
        targetLang = body.targetLang ?? "en";
    } catch {
        return NextResponse.json({ title, content });
    }

    if (!topic || !content) {
        return NextResponse.json({ title, content });
    }

    const langName = LANG_NAMES[targetLang];
    const langInstruction = langName
        ? `Write the output in ${langName} (not English).`
        : "";

    try {
        const prompt = cardType === "example"
            ? `Rewrite this NPS/investing example using an analogy from "${topic}". Keep the core message and any numbers, but replace characters/scenarios with ones from "${topic}". Keep it 2-4 sentences. ${langInstruction}
Return ONLY JSON: {"title": "short title (5 words max)", "content": "rewritten content"}`
            : `Rewrite this NPS/investing concept using analogies from "${topic}". Keep all financial facts and numbers accurate — only change the analogies used. Keep roughly the same length. ${langInstruction}
Return ONLY JSON: {"title": "short title (5 words max)", "content": "rewritten content"}`;

        const userMsg = `Original title: "${title}"\nOriginal content: "${content}"`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

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
                    messages: [{ role: "user", content: `${prompt}\n\n${userMsg}` }],
                    max_tokens: 500,
                    temperature: 0.5,
                }),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            return NextResponse.json({ title, content });
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content ?? "";

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return NextResponse.json({ title, content });

        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
            title: parsed.title ?? title,
            content: parsed.content ?? content,
        });
    } catch {
        return NextResponse.json({ title, content });
    }
}
