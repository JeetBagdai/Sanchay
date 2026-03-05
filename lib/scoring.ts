import { ModuleProgress } from "./storage";
import { RETIREMENT_DNA, MODULES } from "./constants";

export function computeTotalScore(progress: ModuleProgress): number {
    const moduleCompletion = progress.completedModules.length * 10;
    const quizPoints = progress.quizPoints;
    const simulationPoints = progress.simulationPoints;
    const debatePoints = progress.debateStars * 10;
    return moduleCompletion + quizPoints + simulationPoints + debatePoints;
}

export function getRetirementDNA(score: number) {
    return RETIREMENT_DNA.find((d) => score <= d.max) || RETIREMENT_DNA[RETIREMENT_DNA.length - 1];
}

export function getScoreBreakdown(progress: ModuleProgress) {
    return {
        knowledge: progress.quizPoints,
        moduleCompletion: progress.completedModules.length * 10,
        simulation: progress.simulationPoints,
        debate: progress.debateStars * 10,
        total: computeTotalScore(progress),
    };
}

export function getPensionReadinessPercent(score: number): number {
    const moduleCompletion = MODULES.length * 10;
    const maxQuizPoints = MODULES.reduce((a, m) => a + m.cards.filter(c => c.type === "quiz").length * 5, 0);
    const maxSimulation = 50;
    const maxDebate = 5 * 10; // 5 stars × 10 pts, reasonable cap per session
    const maxScore = moduleCompletion + maxQuizPoints + maxSimulation + maxDebate;
    return Math.min(100, Math.round((score / maxScore) * 100));
}

export function getDynamicMaxScore(): number {
    const moduleCompletion = MODULES.length * 10;
    const maxQuizPoints = MODULES.reduce((a, m) => a + m.cards.filter(c => c.type === "quiz").length * 5, 0);
    return moduleCompletion + maxQuizPoints + 50 + 50;
}

export function getSimulationBonus(decision: string): number {
    if (decision === "continue") return 50;
    if (decision === "reduce") return 25;
    return 10;
}


