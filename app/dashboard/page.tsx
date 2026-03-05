"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Zap, Bot, Trophy, ChevronRight, TrendingUp } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";
import ModuleCard from "@/components/ui/ModuleCard";
import ScoreRing from "@/components/ui/ScoreRing";
import { getUser, getProgress, saveProgress, UserProfile, ModuleProgress } from "@/lib/storage";
import { computeTotalScore, getRetirementDNA, getScoreBreakdown, getDynamicMaxScore } from "@/lib/scoring";
import { MODULES } from "@/lib/constants";
import { useLang } from "@/context/LanguageContext";
import { translateBatch } from "@/lib/translate";

export default function DashboardPage() {
    const router = useRouter();
    const { lang, t } = useLang();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [progress, setProgress] = useState<ModuleProgress | null>(null);

    const modTitle = (id: number) => t(`module.${id}.title`);
    const modDesc = (id: number) => t(`module.${id}.desc`);

    useEffect(() => {
        const u = getUser();
        if (!u) { router.push("/onboarding"); return; }
        setUser(u);
        const p = getProgress();

        // Update streak
        const today = new Date().toDateString();
        const lastActive = p.lastActive ? new Date(p.lastActive).toDateString() : null;
        if (lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastActive === yesterday.toDateString()) {
                p.streakDays = (p.streakDays || 1) + 1;
            } else if (lastActive !== null) {
                p.streakDays = 1; // reset if gap > 1 day
            }
            p.lastActive = new Date().toISOString();
            saveProgress(p);
        }

        setProgress(p);
    }, [router]);

    if (!user || !progress) {
        return (
            <div className="hero-gradient min-h-screen flex items-center justify-center">
                <div className="text-muted text-sm">{t("common.loading")}</div>
            </div>
        );
    }

    const score = computeTotalScore(progress);
    const breakdown = getScoreBreakdown(progress);
    const dna = getRetirementDNA(score);
    const simulationUnlocked = progress.completedModules.length >= 3;
    const maxScore = getDynamicMaxScore();

    const firstName = user.name.split(" ")[0];

    return (
        <div className="hero-gradient min-h-screen pb-24">
            <Topbar score={score} name={firstName} />
            <main className="max-w-5xl mx-auto px-4 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">

                    {/* LEFT COLUMN */}
                    <div className="space-y-5">
                        {/* Welcome + DNA */}
                        <div className="glass rounded-2xl p-5 border border-border-subtle">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-muted text-sm">{t("dashboard.welcome")}</p>
                                    <h1 className="text-2xl font-black text-foreground">{firstName} 👋</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-lg">{dna.emoji}</span>
                                        <span className="text-sm font-semibold" style={{ color: dna.color }}>{t(dna.key + ".label")}</span>
                                    </div>
                                    <p className="text-xs text-muted mt-1 max-w-[200px]">{t(dna.key + ".insight")}</p>
                                </div>
                                <ScoreRing score={score} maxScore={maxScore} size={100} label={t("dashboard.score")} />
                            </div>
                            <div className="flex items-center gap-1.5 mt-3">
                                <Flame size={14} className="text-orange-400" />
                                <span className="text-xs text-muted">{progress.streakDays} {t("dashboard.streak").toLowerCase()}</span>
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="glass rounded-2xl p-4 border border-border-subtle">
                            <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">{t("dashboard.scoreBreakdown")}</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { key: "dashboard.knowledge", val: breakdown.knowledge, color: "text-blue-400" },
                                    { key: "nav.modules", val: breakdown.moduleCompletion, color: "text-purple-400" },
                                    { key: "nav.simulation", val: breakdown.simulation, color: "text-amber-400" },
                                    { key: "dashboard.debate", val: breakdown.debate, color: "text-emerald-400" },
                                ].map(({ key, val, color }) => (
                                    <div key={key} className="text-center bg-card rounded-xl py-2">
                                        <p className={`text-lg font-black ${color}`}>{val}</p>
                                        <p className="text-[9px] text-muted mt-0.5">{t(key)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link href={simulationUnlocked ? "/simulation" : "#"} className={!simulationUnlocked ? "pointer-events-none" : ""}>
                                <div className={`glass rounded-2xl p-4 card-hover border ${simulationUnlocked ? "border-amber-400/30 glow-gold" : "border-border-subtle opacity-60"} text-center`}>
                                    <Zap size={28} className={simulationUnlocked ? "text-amber-400 mx-auto mb-2" : "text-muted mx-auto mb-2"} />
                                    <p className="text-sm font-bold text-foreground">{t("sim.title")}</p>
                                    <p className="text-xs text-muted">{simulationUnlocked ? t("nav.simulation") : t("dashboard.locked")}</p>
                                </div>
                            </Link>
                            <Link href="/ai-coach">
                                <div className="glass rounded-2xl p-4 card-hover border border-purple-400/20 text-center">
                                    <Bot size={28} className="text-purple-400 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-foreground">{t("ai.title")}</p>
                                    <p className="text-xs text-muted">{t("dashboard.askAI")}</p>
                                </div>
                            </Link>
                        </div>

                        {/* Leaderboard teaser */}
                        <Link href="/leaderboard">
                            <div className="glass rounded-2xl p-4 card-hover border border-yellow-400/20 flex items-center gap-4">
                                <Trophy size={32} className="text-amber-400 shrink-0" />
                                <div>
                                    <p className="font-bold text-foreground text-sm">{t("lb.title")}</p>
                                    <p className="text-xs text-muted">{t("nav.leaderboard")}</p>
                                </div>
                                <ChevronRight size={18} className="text-muted ml-auto" />
                            </div>
                        </Link>

                        {/* Insight */}
                        {progress.completedModules.length === 0 && (
                            <div className="glass rounded-xl p-4 border border-blue-500/20">
                                <div className="flex items-start gap-3">
                                    <TrendingUp size={18} className="text-blue-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{t("dashboard.startTip")}</p>
                                        <p className="text-xs text-muted">{t("dashboard.startTipDesc")}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Modules */}
                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-muted font-semibold uppercase tracking-wider">{t("dashboard.modules")}</p>
                                <Link href="/modules" className="text-xs text-blue-400 flex items-center gap-1">{t("common.seeAll")} <ChevronRight size={12} /></Link>
                            </div>
                            <div className="space-y-2">
                                {MODULES.map((mod) => {
                                    const completed = progress.completedModules.includes(mod.id);
                                    const locked = mod.id > 0 && !progress.completedModules.includes(mod.id - 1) && !completed;

                                    return (
                                        <ModuleCard
                                            key={mod.id}
                                            id={mod.id}
                                            title={modTitle(mod.id)}
                                            description={modDesc(mod.id)}
                                            icon={mod.icon}
                                            color={mod.color}
                                            isCompleted={completed}
                                            isLocked={locked}
                                            stars={progress.moduleStars[mod.id]}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <BottomNav />
        </div>
    );
}
