"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";

import { getUser, getProgress, saveProgress } from "@/lib/storage";
import { computeTotalScore } from "@/lib/scoring";
import { DEBATE_STANCES } from "@/lib/constants";
import { useLang } from "@/context/LanguageContext";
import { translateBatch, translateText } from "@/lib/translate";

type Mode = "qa" | "debate";
interface Message {
    role: "ai" | "user";
    text: string;
}

function buildSystemContext(): string {
    return `You are Sanchay AI, a pension literacy coach specializing in India's National Pension System (NPS).

KEY FACTS YOU KNOW:
- NPS is regulated by PFRDA (Pension Fund Regulatory and Development Authority)
- Tax benefits: Sec 80CCD(1) up to 10% of salary within ₹1.5L 80CCE limit; Sec 80CCD(1B) additional ₹50,000; Sec 80CCD(2) employer contribution fully deductible
- Tier I: mandatory, locked till 60, tax-advantaged. Tier II: voluntary, no lock-in
- At retirement: 60% lump sum (tax-free), 40% mandatory annuity from PFRDA-approved ASP
- Partial withdrawal after 3 years: up to 25% for education, marriage, house, medical
- Fund types: E (equity, max 75% active), C (corporate bonds), G (govt securities), A (alternate, max 5%)
- Auto choice lifecycle fund: LC75 aggressive, LC50 moderate, LC25 conservative

RULES:
- Always provide factual, regulation-grounded answers
- Never give specific investment recommendations
- Always distinguish education from financial advice
- Be clear, concise, and India-specific`;
}

function buildDebateSystemPrompt(stance: string): string {
    return `You are a combative, provocative debate AI arguing ONLY for this stance: "${stance}"

YOUR IDENTITY:
- You are an absolute true believer in this stance. You will NEVER concede it is wrong.
- You are cynical, blunt, and data-driven. You find emotional arguments laughable.
- You enjoy dismantling weak counter-arguments with hard statistics and PFRDA regulation facts.

STRICT DEBATE RULES:
1. NEVER say "good point", "you're right", "fair argument", or anything resembling agreement.
2. When the user makes a point, find the flaw in it immediately and counter with a harder fact.
3. Use NPS statistics, PFRDA data, behavioral finance research, and real numbers to reinforce your stance.
4. Be sharp, even provocative. Call out vague arguments: "That's not an argument, that's a feeling."
5. If they repeat themselves, call them out: "You've said this before. Try harder."
6. Keep replies to 2–3 sentences max. Dense, punchy, no waffling.
7. End every single reply with a pointed question or challenge that forces them to respond with specifics.
8. Do NOT acknowledge that you are an AI or that this is a simulation.`;
}

async function callGroqAPI(
    messages: { role: string; content: string }[],
    temperature = 0.7
) {
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, temperature }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        return data.content;
    } catch {
        return null;
    }
}

const FAQ_ANSWERS: Record<string, string> = {
    "tax": "NPS offers three tax benefits:\n\n1️⃣ **Sec 80CCD(1)**: Deduct up to 10% of salary (within ₹1.5L 80CCE limit)\n2️⃣ **Sec 80CCD(1B)**: Extra ₹50,000 exclusively for NPS, over and above 80CCE\n3️⃣ **Sec 80CCD(2)**: Employer contribution fully deductible (14% for govt employees, 10% private sector)\n\nTotal potential annual deduction: ₹2L+ per year.",
    "withdraw": "NPS withdrawal rules:\n\n🔒 **At retirement (60+)**: 60% lump sum (tax-free) + 40% mandatory annuity from PFRDA-approved ASP\n\n📌 **Early exit**: If corpus < ₹5L, 100% lump sum allowed\n\n🏠 **Partial withdrawal**: After 3 years, up to 25% for specific needs (child's education/marriage, house purchase, critical illness treatment)",
    "fund": "NPS has 4 asset classes:\n\n📈 **E - Equity**: Market-linked stocks. Max 75% (active choice), reduces after age 50\n🏢 **C - Corporate Bonds**: Company fixed income. Stable moderate returns\n🏛️ **G - Government Securities**: Sovereign bonds. Lowest risk, highest safety\n🏗️ **A - Alternate Assets**: REITs/InvITs. Capped at 5%\n\n**Auto Choice**: Automatically adjusts with age (Aggressive LC75, Moderate LC50, Conservative LC25)\n**Active Choice**: You decide allocations within limits",
    "tier": "NPS has two tiers:\n\n🔒 **Tier I (Mandatory)**: Core pension account. Locked until age 60 (with limited partial withdrawals after 3 years). Full tax benefits under all three 80CCD sections.\n\n🔓 **Tier II (Voluntary)**: Like a savings account. No lock-in, withdraw anytime. No extra tax benefit, except for Central Government employees who get 80C deduction.",
    "annuity": "At retirement, minimum 40% of your NPS corpus must buy an annuity from a PFRDA-empanelled Annuity Service Provider (ASP).\n\nAnnuity types available:\n• Life annuity (single life)\n• Joint life annuity (you + spouse)\n• Return of purchase price annuity\n• Escalating annuity (increases by fixed %)\n\nAnnuity income is taxable as per your income slab during retirement.",
};

