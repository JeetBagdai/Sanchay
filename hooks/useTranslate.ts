"use client";
import { useState, useEffect, useRef } from "react";
import { translateBatch } from "@/lib/translate";

/**
 * Translates an array of strings whenever `lang` changes.
 * Returns { translated, loading }
 * - translated: same array in the target language (or source while loading)
 * - loading: true while API calls are in flight
 */
export function useTranslateBatch(texts: string[], lang: string) {
    const [translated, setTranslated] = useState<string[]>(texts);
    const [loading, setLoading] = useState(false);
    const lastKey = useRef<string>("");

    useEffect(() => {
        if (texts.length === 0) return;
        const key = `${lang}::${texts.join("|").slice(0, 200)}`;
        if (key === lastKey.current) return;
        lastKey.current = key;

        if (lang === "en") {
            setTranslated(texts);
            return;
        }

        setLoading(true);
        setTranslated(texts); // show source text immediately while translating
        translateBatch(texts, lang).then(result => {
            setTranslated(result);
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang, texts.join("|")]);

    return { translated, loading };
}

/**
 * Translates a single string whenever `lang` changes.
 */
export function useTranslate(text: string, lang: string) {
    const { translated, loading } = useTranslateBatch([text], lang);
    return { translated: translated[0] ?? text, loading };
}
