import { LIFESTYLE_CATEGORIES } from "./constants";

export interface SimulationPoint {
    age: number;
    corpus: number;
    totalContributed: number;
}

export interface SimulationResult {
    dataPoints: SimulationPoint[];
    finalCorpus: number;
    totalContributed: number;
    monthlyPension: number;
    opportunityCost: number;
    lifestyleCategory: typeof LIFESTYLE_CATEGORIES[0];
    inflationAdjustedMonthlyExpense: number;
    healthcareMonthlyEstimate: number;
    corpusDeficitOrSurplus: number;
    behaviorInsight: string;
}

export type ContributionDecision = "continue" | "reduce" | "stop";

export function computeMonthlyCorpus(
    monthlyContrib: number,
    annualRate: number,
    months: number
): number {
    if (months <= 0) return 0;
    const r = annualRate / 12;
    return monthlyContrib * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

export function growExistingCorpus(
    corpus: number,
    annualRate: number,
    months: number
): number {
    const r = annualRate / 12;
    return corpus * Math.pow(1 + r, months);
}

export function computeInflationAdjusted(
    todayAmount: number,
    annualInflation: number,
    years: number
): number {
    return todayAmount * Math.pow(1 + annualInflation, years);
}

export function getLifestyleCategory(corpus: number) {
    return LIFESTYLE_CATEGORIES.find((c) => corpus <= c.maxCorpus) || LIFESTYLE_CATEGORIES[LIFESTYLE_CATEGORIES.length - 1];
}

export function runSimulation(
    startAge: number,
    retireAge: number,
    monthlyContrib: number,
    annualRate: number = 0.10,
    decision: ContributionDecision = "continue",
    decisionAge: number = 30
): SimulationResult {
    const dataPoints: SimulationPoint[] = [];
    let corpus = 0;
    let totalContributed = 0;

    for (let age = startAge; age <= retireAge; age++) {
        const monthsFromStart = (age - startAge) * 12;

        let monthlyContribThisYear = monthlyContrib;
        if (age >= decisionAge) {
            if (decision === "stop") monthlyContribThisYear = 0;
            else if (decision === "reduce") monthlyContribThisYear = monthlyContrib * 0.5;
        }

        // Add this year's contributions
        const yearlyCorpusAdded = computeMonthlyCorpus(monthlyContribThisYear, annualRate, 12);
        const grownPrevious = growExistingCorpus(corpus, annualRate, 12);
        corpus = grownPrevious + yearlyCorpusAdded;
        totalContributed += monthlyContribThisYear * 12;

        dataPoints.push({ age, corpus: Math.round(corpus), totalContributed: Math.round(totalContributed) });
    }

    // Compute baseline (never stopped) for opportunity cost
    let baselineCorpus = 0;
    for (let age = startAge; age <= retireAge; age++) {
        const yearlyCorpusAdded = computeMonthlyCorpus(monthlyContrib, annualRate, 12);
        const grownPrevious = growExistingCorpus(baselineCorpus, annualRate, 12);
        baselineCorpus = grownPrevious + yearlyCorpusAdded;
    }

    const finalCorpus = corpus;
    const opportunityCost = Math.max(0, baselineCorpus - finalCorpus);

    // Monthly pension from 40% annuity at 6%
    const annuityCorpus = finalCorpus * 0.40;
    const monthlyPension = Math.round((annuityCorpus * 0.06) / 12);

    // Inflation adjusted expenses (25 year horizon, 6% inflation)
    const yearsToRetire = retireAge - startAge;
    const todayMonthlyLiving = 40000;
    const todayMonthlyHealthcare = 15000;
    const inflationAdjustedMonthlyExpense = Math.round(
        computeInflationAdjusted(todayMonthlyLiving, 0.06, yearsToRetire)
    );
    const healthcareMonthlyEstimate = Math.round(
        computeInflationAdjusted(todayMonthlyHealthcare, 0.07, yearsToRetire)
    );
    const totalMonthlyExpense = inflationAdjustedMonthlyExpense + healthcareMonthlyEstimate;

    // Compare monthly pension income vs monthly expenses
    // This is the meaningful comparison: can your annuity cover your bills?
    const monthlyShortfallOrSurplus = monthlyPension - totalMonthlyExpense;
    // Convert to corpus-equivalent for display (capitalize at 6% annuity rate)
    const corpusDeficitOrSurplus = Math.round((monthlyShortfallOrSurplus * 12) / 0.06);

    const lifestyleCategory = getLifestyleCategory(finalCorpus);

    let behaviorInsight = "";
    if (decision === "stop") {
        behaviorInsight = "Stopping contributions at 30 cost you ₹" + Math.round(opportunityCost / 100000) + " Lakhs in lost compounding. This is the most expensive financial decision you can make.";
    } else if (decision === "reduce") {
        behaviorInsight = "Reducing contributions by 50% cost you ₹" + Math.round(opportunityCost / 100000) + " Lakhs. Small cuts in your 30s = huge lifestyle differences in your 60s.";
    } else {
        behaviorInsight = "Staying disciplined with consistent contributions maximized your compounding potential. You've secured financial freedom!";
    }

    return {
        dataPoints,
        finalCorpus: Math.round(finalCorpus),
        totalContributed: Math.round(totalContributed),
        monthlyPension,
        opportunityCost: Math.round(opportunityCost),
        lifestyleCategory,
        inflationAdjustedMonthlyExpense,
        healthcareMonthlyEstimate,
        corpusDeficitOrSurplus: Math.round(corpusDeficitOrSurplus),
        behaviorInsight,
    };
}

export function formatCurrency(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
}
