"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, TrendingDown, TrendingUp, Heart, IndianRupee, ArrowRight } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";
import RetirementChart from "@/components/ui/RetirementChart";
import { getUser, getProgress, saveProgress, saveSimulationResult } from "@/lib/storage";
import { runSimulation, formatCurrency, ContributionDecision } from "@/lib/simulation";
import { computeTotalScore, getSimulationBonus } from "@/lib/scoring";
import { LIFESTYLE_CATEGORIES } from "@/lib/constants";
import { useLang } from "@/context/LanguageContext";
import { translateBatch } from "@/lib/translate";

type Stage = "intro" | "running" | "decision" | "result";

export default function SimulationPage() {
    const router = useRouter();
    const { lang, t } = useLang();
    const [stage, setStage] = useState<Stage>("intro");
    const [decision, setDecision] = useState<ContributionDecision>("continue");
    const [result, setResult] = useState<ReturnType<typeof runSimulation> | null>(null);
    const [score, setScore] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

    // Live-translated simulation strings now use direct t("key")

    useEffect(() => {
        const u = getUser();
        if (!u) { router.push("/onboarding"); return; }
        setUser(u);
        const p = getProgress();
        setScore(computeTotalScore(p));
    }, [router]);

    const handleStart = () => {
        setAnimating(true);
        setTimeout(() => {
            setAnimating(false);
            setStage("decision");
        }, 1800);
        setStage("running");
    };

    const handleDecision = (d: ContributionDecision) => {
        setDecision(d);
        const u = user;
        const contrib = u?.monthlyContribution ?? 5000;
        const age = u?.age ?? 25;
        // Decision age: 2 years from now, min 30, max retire-5
        const decisionAge = Math.min(Math.max(age + 2, 30), 55);
        const sim = runSimulation(age, 60, contrib, 0.10, d, decisionAge);
        setResult(sim);

        const progress = getProgress();
        const bonus = getSimulationBonus(d);
        progress.simulationPoints = bonus;
        progress.simulationCompleted = true;
        progress.simulationDecision = d;
        // Do NOT push module 4 â€” simulation is standalone, not a module
        saveProgress(progress);
        saveSimulationResult(sim);
        setScore(computeTotalScore(progress));
        setStage("result");
    };

    const prog = getProgress();
    const simulationUnlocked = prog.completedModules.length >= 3;
    const previewData = user ? runSimulation(user.age ?? 25, 60, user.monthlyContribution ?? 5000, 0.10, "continue").dataPoints : [];
    const stopData = user ? runSimulation(user.age ?? 25, 60, user.monthlyContribution ?? 5000, 0.10, "stop", 30).dataPoints : [];

    // Gate: if not unlocked, show a locked screen
    if (!simulationUnlocked && user) {
        return (
            <div className="hero-gradient min-h-screen pb-24">
                <Topbar score={score} />
                <main className="max-w-4xl mx-auto px-4 pt-20 flex flex-col items-center text-center gap-6">
                    <div className="text-6xl">🔒</div>
                    <h1 className="text-2xl font-black text-foreground">{t("sim.locked")}</h1>
                    <p className="text-muted max-w-sm">
                        {t("modules.unlockMsg")} <span className="text-amber-400 font-bold">Modules 0, 1, and 2</span>.
                        You&apos;ve completed <span className="text-foreground font-bold">{prog.completedModules.filter(id => id <= 2).length}/3</span> so far.
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {[0, 1, 2].map(id => {
                            const done = prog.completedModules.includes(id);
                            return (
                                <div key={id} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${done ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-card border-border-subtle text-muted"
                                    }`}>
                                    {done ? "✅" : "⭕"} {t(`module.${id}.title`)}
                                </div>
                            );
                        })}
                    </div>
                    <button className="btn-primary flex items-center justify-center gap-2" onClick={() => router.push("/modules")}>{t("nav.modules")} <ArrowRight size={18} /></button>
                </main>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="hero-gradient min-h-screen pb-24">
            <Topbar score={score} />
            <main className="max-w-4xl mx-auto px-4 pt-6 space-y-5">

                {/* INTRO */}
                {stage === "intro" && (
                    <>
                        <div>
                            <h1 className="text-2xl font-black text-foreground">{t("sim.title")}</h1>
                            <p className="text-muted text-sm mt-1">{t("sim.subtitle")}</p>
                        </div>
                        <div className="glass rounded-2xl p-5 border border-amber-400/20">
                            <p className="text-sm font-semibold text-foreground mb-3">📋 {t("sim.params")}</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted">{t("sim.startAge")}</span><span className="text-amber-400 font-bold">{user?.age ?? 25} yrs</span></div>
                                <div className="flex justify-between"><span className="text-muted">{t("sim.monthlyContrib")}</span><span className="text-amber-400 font-bold">₹{(user?.monthlyContribution ?? 5000).toLocaleString("en-IN")}</span></div>
                                <div className="flex justify-between"><span className="text-muted">{t("sim.expectedReturn")}</span><span className="text-amber-400 font-bold">10%</span></div>
                                <div className="flex justify-between"><span className="text-muted">{t("sim.decisionPoint")}</span><span className="text-rose-400 font-bold">Age 30</span></div>
                                <div className="flex justify-between"><span className="text-muted">{t("sim.end")}</span><span className="text-emerald-400 font-bold">Age 60</span></div>
                            </div>
                        </div>
                        <div className="glass rounded-xl p-4 border border-blue-500/20">
                            <p className="text-sm text-muted">📈 <span className="font-semibold text-foreground">{t("sim.whatIf")}</span></p>
                            <RetirementChart data={previewData} height={160} />
                            <p className="text-xs text-muted text-center mt-1">{t("sim.corpusNeverStop")}</p>
                        </div>
                        <button className="btn-primary w-full text-base" onClick={handleStart}>{t("sim.startBtn")} ⚡</button>
                    </>
                )}

                {/* RUNNING (animation) */}
                {stage === "running" && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                        <div className="text-center">
                            <p className="text-6xl mb-4">⏳</p>
                            <h2 className="text-2xl font-black text-foreground">{t("sim.fastForward")}</h2>
                            <p className="text-muted text-sm mt-2">{t("sim.growing")}</p>
                        </div>
                        <div className="w-full glass rounded-xl p-4">
                            <RetirementChart data={previewData.slice(0, 6)} height={140} />
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-3 h-3 rounded-full bg-amber-400 ${animating ? "animate-bounce" : ""}`} style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* DECISION */}
                {stage === "decision" && (
                    <>
                        <div className="glass rounded-2xl p-5 border border-rose-500/30">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={22} className="text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-foreground mb-1">⚠️ {t("sim.criticalDec")}</p>
                                    <p className="text-muted text-sm leading-relaxed">{t("sim.lifeExp")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                className="w-full glass rounded-2xl p-4 border border-emerald-500/40 hover:border-emerald-400 transition-all text-left card-hover"
                                onClick={() => handleDecision("continue")}
                            >
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={24} className="text-emerald-400" />
                                    <div>
                                        <p className="font-bold text-emerald-400">{t("sim.decision.continue")}</p>
                                        <p className="text-sm text-muted">{t("sim.decision.contDesc")}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                className="w-full glass rounded-2xl p-4 border border-amber-500/40 hover:border-amber-400 transition-all text-left card-hover"
                                onClick={() => handleDecision("reduce")}
                            >
                                <div className="flex items-center gap-3">
                                    <TrendingDown size={24} className="text-amber-400" />
                                    <div>
                                        <p className="font-bold text-amber-400">{t("sim.decision.reduce")}</p>
                                        <p className="text-sm text-muted">{t("sim.decision.redDesc")}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                className="w-full glass rounded-2xl p-4 border border-rose-500/40 hover:border-rose-400 transition-all text-left card-hover"
                                onClick={() => handleDecision("stop")}
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={24} className="text-rose-400" />
                                    <div>
                                        <p className="font-bold text-rose-400">{t("sim.decision.stop")}</p>
                                        <p className="text-sm text-muted">{t("sim.decision.stopDesc")}</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* RESULT */}
                {stage === "result" && result && (
                    <>
                        <div>
                            <h1 className="text-2xl font-black text-foreground">{t("sim.result.title")}</h1>
                            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: result.lifestyleCategory.color + "20", color: result.lifestyleCategory.color, border: `1px solid ${result.lifestyleCategory.color}40` }}>
                                {result.lifestyleCategory.emoji} {result.lifestyleCategory.label}
                            </div>
                        </div>

                        {/* Main corpus */}
                        <div className="glass rounded-2xl p-5 text-center border border-amber-400/20 glow-gold">
                            <p className="text-sm text-muted mb-1">{t("sim.finalCorpus")}</p>
                            <p className="text-4xl font-black gradient-text">{formatCurrency(result.finalCorpus)}</p>
                            <p className="text-xs text-muted mt-1">Decision: {decision === "continue" ? t("sim.decision.continue") : decision === "reduce" ? t("sim.decision.reduce") : t("sim.decision.stop")}</p>
                        </div>

                        {/* Chart */}
                        <div className="glass rounded-2xl p-4 border border-border-subtle">
                            <p className="text-xs text-muted mb-2">{t("sim.growthTitle")} {user?.age ?? 25}–60</p>
                            <RetirementChart data={result.dataPoints} decisionAge={30} height={200} />
                            <div className="flex gap-4 justify-center mt-2 text-xs text-muted">
                                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block" /> {t("sim.labelCorpus")}</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block" /> {t("sim.labelContrib")}</span>
                            </div>
                        </div>

                        {/* Grid stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass rounded-xl p-4 text-center">
                                <IndianRupee size={14} className="text-emerald-400 mx-auto mb-1" />
                                <p className="text-xs text-muted">{t("sim.monthlyPension")}</p>
                                <p className="text-lg font-bold text-emerald-400">{formatCurrency(result.monthlyPension)}</p>
                                <p className="text-[10px] text-muted">{t("sim.annuityNote")}</p>
                            </div>
                            <div className="glass rounded-xl p-4 text-center">
                                <TrendingDown size={14} className="text-rose-400 mx-auto mb-1" />
                                <p className="text-xs text-muted">{t("sim.opportunityCost")}</p>
                                <p className="text-lg font-bold text-rose-400">{formatCurrency(result.opportunityCost)}</p>
                                <p className="text-[10px] text-muted">{t("sim.vsAlways")}</p>
                            </div>
                        </div>

                        {/* Retirement Shock */}
                        <div className="glass rounded-2xl p-4 border border-rose-500/20 space-y-3">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2"><Heart size={14} className="text-rose-400" /> {t("sim.retExpTitle")}</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">{t("sim.monLiv")}</span>
                                    <span className="text-foreground font-semibold">{formatCurrency(result.inflationAdjustedMonthlyExpense)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">{t("sim.hlthEst")}</span>
                                    <span className="text-foreground font-semibold">{formatCurrency(result.healthcareMonthlyEstimate)}</span>
                                </div>
                                <div className="border-t border-border-subtle pt-2 flex justify-between">
                                    <span className="text-muted font-semibold">{t("sim.totNeed")}</span>
                                    <span className="font-bold text-rose-400">{formatCurrency(result.inflationAdjustedMonthlyExpense + result.healthcareMonthlyEstimate)}</span>
                                </div>
                            </div>
                            <div className={`rounded-xl p-3 text-sm font-semibold flex items-center gap-2 ${result.corpusDeficitOrSurplus >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                                {result.corpusDeficitOrSurplus >= 0
                                    ? `✅ ${t("sim.pensCov")} — ${formatCurrency(result.monthlyPension - result.inflationAdjustedMonthlyExpense - result.healthcareMonthlyEstimate)}/mo ${t("sim.surplus")}`
                                    : `❌ ${t("sim.pensShort")} — ${formatCurrency(Math.abs(result.monthlyPension - result.inflationAdjustedMonthlyExpense - result.healthcareMonthlyEstimate))}/mo ${t("sim.gap")}`
                                }
                            </div>
                        </div>

                        {/* Behavior Insight */}
                        <div className="glass rounded-xl p-4 border border-purple-500/20">
                            <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide mb-1">🧠 {t("sim.behIns")}</p>
                            <p className="text-sm text-muted">{result.behaviorInsight}</p>
                        </div>

                        {/* Points awarded */}
                        <div className="glass rounded-xl p-4 border border-amber-500/20 text-center">
                            <p className="text-amber-400 text-2xl font-black">+{getSimulationBonus(decision)} pts</p>
                            <p className="text-xs text-muted">{t("sim.ptsAwrd")}</p>
                        </div>

                        <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => router.push("/dashboard")}>
                            {t("common.goToDashboard")} <ArrowRight size={18} />
                        </button>
                    </>
                )}
            </main>
            <BottomNav />
        </div>
    );
}


