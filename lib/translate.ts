/**
 * Live translation service.
 * All calls go through our server-side /api/translate route, which tries
 * MyMemory → Lingva (two instances) in sequence. This avoids browser-IP
 * rate limits that caused 429 errors on the MyMemory free tier.
 *
 * Results are cached in sessionStorage so each unique string is only
 * translated once per session.
 */

const MEM_KEY = (text: string, lang: string) => `__tx__${lang}__${text}`;

function getCached(text: string, lang: string): string | null {
    try { return sessionStorage.getItem(MEM_KEY(text, lang)); }
    catch { return null; }
}

function setCached(text: string, lang: string, result: string) {
    try { sessionStorage.setItem(MEM_KEY(text, lang), result); }
    catch { /* storage full: silently skip */ }
}

/**
 * Translate a single string via the server route.
 * Returns the source string instantly as fallback if translation fails.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text || !text.trim() || targetLang === "en") return text;

    const cached = getCached(text, targetLang);
    if (cached !== null) return cached;

    try {
        const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts: [text], targetLang }),
        });
        if (!res.ok) return text;
        const data = await res.json();
        const result: string = data?.translations?.[0] ?? text;
        setCached(text, targetLang, result);
        return result;
    } catch {
        return text;
    }
}

/**
 * Translate an array of strings in one server round-trip (batched).
 * Returns translated array in the same order; falls back per-item on failure.
 */
export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    if (targetLang === "en") return texts;

    // Split into cached vs. uncached
    const results: string[] = new Array(texts.length);
    const toFetch: { idx: number; text: string }[] = [];

    texts.forEach((text, i) => {
        const cached = getCached(text, targetLang);
        if (cached !== null) {
            results[i] = cached;
        } else {
            toFetch.push({ idx: i, text });
        }
    });

    if (toFetch.length === 0) return results;

    try {
        const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts: toFetch.map(x => x.text), targetLang }),
        });
        if (!res.ok) {
            toFetch.forEach(({ idx, text }) => { results[idx] = text; });
            return results;
        }
        const data = await res.json();
        const translations: string[] = data?.translations ?? [];
        toFetch.forEach(({ idx, text }, i) => {
            const translated = translations[i] ?? text;
            results[idx] = translated;
            setCached(text, targetLang, translated);
        });
    } catch {
        toFetch.forEach(({ idx, text }) => { results[idx] = text; });
    }

    return results;
}
