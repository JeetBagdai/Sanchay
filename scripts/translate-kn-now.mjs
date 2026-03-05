import fs from 'fs';
import path from 'path';

const MYMEMORY_MAP = {
    brx: "hi", doi: "hi", kok: "mr", mai: "hi", mni: "bn", sa: "hi", sd: "ur",
};
const LINGVA_MAP = {
    brx: "hi", doi: "hi", kok: "mr", mai: "hi", mni: "bn", sa: "hi", sd: "ur",
    as: "as", bn: "bn", gu: "gu", hi: "hi", kn: "kn", ks: "ur",
    ml: "ml", mr: "mr", ne: "ne", or: "or", pa: "pa", ta: "ta", te: "te", ur: "ur",
};

async function myMemory(text, lang) {
    const apiLang = MYMEMORY_MAP[lang] ?? lang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${apiLang}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error("mm-fail");
    const data = await res.json();
    if (data?.responseStatus === 429) throw new Error("mm-429");
    const t = data?.responseData?.translatedText ?? "";
    if (!t || t === text) throw new Error("mm-empty");
    return t;
}

async function lingva(text, lang) {
    const apiLang = LINGVA_MAP[lang] ?? lang;
    const result = await Promise.any([
        (async () => {
            const res = await fetch(`https://lingva.ml/api/v1/en/${apiLang}/${encodeURIComponent(text)}`, { signal: AbortSignal.timeout(3000) });
            const d = await res.json();
            if (!d?.translation || d.translation === text) throw new Error();
            return d.translation;
        })(),
        (async () => {
            const res = await fetch(`https://translate.plausibility.cloud/api/v1/en/${apiLang}/${encodeURIComponent(text)}`, { signal: AbortSignal.timeout(3000) });
            const d = await res.json();
            if (!d?.translation || d.translation === text) throw new Error();
            return d.translation;
        })()
    ]);
    return result;
}

async function translateOne(text, lang) {
    try { return await myMemory(text, lang); } catch { /* fall through */ }
    try { return await lingva(text, lang); } catch { /* both failed */ }
    return text;
}

const NEW_KEYS = {};

const moduleKeysStr = fs.readFileSync(path.join(process.cwd(), 'context/module-keys.json'), 'utf8');
const moduleKeys = JSON.parse(moduleKeysStr);
Object.assign(NEW_KEYS, moduleKeys);

const localesDir = path.join(process.cwd(), "public/locales");
const files = ['kn.json'];

async function main() {
    for (const file of files) {
        const lang = file.replace('.json', '');
        console.log(`Translating for ${lang}...`);
        const filePath = path.join(localesDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let changed = false;

        for (const [k, v] of Object.entries(NEW_KEYS)) {
            if (!data[k]) {
                const t = await translateOne(v, lang);
                data[k] = t;
                changed = true;
                // Log progress
                console.log(`[${lang}] Translated ${k}`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                await new Promise(r => setTimeout(r, 200)); // Sleep to prevent rate-limit
            }
        }

        if (changed) {
            console.log(`Finished ${file}`);
        }
    }
    console.log("Done");
}

main().catch(console.error);