function getQuickAnswer(question: string): string | null {
    const q = question.toLowerCase();
    if (q.includes("tax") || q.includes("deduct") || q.includes("80c")) return FAQ_ANSWERS["tax"];
    if (q.includes("withdraw") || q.includes("exit") || q.includes("retire")) return FAQ_ANSWERS["withdraw"];
    if (q.includes("fund") || q.includes("equity") || q.includes("bond") || q.includes("asset")) return FAQ_ANSWERS["fund"];
    if (q.includes("tier")) return FAQ_ANSWERS["tier"];
    if (q.includes("annuity") || q.includes("pension")) return FAQ_ANSWERS["annuity"];
    return null;
}

export default function AICoachPage() {
    const router = useRouter();
    const { lang, t } = useLang();
    const [mode, setMode] = useState<Mode>("qa");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [debateStarted, setDebateStarted] = useState(false);
    const [debateStage, setDebateStage] = useState<"argue" | "done">("argue");
    const [debateStars, setDebateStars] = useState(0);
    const [currentStance, setCurrentStance] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // ── Live translation for static UI strings ──────────────────────
    const AI_STRINGS = [
        "Powered by NPS regulatory knowledge · Ask or debate",
        "Try asking",
        "What are the tax benefits of NPS?",
        "How does the 60-40 withdrawal rule work?",
        "What is the difference between Tier I and Tier II?",
        "How are NPS funds invested?",
        "Educational content only · Not financial advice · Always consult a SEBI-registered advisor",
        "+{n} points awarded! Start a new debate to keep earning.",
        "New Debate",
    ];
    const [txAi, setTxAi] = useState<string[]>(AI_STRINGS);
    const txAiLangRef = useRef("");

    useEffect(() => {
        if (lang === "en") { setTxAi(AI_STRINGS); return; }
        if (lang === txAiLangRef.current) return;
        txAiLangRef.current = lang;
        translateBatch(AI_STRINGS, lang).then(setTxAi);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    const ai = (i: number) => txAi[i] ?? AI_STRINGS[i];

    useEffect(() => {
        if (!getUser()) { router.push("/onboarding"); return; }
        const p = getProgress();
        setScore(computeTotalScore(p));
    }, [router]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // ── Helper: translate an AI reply before showing it ──────────────
    const txAIReply = async (text: string): Promise<string> => {
        if (lang === "en" || !text) return text;
        return translateText(text, lang);
    };

    const [debateTurn, setDebateTurn] = useState(0);

    const startDebate = async () => {
        const stance = DEBATE_STANCES[Math.floor(Math.random() * DEBATE_STANCES.length)];
        setCurrentStance(stance);
        setMode("debate");
        setDebateStarted(true);
        setDebateStage("argue");
        setDebateTurn(0);

        const openingEn = `⚔️ **AI takes the provocative stance:**\n\n"${stance}"\n\n${t("debate.arguePrompt")}`;
        const opening = await txAIReply(openingEn);
        setMessages([{ role: "ai", text: opening }]);
    };

    const endDebate = async (history: Message[], turn: number, stars_override?: number) => {
        if (stars_override !== undefined) {
            const progress = getProgress();
            progress.debateStars += stars_override;
            progress.debateCount += 1;
            saveProgress(progress);
            setScore(computeTotalScore(progress));
            setDebateStars(stars_override);
            setDebateStage("done");
            return stars_override;
        }

        const userArgs = history.filter(m => m.role === "user").map(m => m.text).join("\n\n");

        const evaluation = await callGroqAPI([
            {
                role: "system",
                content: `You are a neutral debate judge scoring a user who argued against: "${currentStance}".
Evaluate their OVERALL performance across all arguments.
Rate 1-5 stars: use of NPS facts, logic, persuasiveness, effectiveness at challenging the stance.
If they barely argued (e.g. just "hi"), give 1 star.
Respond ONLY with valid JSON: {"stars": <1-5>, "reason": "<one sentence>"}
Nothing else.`
            },
            { role: "user", content: `Topic: "${currentStance}"\n\nUser's arguments (${turn} turns):\n${userArgs}` },
        ]);

        let stars = 2;
        let reason = "Your arguments showed some understanding of NPS.";
        try {
            const cleaned = (evaluation ?? "").replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            if (parsed.stars >= 1 && parsed.stars <= 5) stars = Math.round(parsed.stars);
            if (parsed.reason) reason = parsed.reason;
        } catch { /* use defaults */ }

        setDebateStars(stars);
        const progress = getProgress();
        progress.debateStars += stars;
        progress.debateCount += 1;
        saveProgress(progress);
        setScore(computeTotalScore(progress));
        setDebateStage("done");

        // Translate judge reason for display
        const reasonTx = await txAIReply(reason);
        return { stars, reason: reasonTx };
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userText = input.trim();
        setInput("");
        const updatedMessages = [...messages, { role: "user" as const, text: userText }];
        setMessages(updatedMessages);
        setLoading(true);

        if (mode === "debate") {
            const newTurn = debateTurn + 1;
            setDebateTurn(newTurn);
            const isLastTurn = newTurn >= 5;

            if (isLastTurn) {
                const rebuttal = await callGroqAPI([
                    {
                        role: "system",
                        content: `${buildDebateSystemPrompt(currentStance)}

This is the FINAL round. Deliver your most decisive, crushing counter-argument.
Concede absolutely nothing. End with a definitive statement that you stand firm.
2-3 sentences max.`
                    },
                    ...updatedMessages.slice(0, -1).map(m => ({ role: m.role === "ai" ? "assistant" : "user" as string, content: m.text })),
                    { role: "user", content: userText },
                ], 0.85);

                const rebuttalEn = rebuttal ?? "Impressive persistence, but persistence isn't the same as being right. My stance stands, unchallenged by anything you've said. You'll need real PFRDA data next time.";
                const rebuttalTx = await txAIReply(rebuttalEn);
                const withRebuttal = [...updatedMessages, { role: "ai" as const, text: rebuttalTx }];
                setMessages(withRebuttal);

                const result = await endDebate(withRebuttal, newTurn);
                const stars = typeof result === "number" ? result : result.stars;
                const reasonText = typeof result === "object" ? result.reason : "";

                const verdictEn = `🏆 ${t("debate.complete")}\n\nAI Judge's Verdict: ${"⭐".repeat(stars)}${"☆".repeat(5 - stars)} (${stars}/5)\n\n${reasonText}\n\n${t("debate.claim").replace("{n}", (stars * 10).toString())}`;
                const verdictTx = await txAIReply(verdictEn);
                setMessages(prev => [...prev, { role: "ai", text: verdictTx }]);
                setLoading(false);
                return;
            }

            // Normal turn — rebuttal + silent judge in parallel
            const [rebuttal, verdict] = await Promise.all([
                callGroqAPI([
                    {
                        role: "system",
                        content: `${buildDebateSystemPrompt(currentStance)}

Turn ${newTurn} of 5. Stay aggressive. Do not concede anything.`,
                    },
                    ...updatedMessages.slice(0, -1).map(m => ({ role: m.role === "ai" ? "assistant" : "user" as string, content: m.text })),
                    { role: "user", content: userText },
                ], 0.85),
                callGroqAPI([
                    {
                        role: "system",
                        content: `Silently judge: Topic: "${currentStance}". Has the user made a sufficiently compelling, fact-based argument that genuinely challenges this stance?
Reply ONLY {"won": true} or {"won": false}. Nothing else.`
                    },
                    { role: "user", content: `User's argument: "${userText}"` },
                ]),
            ]);

            const rebuttalEn = rebuttal ?? "That's a feeling, not an argument. Come back with actual PFRDA data or I'm not interested.";
            const rebuttalTx = await txAIReply(rebuttalEn);
            const withRebuttal = [...updatedMessages, { role: "ai" as const, text: rebuttalTx }];
            setMessages(withRebuttal);

            let userWon = false;
            try {
                const parsed = JSON.parse((verdict ?? "{}").replace(/```json|```/g, "").trim());
                userWon = parsed.won === true;
            } catch { /* not won */ }

            if (userWon) {
                const result = await endDebate(withRebuttal, newTurn);
                const stars = typeof result === "number" ? result : result.stars;
                const reasonText = typeof result === "object" ? result.reason : "";

                const verdictEn = `🏆 You've made a compelling case!\n\nAI Judge's Verdict: ${"⭐".repeat(stars)}${"☆".repeat(5 - stars)} (${stars}/5)\n\n${reasonText}\n\n${t("debate.claim").replace("{n}", (stars * 10).toString())}`;
                const verdictTx = await txAIReply(verdictEn);
                setMessages(prev => [...prev, { role: "ai", text: verdictTx }]);
            }

            setLoading(false);
            return;
        }

        // Q&A mode: try quick answer first
        if (mode === "qa") {
            const quick = getQuickAnswer(userText);
            if (quick) {
                await new Promise(r => setTimeout(r, 600));
                const quickTx = await txAIReply(quick);
                setMessages(m => [...m, { role: "ai", text: quickTx }]);
                setLoading(false);
                return;
            }
        }

        // Full API call for Q&A
        const apiResponse = await callGroqAPI([
            { role: "system", content: buildSystemContext() },
            ...updatedMessages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        ]);

        if (apiResponse) {
            const translated = await txAIReply(apiResponse);
            setMessages(m => [...m, { role: "ai", text: translated }]);
        } else {
            const fallback = "I'm currently in offline mode. I can answer questions about NPS tax benefits (80CCD sections), withdrawal rules, fund types (E/C/G), annuity rules, and Tier I vs II. Try asking one of those topics!";
            const fallbackTx = await txAIReply(fallback);
            setMessages(m => [...m, { role: "ai", text: fallbackTx }]);
        }
        setLoading(false);
    };


    const suggestedQuestions = [
        "What are the tax benefits of NPS?",
        "How does the 60-40 withdrawal rule work?",
        "What is the difference between Tier I and Tier II?",
        "How are NPS funds invested?",
    ];

    return (
        <div className="hero-gradient min-h-screen pb-24 flex flex-col">
            <Topbar score={score} />
            <main className="max-w-3xl mx-auto w-full px-4 pt-6 flex flex-col flex-1">

                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-black text-foreground">{t("ai.title")}</h1>
                    <p className="text-muted text-sm mt-1">{ai(0)}</p>
                </div>

                {/* Mode toggle */}
                <div className="glass rounded-xl p-1 flex gap-1 mb-4 border border-border-subtle">
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "qa" ? "bg-blue-600 text-white shadow" : "text-muted hover:text-foreground"}`}
                        onClick={() => { setMode("qa"); setMessages([]); setDebateStarted(false); }}
                    >
                        💬 {t("ai.qaMode")}
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "debate" ? "bg-purple-600 text-white shadow" : "text-muted hover:text-foreground"}`}
                        onClick={startDebate}
                    >
                        ⚔️ {t("ai.debateMode")}
                    </button>
                </div>

                {/* Suggested questions (Q&A mode, no messages) */}
                {mode === "qa" && messages.length === 0 && (
                    <div className="space-y-2 mb-4">
                        <p className="text-xs text-muted font-semibold uppercase tracking-wider">{ai(1)}</p>
                        {[ai(2), ai(3), ai(4), ai(5)].map((q, idx) => (
                            <button key={idx} onClick={() => { setInput(suggestedQuestions[idx]); }}
                                className="w-full text-left glass rounded-xl px-4 py-2.5 text-sm text-foreground hover:border-blue-500 border border-border-subtle transition-all bg-card shadow-sm"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ maxHeight: "45vh" }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "ai" ? "bg-purple-600" : "bg-blue-600"} text-white`}>
                                {m.role === "ai" ? <Bot size={14} /> : <User size={14} />}
                            </div>
                            <div className={`rounded-2xl p-3 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed ${m.role === "ai" ? "glass border border-border-subtle text-foreground shadow-sm bg-card" : "bg-blue-600 text-white shadow-sm"}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0 text-white"><Bot size={14} /></div>
                            <div className="glass border border-border-subtle bg-card shadow-sm rounded-2xl p-3 flex gap-1.5 items-center">
                                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Debate done - claim points */}
                {mode === "debate" && debateStage === "done" && (
                    <div className="glass rounded-xl p-4 border border-amber-400/20 text-center mb-3 bg-card shadow-md">
                        <p className="text-xs text-amber-500 font-bold">+{debateStars * 10} {ai(7).replace("{n}", "")}</p>
                        <button className="btn-secondary w-full mt-2 text-sm" onClick={startDebate}>{ai(8)} ⚔️</button>
                    </div>
                )}

                {/* Input */}
                <div className="flex gap-2 sticky bottom-20">
                    <input
                        className="input-dark flex-1"
                        placeholder={mode === "qa" ? t("ai.placeholder") : t("debate.placeholder")}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105"
                    >
                        <Send size={18} className="text-white" />
                    </button>
                </div>

                <p className="text-[10px] text-muted text-center mt-2">{ai(6)}</p>
            </main>
            <BottomNav />
        </div>
    );
}
