"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";
import ModuleCard from "@/components/ui/ModuleCard";
import { getUser, getProgress, ModuleProgress } from "@/lib/storage";
import { computeTotalScore } from "@/lib/scoring";
import { MODULES } from "@/lib/constants";
import { useLang } from "@/context/LanguageContext";
import { translateBatch } from "@/lib/translate";

export default function ModulesPage() {
    const router = useRouter();
    const { lang, t } = useLang();
    const [progress, setProgress] = useState<ModuleProgress | null>(null);
    const [score, setScore] = useState(0);

    const s = (i: number) => {
        const keys = [
            "modules.title", "nav.modules", "modules.completed",
            "modules.unlockMsg", "modules.progress", "modules.simUnlocked",
            "modules.simUnlockedDesc", "modules.enterSim"
        ];
        return t(keys[i]);
    };
    const modTitle = (id: number) => t(`module.${id}.title`);
    const modDesc = (id: number) => t(`module.${id}.desc`);

    useEffect(() => {
        if (!getUser()) { router.push("/onboarding"); return; }
        const p = getProgress();
        setProgress(p);
        setScore(computeTotalScore(p));
    }, [router]);

    if (!progress) return (
        <div className="hero-gradient min-h-screen flex items-center justify-center text-muted">Loading...</div>
    );

    const completed = progress.completedModules.length;

    return (
        <div className="hero-gradient min-h-screen pb-24">
            <Topbar score={score} />
            <main className="max-w-5xl mx-auto px-4 pt-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground">{s(0)} <span className="gradient-text">{s(1)}</span></h1>
                    <p className="text-muted text-sm mt-1">{completed}/{MODULES.length} {s(2)} · {s(3)}</p>
                </div>

                {/* Progress bar */}
                <div className="glass rounded-xl p-3">
                    <div className="flex justify-between text-xs text-muted mb-2">
                        <span>{s(4)}</span>
                        <span>{Math.round((completed / MODULES.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-card rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-700"
                            style={{ width: `${(completed / MODULES.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MODULES.map((mod) => {
                        const isCompleted = progress.completedModules.includes(mod.id);
                        const isLocked = mod.id > 0 && !progress.completedModules.includes(mod.id - 1) && !isCompleted;
                        return (
                            <ModuleCard
                                key={mod.id}
                                id={mod.id}
                                title={modTitle(mod.id)}
                                description={modDesc(mod.id)}
                                icon={mod.icon}
                                color={mod.color}
                                isCompleted={isCompleted}
                                isLocked={isLocked}
                                stars={progress.moduleStars[mod.id]}
                            />
                        );
                    })}
                </div>

                {completed >= 3 && (
                    <div className="glass rounded-2xl p-4 border border-border-subtle text-center glow-gold">
                        <p className="text-lg font-bold text-amber-400">⚡ {s(5)}</p>
                        <p className="text-sm text-muted mt-1">{s(6)}</p>
                        <button className="btn-primary mt-3 text-sm" onClick={() => router.push("/simulation")}>{s(7)} →</button>
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
}
