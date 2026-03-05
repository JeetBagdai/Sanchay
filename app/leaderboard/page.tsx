"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";
import { getUser, getProgress } from "@/lib/storage";
import { computeTotalScore, getRetirementDNA } from "@/lib/scoring";
import { useLang } from "@/context/LanguageContext";
import { translateBatch } from "@/lib/translate";

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    dna: string;
    dnaKey: string;
    dnaEmoji: string;
    dnaColor: string;
    isUser?: boolean;
}

function seedLeaderboard(userScore: number, userName: string): LeaderboardEntry[] {
    const peers = [
        { name: "Priya Sharma", score: 185 },
        { name: "Vikram Nair", score: 162 },
        { name: "Ananya Iyer", score: 144 },
        { name: "Rahul Mehta", score: 128 },
        { name: "Sneha Patel", score: 115 },
        { name: "Arjun Reddy", score: 98 },
        { name: "Kavitha Rajan", score: 82 },
        { name: "Rohan Das", score: 67 },
        { name: "Deepika Singh", score: 54 },
        { name: "Aakash Gupta", score: 41 },
    ];

    const all = [
        ...peers.map(p => ({ ...p, isUser: false })),
        { name: userName || "You", score: userScore, isUser: true }
    ].sort((a, b) => b.score - a.score);

    return all.map((p, i) => {
        const dna = getRetirementDNA(p.score);
        return {
            rank: i + 1,
            name: p.name,
            score: p.score,
            dna: dna.label,
            dnaKey: dna.key,
            dnaEmoji: dna.emoji,
            dnaColor: dna.color,
            isUser: (p as any).isUser,
        };
    });
}

export default function LeaderboardPage() {
    const router = useRouter();
    const { lang, t } = useLang();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [score, setScore] = useState(0);
    const [userRank, setUserRank] = useState(0);

    // ── Live translation ────────────────────────────────────────────
    const LB_STRINGS = [
        "Pension", "Warriors",
        "You are ranked", "out of", "pension warriors",
        "Simulated peer group",
        "Your Ranking",
        "#", "WARRIOR", "PROFILE", "SCORE",
        "How Scores Are Earned",
        "Quiz Correct Answers", "+5 pts each",
        "Module Completion", "+10 pts each",
        "Stayed Disciplined (Simulation)", "+50 pts",
        "AI Debate Stars", "+10 pts per star",
        "New Debate",
    ];
    const [tx, setTx] = useState<string[]>(LB_STRINGS);
    const txLangRef = useRef("");

    useEffect(() => {
        if (lang === "en") { setTx(LB_STRINGS); return; }
        if (lang === txLangRef.current) return;
        txLangRef.current = lang;
        translateBatch(LB_STRINGS, lang).then(setTx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    const s = (i: number) => tx[i] ?? LB_STRINGS[i];

    // DNA labels come from locale files via t()
    const dnaLabel = (key: string) => t(key + ".label");

    useEffect(() => {
        const u = getUser();
        if (!u) { router.push("/onboarding"); return; }
        const p = getProgress();
        const sc = computeTotalScore(p);
        setScore(sc);
        const lb = seedLeaderboard(sc, u.name);
        setEntries(lb);
        setUserRank(lb.findIndex(e => e.isUser) + 1);
    }, [router]);

    const medalColors = ["text-amber-400", "text-slate-300", "text-amber-600"];

    return (
        <div className="hero-gradient min-h-screen pb-24">
            <Topbar score={score} />
            <main className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                        <Trophy size={24} className="text-amber-400" />
                        {s(0)} <span className="gradient-text ml-1">{s(1)}</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-muted text-sm">{s(2)} <span className="text-amber-400 font-bold">#{userRank}</span> {s(3)} {entries.length} {s(4)}</p>
                        <span className="text-[10px] bg-card border border-border-subtle text-muted px-2 py-0.5 rounded-full">{s(5)}</span>
                    </div>
                </div>

                {/* User position highlight */}
                {entries.find(e => e.isUser) && (
                    <div className="glass rounded-2xl p-4 border border-amber-400/30 glow-gold">
                        <p className="text-xs text-amber-400 font-semibold mb-1">{s(6)}</p>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-amber-400">#{userRank}</span>
                            <div className="flex-1">
                                <p className="font-bold text-foreground">{entries.find(e => e.isUser)?.dnaEmoji} {entries.find(e => e.isUser)?.name}</p>
                                <p className="text-xs" style={{ color: entries.find(e => e.isUser)?.dnaColor }}>
                                    {dnaLabel(entries.find(e => e.isUser)?.dnaKey ?? "")}
                                </p>
                            </div>
                            <span className="text-xl font-black text-amber-400">{score}</span>
                        </div>
                    </div>
                )}

                {/* Leaderboard table */}
                <div className="glass rounded-2xl overflow-hidden border border-border-subtle">
                    <div className="grid grid-cols-[40px_1fr_80px_70px] px-4 py-2 border-b border-border-subtle">
                        <span className="text-xs text-muted font-semibold">{s(7)}</span>
                        <span className="text-xs text-muted font-semibold">{s(8)}</span>
                        <span className="text-xs text-muted font-semibold">{s(9)}</span>
                        <span className="text-xs text-muted font-semibold text-right">{s(10)}</span>
                    </div>
                    {entries.map((e) => (
                        <div
                            key={e.rank}
                            className={`grid grid-cols-[40px_1fr_80px_70px] items-center px-4 py-3 border-b border-border-subtle/50 last:border-0 transition-all ${e.isUser ? "bg-amber-400/5 border-l-2 border-l-amber-400" : "hover:bg-card"}`}
                        >
                            <span className={`text-sm font-black ${e.rank <= 3 ? medalColors[e.rank - 1] : "text-muted"}`}>
                                {e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : e.rank}
                            </span>
                            <div>
                                <p className={`text-sm font-semibold ${e.isUser ? "text-amber-400" : "text-foreground"}`}>{e.name}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-sm">{e.dnaEmoji}</span>
                                <span className="text-[10px] truncate" style={{ color: e.dnaColor }}>
                                    {dnaLabel(e.dnaKey).split(" ")[1] || dnaLabel(e.dnaKey)}
                                </span>
                            </div>
                            <span className={`text-sm font-black text-right ${e.isUser ? "text-amber-400" : "text-foreground"}`}>{e.score}</span>
                        </div>
                    ))}
                </div>

                {/* Scoring guide */}
                <div className="glass rounded-xl p-4 border border-border-subtle">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">{s(11)}</p>
                    <div className="space-y-2 text-xs text-muted">
                        {[
                            [s(12), s(13)],
                            [s(14), s(15)],
                            [s(16), s(17)],
                            [s(18), s(19)],
                        ].map(([action, pts]) => (
                            <div key={action} className="flex justify-between">
                                <span>{action}</span>
                                <span className="text-emerald-400 font-semibold">{pts}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
