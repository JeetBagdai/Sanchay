"use client";
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import MODULE_KEYS from "./module-keys.json";

export type Lang =
    | "en" | "as" | "bn" | "brx" | "doi"
    | "gu" | "hi" | "kn" | "ks" | "kok"
    | "mai" | "ml" | "mni" | "mr" | "ne"
    | "or" | "pa" | "sa" | "sd" | "ta"
    | "te" | "ur";

// English is bundled inline — zero network cost, always the fallback
const EN: Record<string, string> = {
    "nav.home": "Home", "nav.dashboard": "Dashboard", "nav.modules": "Modules",
    "nav.simulation": "Simulation", "nav.aiCoach": "AI Coach",
    "nav.leaderboard": "Leaderboard", "nav.settings": "Settings",
    "landing.hero.title": "Will You Have Enough to Retire?",
    "landing.hero.subtitle": "Most Indians won't. Sanchay trains your pension discipline through simulations, AI debate, and behavioral science.",
    "landing.cta.start": "Start Your Journey",
    "landing.cta.login": "Continue Journey",
    "landing.estimator.title": "Quick Retirement Estimator",
    "landing.estimator.age": "Your Age",
    "landing.estimator.contribution": "Monthly NPS Contribution (₹)",
    "landing.estimator.retireAge": "Target Retirement Age",
    "landing.estimator.result": "Projected Corpus at 60",
    "onboarding.title": "Let's Build Your Retirement Profile",
    "onboarding.name": "Your Name", "onboarding.age": "Current Age",
    "onboarding.income": "Monthly Income (₹)", "onboarding.contribution": "Monthly NPS Contribution (₹)",
    "onboarding.retireAge": "Target Retirement Age",
    "onboarding.next": "Next", "onboarding.back": "← Back", "onboarding.begin": "Begin My Journey",
    "dashboard.welcome": "Welcome back", "dashboard.score": "Pension Readiness Score",
    "dashboard.modules": "Learning Modules", "dashboard.streak": "Day Streak",
    "dashboard.startSimulation": "Enter Simulation", "dashboard.askAI": "Ask AI Coach",
    "dashboard.locked": "Complete 3 modules to unlock",
    "dashboard.quickActions": "Quick Actions", "dashboard.yourProgress": "Your Progress",
    "module.concept": "Concept", "module.example": "Example", "module.quiz": "Quiz",
    "module.next": "Next", "module.complete": "Complete Module 🎉",
    "module.correct": "+5 points! Excellent!", "module.wrong": "Not quite. Here's why:",
    "module.claimPoints": "Claim Points & Start Debate",
    "debate.title": "AI Pension Debate", "debate.turns": "Turn",
    "debate.arguePrompt": "Argue until you convince me!",
    "debate.complete": "Debate complete!", "debate.placeholder": "Make your argument with facts...",
    "debate.send": "Send", "debate.claim": "Claim {n} Points",
    "sim.title": "The Delay Trap",
    "sim.locked": "Simulation Locked",
    "sim.subtitle": "Experience what happens when you delay NPS contributions",
    "sim.result.title": "Your Retirement Outcome",
    "sim.finalCorpus": "Final Corpus at 60", "sim.monthlyPension": "Estimated Monthly Pension",
    "sim.opportunityCost": "Opportunity Cost",
    "sim.decision.continue": "Stay the course", "sim.decision.reduce": "Reduce by 50%",
    "sim.decision.stop": "Stop contributing",
    "ai.title": "AI Pension Coach",
    "ai.placeholder": "Ask about NPS rules, tax benefits, or start a debate...",
    "ai.debateMode": "Start AI Debate", "ai.qaMode": "Ask a Question", "ai.send": "Send",
    "lb.title": "Pension Warriors", "lb.rank": "Rank", "lb.name": "Name",
    "lb.score": "Score", "lb.dna": "DNA Profile",
    "settings.title": "Settings", "settings.profile": "Profile",
    "settings.language": "Interface Language", "settings.langHint": "Currently",
    "settings.reset": "Reset All Progress",
    "settings.resetConfirm": "⚠️ Click again to confirm reset",
    "settings.resetWarning": "This will erase your profile, modules, and score permanently.",
    "settings.about": "About Sanchay", "settings.dangerZone": "Danger Zone",
    "common.points": "points", "common.loading": "Loading...", "common.back": "← Back",
    "common.locked": "Locked", "common.completed": "Completed",
    "common.stars": "stars", "common.score": "Score",
    "common.seeAll": "See all",
    "common.goToDashboard": "Go to Dashboard",
    "dashboard.scoreBreakdown": "Score Breakdown",
    "dashboard.knowledge": "Knowledge",
    "dashboard.debate": "Debate",
    "dashboard.startTip": "Start with Module 0",
    "dashboard.startTipDesc": "NPS Basics unlocked and ready. Complete 3 modules to access the Delay Trap simulation.",
    "bottomnav.dashboard": "Dashboard", "bottomnav.modules": "Modules",
    "bottomnav.simulate": "Simulate", "bottomnav.aiCoach": "AI Coach",
    "bottomnav.ranks": "Ranks",
    "landing.features.title": "Built for India's Young Workforce",
    "landing.impact.1": "Young earners trained",
    "landing.impact.2": "Better Awareness",
    "landing.impact.3": "Avg Readiness Gain",
    "landing.impact.4": "Simulated Scenarios",
    "landing.feature.1": "Live Simulations",
    "landing.feature.1.desc": "See your retirement corpus grow or shrink based on real decisions you make today.",
    "landing.feature.2": "AI Debate Coach",
    "landing.feature.2.desc": "Argue with an AI about whether NPS is worth it. Get rated. Earn insights.",
    "landing.feature.3": "NPS Mastery Modules",
    "landing.feature.3.desc": "6 gamified modules covering PFRDA rules, tax benefits, withdrawal strategy, and behavioral traps.",
    "landing.philosophy.title": "Our Core Belief",
    "landing.philosophy.text": "\"Retirement failure is behavioral, not mathematical. We don't simulate numbers. We simulate time, consequences, and choices.\"",
    "landing.platform": "India's NPS Literacy Platform",
    "landing.disclaimer": "No real money. No account needed. Just clarity.",
    // DNA profiles
    "dna.procrastinator.label": "The Procrastinator",
    "dna.procrastinator.insight": "You know retirement matters but keep delaying action. Every month costs you compounding returns.",
    "dna.learner.label": "The Curious Learner",
    "dna.learner.insight": "Great start! You're building knowledge. Now convert it into consistent contribution discipline.",
    "dna.saver.label": "The Disciplined Saver",
    "dna.saver.insight": "You're on the right track. Your discipline sets you apart from 80% of your peers.",
    "dna.architect.label": "The Freedom Architect",
    "dna.architect.insight": "Elite retirement readiness. You understand compounding, NPS rules, and behavioral discipline. Financial freedom awaits.",
    // Onboarding tips (Steps 1 & 2)
    "onboarding.tip.0": "Tell us about yourself to personalize your pension journey.",
    "onboarding.tip.1": "This helps us simulate your retirement accurately.",
    "onboarding.tip.2": "Based on consistent NPS contributions at 10% p.a.",
    "onboarding.tip.3": "If you start today and stay disciplined",
    "onboarding.tip.4": "Complete modules and run the Delay Trap simulation to earn your Retirement DNA profile.",
    "onboarding.tip.5": "Monthly pension (40% annuity)",
    "onboarding.tip.6": "Contribution Years",
    "onboarding.tip.7": "Tax Savings Estimate (30% bracket)",
    "onboarding.tip.8": "Under Sec 80CCD(1) + 80CCD(1B)",
    // Onboarding step 3 – Personalize Your Learning
    "onboarding.personalize.title": "Personalize Your Learning",
    "onboarding.personalize.subtitle": "Enter a topic you're familiar with and we'll explain all NPS concepts using analogies from that world!",
    "onboarding.personalize.validate": "Validate & Continue",
    "onboarding.personalize.confirmed": "Looks great! Continue",
    "onboarding.personalize.skip": "Skip — use standard explanations",
    "onboarding.personalize.goodTopic": "Great choice!",
    "onboarding.personalize.badTopic": "Hmm, this topic might not work well",
    "onboarding.personalize.suggestion": "Try something like Cricket, Cooking, Farming, or Gaming.",
    // Settings -> Analogy panel
    "settings.analogy.title": "Analogy Learning",
    "settings.analogy.desc": "Choose a topic and we'll translate NPS concepts into analogies you understand.",
    "settings.analogy.active": "Active",
    "settings.analogy.none": "No topic set — using standard explanations",
    "settings.analogy.clear": "Clear",
    "settings.analogy.placeholder": "e.g. Farming, Cricket, Cooking...",
    "settings.analogy.badTopic": "Topic might not work well",
    "settings.analogy.saved": "Saved!",
    "settings.analogy.save": "Save Topic",
    "settings.analogy.validate": "Validate Topic",

    // Modules
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
    "module.start": "Start →",

    // Modules Page
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
    ...MODULE_KEYS
};

