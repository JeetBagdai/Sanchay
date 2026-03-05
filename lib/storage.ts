export interface UserProfile {
    name: string;
    email: string;
    age: number;
    monthlyIncome: number;
    monthlyContribution: number;
    targetRetirementAge: number;
    createdAt: string;
}

export interface ModuleProgress {
    completedModules: number[];
    moduleStars: Record<number, number>;
    quizPoints: number;
    simulationPoints: number;
    debateStars: number;
    debateCount: number;
    simulationCompleted: boolean;
    simulationDecision: string | null;
    streakDays: number;
    lastActive: string;
}

const KEYS = {
    USER: "sanchay_user",
    PROGRESS: "sanchay_progress",
    SIM_RESULT: "sanchay_sim_result",
    LANGUAGE: "sanchay_lang",
    ANALOGY_TOPIC: "sanchay_analogy_topic",
};

function isBrowser() {
    return typeof window !== "undefined";
}

export function getUser(): UserProfile | null {
    if (!isBrowser()) return null;
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
}

export function saveUser(user: UserProfile) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function getProgress(): ModuleProgress {
    if (!isBrowser()) {
        return defaultProgress();
    }
    const data = localStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : defaultProgress();
}

function defaultProgress(): ModuleProgress {
    return {
        completedModules: [],
        moduleStars: {},
        quizPoints: 0,
        simulationPoints: 0,
        debateStars: 0,
        debateCount: 0,
        simulationCompleted: false,
        simulationDecision: null,
        streakDays: 1,
        lastActive: new Date().toISOString(),
    };
}

export function saveProgress(progress: ModuleProgress) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export function getSimulationResult() {
    if (!isBrowser()) return null;
    const data = localStorage.getItem(KEYS.SIM_RESULT);
    return data ? JSON.parse(data) : null;
}

export function saveSimulationResult(result: unknown) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.SIM_RESULT, JSON.stringify(result));
}

export function getLanguage(): "en" | "hi" {
    if (!isBrowser()) return "en";
    return (localStorage.getItem(KEYS.LANGUAGE) as "en" | "hi") || "en";
}

export function saveLanguage(lang: "en" | "hi") {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.LANGUAGE, lang);
}

export function clearAll() {
    if (!isBrowser()) return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export function getAnalogyTopic(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(KEYS.ANALOGY_TOPIC);
}

export function saveAnalogyTopic(topic: string) {
    if (!isBrowser()) return;
    if (topic) {
        localStorage.setItem(KEYS.ANALOGY_TOPIC, topic);
    } else {
        localStorage.removeItem(KEYS.ANALOGY_TOPIC);
    }
}
