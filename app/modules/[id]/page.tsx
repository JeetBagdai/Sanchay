"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, XCircle, BookOpen, Lightbulb, HelpCircle, Star, X, Languages, ArrowRight, Sparkles } from "lucide-react";
import { MODULES, DEBATE_STANCES } from "@/lib/constants";
import { getProgress, getUser, saveProgress } from "@/lib/storage";
import { computeTotalScore } from "@/lib/scoring";
import { useLang } from "@/context/LanguageContext";
import { useAnalogy } from "@/context/AnalogyContext";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Card = any;

/** Splits content into readable bullet points wherever possible */
function ContentRenderer({ text }: { text: string }) {
    // Split on: newlines, "(1)" / "(2)" style markers, or ". " before uppercase
    const raw = text
        .split(/\n+/)
        .flatMap(line =>
            // numbered markers like "(1) Foo. (2) Bar." → split on them
            line.split(/(?=\(\d+\)\s)/)
        )
        .flatMap(chunk =>
            // split on ". " before an uppercase letter (sentence boundary)
            chunk.split(/\.\s(?=[A-Z₹"(])/)
                .map(s => s.replace(/^\(?\d+\)?\s*/, "").trim())
                .filter(Boolean)
                .map((s, idx, arr) => idx < arr.length - 1 ? s + "." : s)
        )
        .filter(s => s.length > 2);

    if (raw.length < 3) {
        return (
            <p className="text-foreground text-base leading-[1.9]">{text}</p>
        );
    }

    return (
        <ul className="space-y-4">
            {raw.map((point, i) => (
                <li key={i} className="flex gap-3 items-start">
                    <span className="mt-[6px] shrink-0 w-2 h-2 rounded-full bg-amber-400 opacity-80" />
                    <span className="text-foreground text-base leading-[1.8]">{point}</span>
                </li>
            ))}
        </ul>
    );
}

function DebateModal({ stance, onClose, onRate }: {
    stance: string;
    onClose: () => void;
    onRate: (stars: number) => void;
}) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
        { role: "ai", text: `⚔️ AI Stance:\n\n"${stance}"\n\nDo you agree or disagree? Argue your position — I'll push back with facts!` }
    ]);
    const [input, setInput] = useState("");
    const [stage, setStage] = useState<"argue" | "done">("argue");
    const [aiStars, setAiStars] = useState(0);
    const [loading, setLoading] = useState(false);
    const [turnCount, setTurnCount] = useState(0);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const callAPI = async (msgs: { role: string; content: string }[]) => {
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: msgs }),
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.content ?? null;
        } catch { return null; }
    };

    const endDebate = async (history: { role: "ai" | "user"; text: string }[], turn: number) => {
        // Build full conversation for evaluation
        const userArgs = history.filter(m => m.role === "user").map(m => m.text).join("\n\n");
        const evaluation = await callAPI([
            {
                role: "system",
                content: `You are a neutral debate judge scoring a user who argued against this stance: "${stance}".
Evaluate their OVERALL performance across all their arguments.
Rate 1-5 stars based on: use of NPS facts, logical structure, persuasiveness, and how effectively they challenged the stance.
If they barely argued (e.g. just said "hi"), give 1 star.
Respond ONLY with valid JSON: {"stars": <1-5>, "reason": "<one sentence>"}
Nothing else.`
            },
            { role: "user", content: `Debate topic: "${stance}"\n\nUser's arguments (${turn} turn${turn !== 1 ? "s" : ""}):\n${userArgs}` },
        ]);

        let stars = 2;
        let reason = "Your arguments showed some understanding of NPS.";
        try {
            const cleaned = (evaluation ?? "").replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            if (parsed.stars >= 1 && parsed.stars <= 5) stars = Math.round(parsed.stars);
            if (parsed.reason) reason = parsed.reason;
        } catch { /* use defaults */ }

        setAiStars(stars);
        return { stars, reason };
    };

    const handleSubmit = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput("");
        const newTurn = turnCount + 1;
        setTurnCount(newTurn);

        const newMessages = [...messages, { role: "user" as const, text: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        const isLastTurn = newTurn >= 5;

        if (isLastTurn) {
            // Final turn: get rebuttal then evaluate
            const rebuttal = await callAPI([
                {
                    role: "system",
                    content: `You are a provocative debate AI. Your stance: "${stance}". This is the final round of debate.
Respond to the user's argument in 2-3 sentences, acknowledge any valid points they made, but stay firm in your stance unless they've truly disproven you.`
                },
                ...newMessages.slice(0, -1).map(m => ({
                    role: m.role === "ai" ? "assistant" : "user" as string,
                    content: m.text
                })),
                { role: "user", content: userMsg },
            ]);

            const rebuttalText = rebuttal ?? "You've made some interesting points across this debate. I'll grudgingly admit some have merit, but my core stance remains. Well argued though!";
            const withRebuttal = [...newMessages, { role: "ai" as const, text: rebuttalText }];
            setMessages(withRebuttal);

            const { stars, reason } = await endDebate(withRebuttal, newTurn);
            setMessages(prev => [...prev, {
                role: "ai",
                text: `🏆 Debate Over!\n\nAI Judge's Verdict: ${"⭐".repeat(stars)}${"☆".repeat(5 - stars)} (${stars}/5)\n\n${reason}\n\nYou earned ${stars * 10} points!`
            }]);
            setStage("done");
            setLoading(false);
            return;
        }

        // Normal turn: get rebuttal; silently check if user is winning
        const [rebuttal, verdict] = await Promise.all([
            callAPI([
                {
                    role: "system",
                    content: `You are a provocative debate AI. Your stance: "${stance}".
The user is arguing against you. Reply in 2-3 sharp, fact-based sentences that directly address their specific point.
If their argument is weak or off-topic, challenge them to be more specific.
If they make a genuinely strong point, acknowledge it briefly but stay firm.
Do NOT end the debate yourself — keep engaging.`
                },
                ...newMessages.slice(0, -1).map(m => ({
                    role: m.role === "ai" ? "assistant" : "user" as string,
                    content: m.text
                })),
                { role: "user", content: userMsg },
            ]),
            callAPI([
                {
                    role: "system",
                    content: `You are silently judging a debate. The topic is: "${stance}".
Has the user made a sufficiently compelling, fact-based argument that genuinely challenges this stance?
Reply ONLY with {"won": true} or {"won": false}. Nothing else.`
                },
                { role: "user", content: `User's latest argument: "${userMsg}"` },
            ]),
        ]);

        const rebuttalText = rebuttal ?? "You'll need more than that to convince me. Bring specific NPS data or regulatory facts!";
        const withRebuttal = [...newMessages, { role: "ai" as const, text: rebuttalText }];
        setMessages(withRebuttal);

        // Check if user won
        let userWon = false;
        try {
            const parsed = JSON.parse((verdict ?? "{}").replace(/```json|```/g, "").trim());
            userWon = parsed.won === true;
        } catch { /* not won */ }

        if (userWon) {
            const { stars, reason } = await endDebate(withRebuttal, newTurn);
            setMessages(prev => [...prev, {
                role: "ai",
                text: `🏆 You've made a compelling case!\n\nAI Judge's Verdict: ${"⭐".repeat(stars)}${"☆".repeat(5 - stars)} (${stars}/5)\n\n${reason}\n\nYou earned ${stars * 10} points!`
            }]);
            setStage("done");
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-card border-x border-border-subtle flex flex-col">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
                    <div>
                        <p className="font-bold text-foreground text-base">⚔️ AI Pension Debate</p>
                        <p className="text-xs text-muted mt-0.5">
                            {stage === "argue" ? `Turn ${turnCount}/5 — Argue until you convince me!` : "Debate complete!"}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-foreground p-1 rounded-lg hover:bg-foreground/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* ── Message feed — grows to fill remaining height ── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`rounded-2xl px-4 py-3 text-sm max-w-[88%] ${m.role === "ai"
                                ? "bg-purple-500/10 border border-purple-500/20 text-slate-300 mr-auto"
                                : "bg-blue-600/20 border border-blue-500/30 text-white ml-auto"
                                }`}
                        >
                            <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                        </div>
                    ))}
                    {loading && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl px-4 py-3 flex gap-1.5 items-center w-fit">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* ── Input bar ── */}
                <div className="shrink-0 border-t border-border-subtle px-4 py-3 bg-card">
                    {stage === "argue" ? (
                        <div className="flex gap-2 items-end">
                            <textarea
                                className="input-dark flex-1 resize-none text-sm min-h-[44px] max-h-32"
                                rows={1}
                                placeholder="Make your argument with facts..."
                                value={input}
                                onChange={e => {
                                    setInput(e.target.value);
                                    // auto-grow
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                                }}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                            />
                            <button
                                className="btn-primary px-5 py-2.5 text-sm shrink-0"
                                onClick={handleSubmit}
                                disabled={!input.trim() || loading}
                            >
                                Send
                            </button>
                        </div>
                    ) : (
                        <button className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2" onClick={() => { onRate(aiStars); onClose(); }}>
                            Claim {aiStars * 10} Points <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


export default function ModulePage() {
    const params = useParams();
    const router = useRouter();
    const moduleId = Number(params.id);
    const mod = MODULES[moduleId];

    const [cardIndex, setCardIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [quizPointsEarned, setQuizPointsEarned] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const [showDebate, setShowDebate] = useState(false);

    // ── Analogy personalization ───────────────────────────────────────
    const { analogyTopic } = useAnalogy();
    // Cache key = `${cardIndex}__${lang}` so language changes bust the cache
    const analogyCache = useRef<Record<string, { title: string; content: string }>>({});
    const [analogyContent, setAnalogyContent] = useState<{ title: string; content: string } | null>(null);
    const [analogyLoading, setAnalogyLoading] = useState(false);

    // When topic changes (e.g. user updated in settings), bust the cache
    const prevTopicRef = useRef(analogyTopic);
    useEffect(() => {
        if (prevTopicRef.current !== analogyTopic) {
            prevTopicRef.current = analogyTopic;
            analogyCache.current = {};
            setAnalogyContent(null);
        }
    }, [analogyTopic]);

    // ── Language ──────────────────────────────────────────────────────
    const { lang, t, translating } = useLang();
    const useLangRef = useRef({ lang });
    useLangRef.current = { lang };

    useEffect(() => {
        if (!getUser()) { router.push("/onboarding"); return; }
        if (!mod) { router.push("/modules"); return; }
    }, [mod, router]);

    // Fetch analogy rewrite whenever card or language changes (concept/example only)
    // The API does analogy + translation in one shot when lang !== 'en'
    useEffect(() => {
        if (!mod || !analogyTopic) return;
        const c = mod.cards[cardIndex];
        if (!c || c.type === "quiz") { setAnalogyContent(null); return; }
        // Cache key includes lang so changing language busts the cache
        const cacheKey = `${cardIndex}__${lang}`;
        if (analogyCache.current[cacheKey]) {
            setAnalogyContent(analogyCache.current[cacheKey]);
            return;
        }
        setAnalogyLoading(true);
        setAnalogyContent(null);
        fetch("/api/analogize-card", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                topic: analogyTopic,
                cardType: c.type,
                title: c.title ?? "",
                content: c.content ?? "",
                targetLang: lang !== "en" ? lang : undefined,
            }),
        })
            .then(r => r.json())
            .then(data => {
                const result = { title: data.title ?? c.title, content: data.content ?? c.content };
                analogyCache.current[cacheKey] = result;
                setAnalogyContent(result);
            })
            .catch(() => setAnalogyContent(null))
            .finally(() => setAnalogyLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardIndex, analogyTopic, lang]);

    if (!mod) return null;

    const cards: Card[] = mod.cards;
    const card = cards[cardIndex];
    const isLast = cardIndex === cards.length - 1;

    const handleNext = () => {
        if (isLast) {
            setShowComplete(true);
        } else {
            setCardIndex(c => c + 1);
            setSelected(null);
            setShowResult(false);
        }
    };

    const handleAnswer = (i: number) => {
        if (showResult) return;
        setSelected(i);
        setShowResult(true);
        if (i === (card as any).correct) {
            setQuizPointsEarned(p => p + 5);
        }
    };

    const handleModuleComplete = () => {
        const progress = getProgress();
        const alreadyCompleted = progress.completedModules.includes(moduleId);
        if (!alreadyCompleted) {
            progress.completedModules.push(moduleId);
            progress.quizPoints += quizPointsEarned;
            const totalQuizCards = cards.filter(c => c.type === "quiz").length;
            const stars = quizPointsEarned >= totalQuizCards * 5 ? 3 : quizPointsEarned > 0 ? 2 : 1;
            progress.moduleStars[moduleId] = stars;
        }
        saveProgress(progress);
        setShowComplete(false);
        setShowDebate(true);
    };

    const handleDebateRate = (stars: number) => {
        const progress = getProgress();
        progress.debateStars += stars;
        progress.debateCount += 1;
        saveProgress(progress);
        setShowDebate(false);
        router.push("/dashboard");
    };

    const cardTypeIcon = card?.type === "concept" ? <BookOpen size={14} /> : card?.type === "example" ? <Lightbulb size={14} /> : <HelpCircle size={14} />;
    const cardTypeLabel = card?.type === "concept" ? t("module.concept") : card?.type === "example" ? t("module.example") : t("module.quiz");
    const cardTypeBg = card?.type === "concept" ? "bg-blue-500/20 text-blue-400" : card?.type === "example" ? "bg-amber-500/20 text-amber-400" : "bg-purple-500/20 text-purple-400";

    // Pull static translations instantly
    const modTitle = t(`mod.${mod.id}.c.0.title`)?.includes("mod.") ? mod.title : t(`module.${mod.id}.title`);

    let cardTitle: string, cardContent: string, cardQuestion: string, cardOptions: string[], cardExplanation: string;
    if (card?.type === "concept" || card?.type === "example") {
        // Analogy content already includes translation (done in one Groq call)
        // so bypass t() when analogy content is active
        const baseTitle = t(`mod.${mod.id}.c.${cardIndex}.title`);
        const baseContent = t(`mod.${mod.id}.c.${cardIndex}.content`);
        cardTitle = (analogyTopic && analogyContent) ? analogyContent.title : baseTitle;
        cardContent = (analogyTopic && analogyContent) ? analogyContent.content : baseContent;
        cardQuestion = "";
        cardOptions = [];
        cardExplanation = "";
    } else {
        cardTitle = "";
        cardContent = "";
        const numOpts = card?.options?.length ?? 4;
        cardQuestion = t(`mod.${mod.id}.c.${cardIndex}.question`);
        cardOptions = Array.from({ length: numOpts }).map((_, i) => t(`mod.${mod.id}.c.${cardIndex}.opt.${i}`));
        cardExplanation = t(`mod.${mod.id}.c.${cardIndex}.expl`);
    }

    const progress = ((cardIndex + 1) / cards.length) * 100;

    return (
        <div className="hero-gradient min-h-screen pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 glass border-b border-border-subtle px-4 py-3">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => router.push("/modules")} className="text-muted hover:text-foreground">
                            <ChevronLeft size={22} />
                        </button>
                        <div className="flex-1">
                            <p className="font-bold text-foreground text-sm">{mod.icon} {modTitle}</p>
                            <p className="text-xs text-muted">{cardIndex + 1} / {cards.length}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {translating && <Languages size={14} className="text-blue-400 animate-pulse" aria-label="Translating..." />}
                            <div className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg">
                                +{quizPointsEarned} pts
                            </div>
                        </div>
                    </div>
                    <div className="h-1.5 bg-card rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-5 pt-8 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cardTypeBg}`}>
                        {cardTypeIcon} {cardTypeLabel}
                    </span>
                    {analogyTopic && card?.type !== "quiz" && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            {analogyLoading
                                ? <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" /> Adapting…</>
                                : <><Sparkles size={11} /> {analogyTopic} mode</>
                            }
                        </span>
                    )}
                </div>

                {/* Card */}
                <div className={`glass rounded-2xl p-8 border min-h-[280px] transition-all duration-300 ${analogyTopic && card?.type !== "quiz" && analogyContent
                    ? "border-amber-400/20"
                    : "border-border-subtle"
                    }`}>
                    {(card?.type === "concept" || card?.type === "example") && (
                        <>
                            <h2 className={`text-2xl font-black mb-6 leading-snug transition-opacity duration-300 ${analogyLoading ? "opacity-40" : "opacity-100 text-foreground"
                                }`}>{analogyLoading ? card.title : cardTitle}</h2>
                            {analogyLoading
                                ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-4 bg-foreground/5 rounded animate-pulse" style={{ width: `${90 - i * 10}%` }} />)}</div>
                                : <ContentRenderer text={cardContent} />
                            }
                        </>
                    )}

                    {card?.type === "quiz" && (
                        <>
                            <h2 className="text-xl font-bold text-foreground mb-6 leading-snug">{cardQuestion}</h2>
                            <div className="space-y-3">
                                {(cardOptions.length ? cardOptions : card.options ?? []).map((opt: string, i: number) => {
                                    let style = "bg-card border border-border-subtle text-foreground";
                                    if (showResult) {
                                        if (i === card.correct) style = "bg-emerald-500/20 border border-emerald-400 text-emerald-500 font-bold";
                                        else if (i === selected) style = "bg-rose-500/20 border border-rose-400 text-rose-500 font-bold";
                                        else style = "bg-card border border-border-subtle text-muted";
                                    } else if (selected === i) {
                                        style = "bg-blue-500/20 border border-blue-400 text-blue-500 font-bold";
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            className={`w-full text-left rounded-xl px-5 py-4 text-base font-medium transition-all ${style} ${!showResult ? "hover:bg-foreground/5 cursor-pointer" : "cursor-default"}`}
                                        >
                                            <span className="mr-3 font-bold">{["A", "B", "C", "D"][i]}.</span> {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Quiz Result */}
                {card?.type === "quiz" && showResult && (
                    <div className={`rounded-xl px-5 py-4 border flex gap-3 ${selected === card.correct ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
                        {selected === card.correct
                            ? <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            : <XCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        }
                        <div>
                            <p className={`text-sm font-bold mb-1 ${selected === card.correct ? "text-emerald-500" : "text-rose-500"}`}>
                                {selected === card.correct ? t("module.correct") : t("module.wrong")}
                            </p>
                            <p className="text-xs text-foreground">{cardExplanation}</p>
                        </div>
                    </div>
                )}

                {/* Next button */}
                {(card?.type !== "quiz" || showResult) && (
                    <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleNext}>
                        {isLast ? t("module.complete") : <>{t("module.next")} <ArrowRight size={18} /></>}
                    </button>
                )}
            </main>

            {/* Module Complete Modal */}
            {showComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div className="glass rounded-3xl p-6 max-w-sm w-full text-center border border-emerald-500/30 bg-card">
                        <div className="text-5xl mb-3">🎉</div>
                        <h2 className="text-2xl font-black text-foreground mb-1">{t("module.complete")}</h2>
                        <p className="text-muted text-sm mb-4">{lang === "hi" && mod.titleHi ? mod.titleHi : mod.title} mastered. You earned {quizPointsEarned} {t("common.points")}.</p>
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3].map(s => <Star key={s} size={24} className="text-amber-400 fill-amber-400" />)}
                        </div>
                        <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleModuleComplete}>
                            {t("module.claimPoints")} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Debate Modal */}
            {showDebate && (
                <DebateModal
                    stance={DEBATE_STANCES[moduleId % DEBATE_STANCES.length]}
                    onClose={() => { setShowDebate(false); router.push("/dashboard"); }}
                    onRate={handleDebateRate}
                />
            )}
        </div>
    );
}
