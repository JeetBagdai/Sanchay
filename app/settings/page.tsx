"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, RotateCcw, Sparkles, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";
import { getUser, getProgress, clearAll } from "@/lib/storage";
import { computeTotalScore } from "@/lib/scoring";
import { useLang, Lang } from "@/context/LanguageContext";
import { useRef } from "react";
import { translateBatch } from "@/lib/translate";
import { useAnalogy } from "@/context/AnalogyContext";

const ALL_LANGUAGES: { code: Lang; native: string; english: string }[] = [
    { code: "en", native: "English", english: "English" },
    { code: "as", native: "অসমীয়া", english: "Assamese" },
    { code: "bn", native: "বাংলা", english: "Bengali" },
    { code: "brx", native: "बड़ो", english: "Bodo" },
    { code: "doi", native: "डोगरी", english: "Dogri" },
    { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
    { code: "hi", native: "हिन्दी", english: "Hindi" },
    { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
    { code: "ks", native: "كٲشُر", english: "Kashmiri" },
    { code: "kok", native: "कोंकणी", english: "Konkani" },
    { code: "mai", native: "मैथिली", english: "Maithili" },
    { code: "ml", native: "മലയാളം", english: "Malayalam" },
    { code: "mni", native: "মেইতেই", english: "Manipuri" },
    { code: "mr", native: "मराठी", english: "Marathi" },
    { code: "ne", native: "नेपाली", english: "Nepali" },
    { code: "or", native: "ଓଡ଼ିଆ", english: "Odia" },
    { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
    { code: "sa", native: "संस्कृतम्", english: "Sanskrit" },
    { code: "sd", native: "سنڌي", english: "Sindhi" },
    { code: "ta", native: "தமிழ்", english: "Tamil" },
    { code: "te", native: "తెలుగు", english: "Telugu" },
    { code: "ur", native: "اردو", english: "Urdu" },
];

const PRESET_TOPICS = [
    { label: "Farming", emoji: "🌾" },
    { label: "Cricket", emoji: "🏏" },
    { label: "Cooking", emoji: "👨‍🍳" },
    { label: "Movies", emoji: "🎬" },
    { label: "Gaming", emoji: "🎮" },
];

export default function SettingsPage() {
    const router = useRouter();
    const { lang, setLang, t, translating } = useLang();
    const { analogyTopic, setAnalogyTopic } = useAnalogy();
    const [score, setScore] = useState(0);
    const [userName, setUserName] = useState("");
    const [confirmReset, setConfirmReset] = useState(false);

    // ── Analogy topic local form state (separate from context value) ────
    const [analogyInput, setAnalogyInput] = useState("");
    const [analogyValidating, setAnalogyValidating] = useState(false);
    const [analogyResult, setAnalogyResult] = useState<{ valid: boolean; reason: string; sampleAnalogy: string } | null>(null);
    const [analogySaved, setAnalogySaved] = useState(false);

    useEffect(() => {
        setAnalogyInput(analogyTopic);
    }, [analogyTopic]);

    // ── Live translation for Platform Info ──────────────────────────
    const staticInfo = [
        ["Version", "1.0.0 (Prototype)"],
        ["Platform", "NPS Literacy & Behavioral Finance"],
        ["Data", "Local (Browser only)"],
        ["AI", "Education only · No advice"],
        ["Source", "PFRDA Guidelines 23-24"],
        ["loading..."]
    ];
    const [tx, setTx] = useState<string[]>(staticInfo.flat());
    const txLangRef = useRef("");

    useEffect(() => {
        if (lang === "en") { setTx(staticInfo.flat()); return; }
        if (lang === txLangRef.current) return;
        txLangRef.current = lang;
        translateBatch(staticInfo.flat(), lang).then(setTx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    useEffect(() => {
        if (!getUser()) { router.push("/onboarding"); return; }
        const u = getUser();
        setUserName(u?.name || "");
        setScore(computeTotalScore(getProgress()));
    }, [router]);

    const handleReset = () => {
        if (confirmReset) {
            clearAll();
            router.push("/");
        } else {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 4000);
        }
    };

    const handleAnalogyValidate = async () => {
        const trimmed = analogyInput.trim();
        if (!trimmed) return;
        setAnalogyValidating(true);
        setAnalogyResult(null);
        try {
            const res = await fetch("/api/validate-topic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: trimmed }),
            });
            const data = await res.json();
            setAnalogyResult(data);
        } catch {
            setAnalogyResult({ valid: true, reason: "", sampleAnalogy: "" });
        } finally {
            setAnalogyValidating(false);
        }
    };

    const currentLang = ALL_LANGUAGES.find(l => l.code === lang);

    return (
        <div className="hero-gradient min-h-screen pb-24">
            <Topbar score={score} name={userName} />
            <main className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
                <h1 className="text-2xl font-black text-foreground">{t("settings.title")}</h1>

                {/* Profile */}
                <div className="glass rounded-2xl p-4 border border-border-subtle">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">{t("settings.profile")}</p>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-foreground">{userName}</p>
                            <p className="text-xs text-muted">{t("common.score")}: <span className="text-amber-400 font-bold">{score}</span></p>
                        </div>
                    </div>
                </div>

                {/* Language */}
                <div className="glass rounded-2xl p-4 border border-border-subtle">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">{t("settings.language")}</p>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <Globe size={18} className="text-blue-400 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-foreground">{t("settings.language")}</p>
                                <p className="text-xs text-muted">
                                    {t("settings.langHint")}: {currentLang?.native} — {currentLang?.english}
                                    {translating && <span className="ml-2 text-amber-400 animate-pulse">{t("common.loading")}</span>}
                                </p>
                            </div>
                        </div>
                        <select
                            value={lang}
                            onChange={e => setLang(e.target.value as Lang)}
                            disabled={translating}
                            className="bg-card border border-border-subtle text-foreground text-sm rounded-xl px-3 py-2 outline-none focus:border-blue-400 transition-colors cursor-pointer disabled:opacity-50 max-w-[220px]"
                        >
                            {ALL_LANGUAGES.map(l => (
                                <option key={l.code} value={l.code} className="bg-card">
                                    {l.native} — {l.english}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Analogy Learning */}
                <div className="glass rounded-2xl p-4 border border-border-subtle space-y-3">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">{t("settings.analogy.title")}</p>
                    <p className="text-sm text-muted mb-4">
                        {t("settings.analogy.desc")}
                    </p>
                    <div className="flex items-center justify-between">
                        <div>
                            {analogyTopic ? (
                                <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
                                    <Sparkles size={11} /> {t("settings.analogy.active")}: <span className="font-semibold">{analogyTopic}</span>
                                </p>
                            ) : (
                                <p className="text-xs text-muted mt-0.5">{t("settings.analogy.none")}</p>
                            )}
                        </div>
                        {analogyTopic && (
                            <button
                                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                                onClick={() => { setAnalogyTopic(""); setAnalogyInput(""); setAnalogyResult(null); setAnalogySaved(false); }}
                            >
                                {t("settings.analogy.clear")}
                            </button>
                        )}
                    </div>

                    {/* Preset chips */}
                    <div className="flex flex-wrap gap-2">
                        {PRESET_TOPICS.map(({ label, emoji }) => (
                            <button
                                key={label}
                                onClick={() => { setAnalogyInput(label); setAnalogyResult(null); setAnalogySaved(false); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${analogyInput === label
                                    ? "bg-amber-400/20 border-amber-400 text-amber-400"
                                    : "bg-card border-border-subtle text-muted hover:border-amber-400/50 hover:text-foreground"
                                    }`}
                            >
                                {emoji} {label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <input
                        className="input-dark w-full text-sm"
                        placeholder={t("settings.analogy.placeholder")}
                        value={analogyInput}
                        onChange={e => { setAnalogyInput(e.target.value); setAnalogyResult(null); setAnalogySaved(false); }}
                        onKeyDown={e => { if (e.key === "Enter" && !analogyValidating && analogyInput.trim()) handleAnalogyValidate(); }}
                    />

                    {/* Validation result */}
                    {analogyResult && (
                        <div className={`rounded-xl px-3 py-2 border flex items-start gap-2 text-xs ${analogyResult.valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                            }`}>
                            {analogyResult.valid
                                ? <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                : <XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />
                            }
                            <div>
                                {analogyResult.valid ? (
                                    <>
                                        <p className="font-semibold text-emerald-400">{t("onboarding.personalize.goodTopic")}</p>
                                        {analogyResult.sampleAnalogy && (
                                            <p className="text-muted mt-0.5 italic line-clamp-2">&ldquo;{analogyResult.sampleAnalogy}&rdquo;</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-rose-400">{t("settings.analogy.badTopic")}</p>
                                        {analogyResult.reason && <p className="text-muted mt-0.5">{analogyResult.reason}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {analogySaved ? (
                            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                                <CheckCircle size={15} /> {t("settings.analogy.saved")}
                            </div>
                        ) : analogyResult?.valid ? (
                            <button
                                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                                onClick={() => { setAnalogyTopic(analogyInput.trim()); setAnalogySaved(true); setTimeout(() => setAnalogySaved(false), 2000); }}
                            >
                                <CheckCircle size={15} /> {t("settings.analogy.save")}
                            </button>
                        ) : (
                            <button
                                className="btn-secondary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                onClick={handleAnalogyValidate}
                                disabled={analogyValidating || !analogyInput.trim()}
                            >
                                {analogyValidating ? (
                                    <><Loader2 size={15} className="animate-spin" /> {t("common.loading")}</>
                                ) : (
                                    <><Sparkles size={15} /> {t("settings.analogy.validate")}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Platform info */}
                <div className="glass rounded-2xl p-4 border border-border-subtle space-y-2">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">{t("settings.about")}</p>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex justify-between text-xs">
                            <span className="text-muted">{tx[i * 2]}</span>
                            <span className="text-foreground">{tx[i * 2 + 1]}</span>
                        </div>
                    ))}
                </div>

                {/* Danger Zone */}
                <div className="glass rounded-2xl p-4 border border-rose-500/20">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">{t("settings.dangerZone")}</p>
                    <button
                        onClick={handleReset}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${confirmReset
                            ? "bg-rose-500 text-white"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
                            }`}
                    >
                        <RotateCcw size={16} />
                        {confirmReset ? t("settings.resetConfirm") : t("settings.reset")}
                    </button>
                    <p className="text-xs text-muted text-center mt-2">{t("settings.resetWarning")}</p>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
