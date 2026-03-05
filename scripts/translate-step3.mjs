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

const NEW_KEYS = {
    "module.0.title": "NPS Basics",
    "module.0.desc": "What is NPS, who manages it, and how it works",
    "module.1.title": "Power of Compounding",
    "module.1.desc": "Why starting early is the single biggest factor in retirement wealth",
    "module.2.title": "Tax Benefits",
    "module.2.desc": "How NPS saves you up to ₹2L in taxes every year",
    "module.3.title": "Asset Allocation",
    "module.3.desc": "E, C, G funds and how to choose between Auto and Active choice",
    "module.4.title": "Withdrawal Rules",
    "module.4.desc": "The 60-40 rule and what happens at retirement",
    "module.5.title": "Behavioral Traps",
    "module.5.desc": "The psychological biases that destroy retirement wealth",
    "module.start": "Start",
    "modules.title": "Pension Mastery",
    "modules.completed": "completed",
    "modules.unlockMsg": "Unlock simulation after 3",
    "modules.progress": "Overall Progress",
    "modules.simUnlocked": "Simulation Unlocked!",
    "modules.simUnlockedDesc": "You have completed 3+ modules. The Delay Trap simulation is now available.",
    "modules.enterSim": "Enter Simulation",

    // Simulation
    "sim.params": "Simulation Parameters",
    "sim.startAge": "Starting Age",
    "sim.monthlyContrib": "Monthly Contribution",
    "sim.expectedReturn": "Expected Annual Return",
    "sim.decisionPoint": "Decision Point",
    "sim.end": "Simulation End",
    "sim.whatIf": "What if you stayed disciplined?",
    "sim.corpusNeverStop": "Corpus if you never stop contributing",
    "sim.startBtn": "Start Simulation",
    "sim.fastForward": "Fast-forwarding to Age 30...",
    "sim.growing": "Your corpus is growing steadily...",
    "sim.criticalDec": "Age 30: Critical Decision",
    "sim.lifeExp": "Life got expensive. New EMI, rising rent, lifestyle inflation. You've been contributing to NPS for 5 years. What do you do?",
    "sim.decision.contDesc": "Continue contributing. Discipline wins.",
    "sim.decision.redDesc": "Cut to 50%. Some discipline remains.",
    "sim.decision.stopDesc": "Pause completely. Let existing corpus grow passively.",
    "sim.growthTitle": "Corpus Growth: Age",
    "sim.labelCorpus": "Corpus",
    "sim.labelContrib": "Contributed",
    "sim.annuityNote": "40% annuity at 6%",
    "sim.vsAlways": "vs always continuing",
    "sim.retExpTitle": "Retirement Expenses at 60",
    "sim.monLiv": "Monthly Living (inflation adj.)",
    "sim.hlthEst": "Healthcare Estimate",
    "sim.totNeed": "Total Monthly Need",
    "sim.pensCov": "Pension covers expenses",
    "sim.surplus": "surplus",
    "sim.pensShort": "Pension shortfall",
    "sim.gap": "gap",
    "sim.behIns": "Behavioral Insight",
    "sim.ptsAwrd": "Simulation points awarded · Module 4 unlocked!",
};

const moduleKeysStr = fs.readFileSync(path.join(process.cwd(), 'context/module-keys.json'), 'utf8');
const moduleKeys = JSON.parse(moduleKeysStr);
Object.assign(NEW_KEYS, moduleKeys);

const localesDir = path.join(process.cwd(), "public/locales");
const priority = ['hi.json', 'ta.json', 'te.json', 'mr.json', 'bn.json', 'gu.json', 'ml.json', 'ur.json'];
const files = fs.readdirSync(localesDir)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => {
        const idxA = priority.indexOf(a);
        const idxB = priority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

async function main() {
    for (const file of files) {
        const lang = file.replace('.json', '');
        console.log(`Translating for ${lang}...`);
        const filePath = path.join(localesDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let changed = false;

        let count = 0;
        for (const [k, v] of Object.entries(NEW_KEYS)) {
            if (!data[k]) {
                const t = await translateOne(v, lang);
                data[k] = t;
                changed = true;
                count++;
                if (count % 5 === 0) {
                    console.log(`[${lang}] Translated ${count} new keys...`);
                }
                // Save immediately so UI gets it live
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
