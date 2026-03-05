"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, User, Mail, Calendar, Wallet, PiggyBank, Target, Sparkles, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { saveUser, saveProgress, getProgress, saveAnalogyTopic } from "@/lib/storage";
import { computeMonthlyCorpus, formatCurrency } from "@/lib/simulation";
import { useLang } from "@/context/LanguageContext";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { translateBatch } from "@/lib/translate";
import { useEffect } from "react";
// STATIC_TIPS removed - using LanguageContext directly now

export default function OnboardingPage() {
    const router = useRouter();
    const { t, lang } = useLang();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        name: "",
        email: "",
        age: 28,
        monthlyIncome: 60000,
        monthlyContribution: 5000,
        targetRetirementAge: 60,
    });

    // Analogy personalization state
    const [analogyTopic, setAnalogyTopic] = useState("");
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        valid: boolean;
        reason: string;
        sampleAnalogy: string;
    } | null>(null);
    const [validated, setValidated] = useState(false);

    const PRESET_TOPICS = [
        { label: "Farming", emoji: "🌾" },
        { label: "Cricket", emoji: "🏏" },
        { label: "Cooking", emoji: "👨‍🍳" },
        { label: "Movies", emoji: "🎬" },
        { label: "Gaming", emoji: "🎮" },
    ];

    const steps = [
        t("settings.profile"),
        t("onboarding.income").split("(")[0].trim(),
        t("sim.result.title").split(" ")[1],
        "Personalize",
    ];

    const update = (field: string, val: string | number) => setForm(f => ({ ...f, [field]: val }));

    const projected = computeMonthlyCorpus(
        form.monthlyContribution, 0.10,
        Math.max(0, form.targetRetirementAge - form.age) * 12
    );
    const monthlyPension = Math.round((projected * 0.4 * 0.06) / 12);

    const handleFinish = (topic?: string) => {
        saveUser({
            ...form,
            createdAt: new Date().toISOString(),
        });
        const existing = getProgress();
        saveProgress(existing);
        saveAnalogyTopic(topic ?? analogyTopic);
        router.push("/dashboard");
    };

    const handleValidate = async () => {
        const trimmed = analogyTopic.trim();
        if (!trimmed) return;
        setValidating(true);
        setValidationResult(null);
        setValidated(false);
        try {
            const res = await fetch("/api/validate-topic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: trimmed }),
            });
            const data = await res.json();
            setValidationResult(data);
            setValidated(data.valid);
        } catch {
            // Fail open — network error
            setValidationResult({ valid: true, reason: "", sampleAnalogy: "" });
            setValidated(true);
        } finally {
            setValidating(false);
        }
    };

    const handleChipSelect = (label: string) => {
        setAnalogyTopic(label);
        setValidationResult(null);
        setValidated(false);
    };

    const handleTopicInput = (val: string) => {
        setAnalogyTopic(val);
        setValidationResult(null);
        setValidated(false);
    };

    return (
        <div className="hero-gradient min-h-screen flex flex-col">
            <header className="px-4 py-4 border-b border-border-subtle">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <span className="text-xl font-black gradient-text">सanchay</span>
                    <div className="flex-1 flex gap-2">
                        {steps.map((s, i) => (
                            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? "bg-amber-400" : "bg-card"}`} title={s} />
                        ))}
                    </div>
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </header>

            <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
                {step === 0 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-black text-foreground">{t("onboarding.title")}</h1>
                            <p className="text-muted text-sm mt-2">{t("onboarding.tip.0")}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted flex items-center gap-2 mb-2"><User size={14} />{t("onboarding.name")}</label>
                                <input className="input-dark" placeholder="Rahul Sharma" value={form.name} onChange={e => update("name", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm text-muted flex items-center gap-2 mb-2"><Mail size={14} />Email Address</label>
                                <input className="input-dark" type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm text-muted flex items-center gap-2 mb-2"><Calendar size={14} />{t("onboarding.age")}: <span className="text-amber-400 font-bold">{form.age} {t("onboarding.age").toLowerCase().includes("age") ? "yrs" : ""}</span></label>
                                <input type="range" min={18} max={55} value={form.age} onChange={e => update("age", +e.target.value)} className="w-full accent-amber-400" />
                            </div>
                        </div>
                        <button
                            className="btn-primary w-full flex items-center justify-center gap-2"
                            onClick={() => setStep(1)}
                            disabled={!form.name || !form.email}
                        >
                            {t("onboarding.next")} <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-black text-foreground">{t("dashboard.scoreBreakdown").split("Breakdown")[0]}<span className="gradient-text">{t("onboarding.income").split("(")[0]}</span></h1>
                            <p className="text-muted text-sm mt-2">{t("onboarding.tip.1")}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted flex items-center gap-2 mb-2"><Wallet size={14} />{t("onboarding.income")}: <span className="text-amber-400 font-bold">₹{form.monthlyIncome.toLocaleString("en-IN")}</span></label>
                                <input type="range" min={10000} max={500000} step={5000} value={form.monthlyIncome} onChange={e => update("monthlyIncome", +e.target.value)} className="w-full accent-amber-400" />
                            </div>
                            <div>
                                <label className="text-sm text-muted flex items-center gap-2 mb-2"><PiggyBank size={14} />{t("onboarding.contribution")}: <span className="text-emerald-400 font-bold">₹{form.monthlyContribution.toLocaleString("en-IN")}</span></label>
                                <input type="range" min={500} max={50000} step={500} value={form.monthlyContribution} onChange={e => update("monthlyContribution", +e.target.value)} className="w-full accent-emerald-400" />
                                <p className="text-xs text-muted mt-1">{((form.monthlyContribution / form.monthlyIncome) * 100).toFixed(1)}% {t("onboarding.income").split("(")[0].toLowerCase()}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted flex items-center gap-2 mb-2"><Target size={14} />{t("onboarding.retireAge")}: <span className="text-purple-400 font-bold">{form.targetRetirementAge} {t("onboarding.age").toLowerCase().includes("age") ? "yrs" : ""}</span></label>
                                <input type="range" min={55} max={70} value={form.targetRetirementAge} onChange={e => update("targetRetirementAge", +e.target.value)} className="w-full accent-purple-400" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn-secondary flex-1" onClick={() => setStep(0)}>{t("onboarding.back")}</button>
                            <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={() => setStep(2)}>
                                {t("onboarding.next")} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-black text-foreground">{t("sim.result.title")}</h1>
                            <p className="text-muted text-sm mt-2">{t("onboarding.tip.2")}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="glass rounded-2xl p-5 text-center border border-amber-400/20 glow-gold">
                                <p className="text-sm text-muted mb-1">{t("onboarding.tip.3")} ({form.targetRetirementAge})</p>
                                <p className="text-4xl font-black gradient-text">{formatCurrency(Math.round(projected))}</p>
                                <p className="text-xs text-muted mt-1">{t("onboarding.tip.3")}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="glass rounded-xl p-4 text-center">
                                    <p className="text-xs text-muted mb-1">{t("onboarding.tip.5")}</p>
                                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(monthlyPension)}</p>
                                </div>
                                <div className="glass rounded-xl p-4 text-center">
                                    <p className="text-xs text-muted mb-1">{t("onboarding.tip.6")}</p>
                                    <p className="text-xl font-bold text-blue-400">{form.targetRetirementAge - form.age} {t("onboarding.age").toLowerCase().includes("age") ? "yrs" : ""}</p>
                                </div>
                            </div>
                            <div className="glass rounded-xl p-4 border border-emerald-500/20">
                                <p className="text-xs text-muted mb-2">{t("onboarding.tip.7")}</p>
                                <p className="text-lg font-bold text-emerald-400">~₹{((Math.min(form.monthlyContribution * 12, 200000)) * 0.30).toLocaleString("en-IN")}/{t("dashboard.streak").split(" ")[0].toLowerCase()}</p>
                                <p className="text-xs text-muted">{t("onboarding.tip.8")}</p>
                            </div>
                        </div>

                        <div className="glass rounded-xl p-4 border border-blue-500/20">
                            <p className="text-sm font-semibold text-foreground mb-1">👋 {t("common.completed")}, {form.name}?</p>
                            <p className="text-xs text-muted">{t("onboarding.tip.4")}</p>
                        </div>

                        <div className="flex gap-3">
                            <button className="btn-secondary flex-1" onClick={() => setStep(1)}>{t("onboarding.back")}</button>
                            <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={() => setStep(3)}>{t("onboarding.begin")} <ArrowRight size={18} /></button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-3">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 mx-auto">
                                <Sparkles size={32} className="text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-foreground">{t("onboarding.personalize.title")}</h1>
                                <p className="text-muted text-sm mt-2 leading-relaxed">
                                    {t("onboarding.personalize.subtitle")}
                                </p>
                            </div>
                        </div>

                        {/* Preset chips */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {PRESET_TOPICS.map(({ label, emoji }) => (
                                <button
                                    key={label}
                                    onClick={() => handleChipSelect(label)}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                                        flex items-center gap-1.5
                                        ${analogyTopic === label
                                            ? "bg-amber-400/20 border-amber-400 text-amber-400"
                                            : "bg-card border-border-subtle text-muted hover:border-amber-400/50 hover:text-foreground"
                                        }
                                    `}
                                >
                                    <span>{emoji}</span> {label}
                                </button>
                            ))}
                        </div>

                        {/* Text input */}
                        <div>
                            <input
                                className="input-dark w-full"
                                placeholder="e.g. Farming, Cricket, Cooking..."
                                value={analogyTopic}
                                onChange={e => handleTopicInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !validating && analogyTopic.trim()) handleValidate(); }}
                            />
                        </div>

                        {/* Validation result card */}
                        {validationResult && (
                            <div className={`rounded-xl p-4 border flex items-start gap-3 transition-all duration-300 ${validationResult.valid
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-rose-500/10 border-rose-500/30"
                                }`}>
                                {validationResult.valid
                                    ? <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                    : <XCircle size={20} className="text-rose-400 mt-0.5 flex-shrink-0" />
                                }
                                <div className="space-y-1">
                                    {validationResult.valid ? (
                                        <>
                                            {validationResult.reason && (
                                                <p className="text-xs font-semibold text-emerald-400">{t("onboarding.personalize.goodTopic")}</p>
                                            )}
                                            {validationResult.sampleAnalogy && (
                                                <p className="text-xs text-muted leading-relaxed italic line-clamp-2">
                                                    &ldquo;{validationResult.sampleAnalogy}&rdquo;
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs font-semibold text-rose-400">{t("onboarding.personalize.badTopic")}</p>
                                            {validationResult.reason && (
                                                <p className="text-xs text-muted leading-relaxed">{validationResult.reason}</p>
                                            )}
                                            <p className="text-xs text-muted mt-1">{t("onboarding.personalize.suggestion")}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Primary action button */}
                        {validated ? (
                            <button
                                className="btn-primary w-full flex items-center justify-center gap-2"
                                onClick={() => handleFinish()}
                            >
                                <CheckCircle size={18} /> {t("onboarding.personalize.confirmed")} <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleValidate}
                                disabled={validating || !analogyTopic.trim()}
                            >
                                {validating ? (
                                    <><Loader2 size={18} className="animate-spin" /> {t("common.loading")}…</>
                                ) : (
                                    <><Sparkles size={18} /> {t("onboarding.personalize.validate")}</>
                                )}
                            </button>
                        )}

                        {/* Skip link */}
                        <div className="text-center">
                            <button
                                className="text-sm text-muted hover:text-foreground transition-colors underline underline-offset-4"
                                onClick={() => handleFinish("")}
                            >
                                {t("onboarding.personalize.skip")}
                            </button>
                        </div>

                        {/* Back button */}
                        <button
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                            onClick={() => setStep(2)}
                        >
                            <ArrowLeft size={18} /> {t("onboarding.back")}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
