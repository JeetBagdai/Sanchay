import { NextRequest, NextResponse } from "next/server";

const MYMEMORY_MAP: Record<string, string> = {
    brx: "hi", doi: "hi", kok: "mr", mai: "hi", mni: "bn", sa: "hi", sd: "ur",
};
const LINGVA_MAP: Record<string, string> = {
    brx: "hi", doi: "hi", kok: "mr", mai: "hi", mni: "bn", sa: "hi", sd: "ur",
    as: "as", bn: "bn", gu: "gu", hi: "hi", kn: "kn", ks: "ur",
    ml: "ml", mr: "mr", ne: "ne", or: "or", pa: "pa", ta: "ta", te: "te", ur: "ur",
};

async function myMemory(text: string, lang: string): Promise<string> {
    const apiLang = MYMEMORY_MAP[lang] ?? lang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${apiLang}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("mm-fail");
    const data = await res.json();
    if (data?.responseStatus === 429) throw new Error("mm-429");
    const t: string = data?.responseData?.translatedText ?? "";
    if (!t || t === text) throw new Error("mm-empty");
    return t;
}

async function lingva(text: string, lang: string): Promise<string> {
    const apiLang = LINGVA_MAP[lang] ?? lang;
    const result = await Promise.any([
        (async () => {
            const res = await fetch(
                `https://lingva.ml/api/v1/en/${apiLang}/${encodeURIComponent(text)}`,
                { signal: AbortSignal.timeout(2500) }
            );
            if (!res.ok) throw new Error();
            const d = await res.json();
            if (!d?.translation || d.translation === text) throw new Error();
            return d.translation as string;
        })(),
        (async () => {
            const res = await fetch(
                `https://translate.plausibility.cloud/api/v1/en/${apiLang}/${encodeURIComponent(text)}`,
                { signal: AbortSignal.timeout(2500) }
            );
            if (!res.ok) throw new Error();
            const d = await res.json();
            if (!d?.translation || d.translation === text) throw new Error();
            return d.translation as string;
        })(),
    ]);
    return result;
}

async function translateOne(text: string, lang: string): Promise<string> {
    if (!text.trim()) return text;
    // Try MyMemory first (saves Lingva quota).
    // Only fall back to Lingva if MyMemory is slow / rate-limited.
    try {
        return await myMemory(text, lang);
    } catch { /* fall through to Lingva */ }
    try {
        return await lingva(text, lang);
    } catch { /* both failed */ }
    return text;
}

export async function POST(req: NextRequest) {
    let texts: string[] = [];
    let targetLang = "";
    try {
        const body = await req.json();
        texts = body.texts ?? [];
        targetLang = body.targetLang ?? "";
    } catch {
        return NextResponse.json({ translations: [] });
    }

    if (!texts.length || !targetLang || targetLang === "en") {
        return NextResponse.json({ translations: texts });
    }

    // All strings in parallel — the speed gain without doubling API calls
    const translations = await Promise.all(texts.map(t => translateOne(t, targetLang)));
    return NextResponse.json({ translations });
}