interface LangContextValue {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string) => string;
    translating: boolean;
}

const LangContext = createContext<LangContextValue>({
    lang: "en", setLang: () => { }, t: (k) => EN[k] ?? k, translating: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>("en");
    const [strings, setStrings] = useState<Record<string, string>>(EN);
    const [translating, setTranslating] = useState(false);
    // Cache: after first fetch, subsequent switches are instant
    const cache = useRef<Map<Lang, Record<string, string>>>(new Map([["en", EN]]));

    // Restore saved preference on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("sanchay_lang") as Lang | null;
            if (saved && saved !== "en") applyLang(saved);
        } catch { /* SSR guard */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyLang = async (l: Lang) => {
        // Hit cache first
        if (cache.current.has(l)) {
            setStrings(cache.current.get(l)!);
            setLangState(l);
            return;
        }
        // Live fetch from /public/locales/{lang}.json
        setTranslating(true);
        try {
            // Append a timestamp to bust aggressive browser/Next.js caching of static JSON files
            const res = await fetch(`/locales/${l}.json?t=${Date.now()}`);
            if (!res.ok) throw new Error("locale not found");
            const data: Record<string, string> = await res.json();
            // Merge: missing keys gracefully fall back to English
            const merged = { ...EN, ...data };
            cache.current.set(l, merged);
            setStrings(merged);
        } catch {
            // Language file missing → stay on English
            setStrings(EN);
        } finally {
            setTranslating(false);
            setLangState(l);
        }
    };

    const setLang = (l: Lang) => {
        try { localStorage.setItem("sanchay_lang", l); } catch { /* SSR guard */ }

        // Clear cache for this language when explicitly clicked, so it grabs the latest translations
        // from the background script instead of using the old cached version in memory.
        if (cache.current.has(l) && l !== "en") {
            cache.current.delete(l);
        }

        if (l === "en") { setStrings(EN); setLangState("en"); }
        else applyLang(l);
    };

    const t = (key: string) => strings[key] ?? EN[key] ?? key;

    return (
        <LangContext.Provider value={{ lang, setLang, t, translating }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() { return useContext(LangContext); }
