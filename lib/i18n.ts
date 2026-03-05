export type Lang = "en" | "hi";

const translations: Record<string, Record<Lang, string>> = {
    "nav.home": { en: "Home", hi: "होम" },
    "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
    "nav.modules": { en: "Modules", hi: "मॉड्यूल" },
    "nav.simulation": { en: "Simulation", hi: "सिमुलेशन" },
    "nav.aiCoach": { en: "AI Coach", hi: "AI कोच" },
    "nav.leaderboard": { en: "Leaderboard", hi: "लीडरबोर्ड" },
    "nav.settings": { en: "Settings", hi: "सेटिंग्स" },

    // Landing
    "landing.hero.title": { en: "Will You Have Enough to Retire?", hi: "क्या आपके पास रिटायरमेंट के लिए पर्याप्त होगा?" },
    "landing.hero.subtitle": { en: "Most Indians won't. Sanchay trains your pension discipline through simulations, AI debate, and behavioral science.", hi: "अधिकांश भारतीयों के पास नहीं होगा। सanchay सिमुलेशन और AI के माध्यम से आपकी पेंशन अनुशासन को प्रशिक्षित करता है।" },
    "landing.cta.start": { en: "Start Your Journey", hi: "अपनी यात्रा शुरू करें" },
    "landing.cta.login": { en: "Continue Journey", hi: "यात्रा जारी रखें" },
    "landing.estimator.title": { en: "Quick Retirement Estimator", hi: "त्वरित सेवानिवृत्ति अनुमानक" },
    "landing.estimator.age": { en: "Your Age", hi: "आपकी उम्र" },
    "landing.estimator.contribution": { en: "Monthly NPS Contribution (₹)", hi: "मासिक NPS योगदान (₹)" },
    "landing.estimator.retireAge": { en: "Target Retirement Age", hi: "लक्ष्य सेवानिवृत्ति आयु" },
    "landing.estimator.projectedCorpus": { en: "Projected Corpus at 60", hi: "60 पर अनुमानित कॉर्पस" },

    // Onboarding
    "onboarding.title": { en: "Let's Build Your Retirement Profile", hi: "चलिए आपकी सेवानिवृत्ति प्रोफ़ाइल बनाते हैं" },
    "onboarding.name": { en: "Your Name", hi: "आपका नाम" },
    "onboarding.email": { en: "Email Address", hi: "ईमेल पता" },
    "onboarding.age": { en: "Current Age", hi: "वर्तमान आयु" },
    "onboarding.income": { en: "Monthly Income (₹)", hi: "मासिक आय (₹)" },
    "onboarding.contribution": { en: "Monthly NPS Contribution (₹)", hi: "मासिक NPS योगदान (₹)" },
    "onboarding.retireAge": { en: "Target Retirement Age", hi: "लक्ष्य सेवानिवृत्ति आयु" },
    "onboarding.next": { en: "Next →", hi: "अगला →" },
    "onboarding.back": { en: "← Back", hi: "← वापस" },
    "onboarding.begin": { en: "Begin My Journey", hi: "मेरी यात्रा शुरू करें" },

    // Dashboard
    "dashboard.welcome": { en: "Welcome back", hi: "वापस स्वागत है" },
    "dashboard.score": { en: "Pension Readiness Score", hi: "पेंशन तैयारी स्कोर" },
    "dashboard.modules": { en: "Learning Modules", hi: "सीखने के मॉड्यूल" },
    "dashboard.streak": { en: "Day Streak", hi: "दिन की लकीर" },
    "dashboard.startSimulation": { en: "Enter Simulation", hi: "सिमुलेशन में प्रवेश करें" },
    "dashboard.askAI": { en: "Ask AI Coach", hi: "AI कोच से पूछें" },
    "dashboard.locked": { en: "Complete 3 modules to unlock", hi: "अनलॉक करने के लिए 3 मॉड्यूल पूरे करें" },

    // Module
    "module.quiz": { en: "Quiz", hi: "प्रश्नोत्तरी" },
    "module.correct": { en: "+5 points! Excellent!", hi: "+5 अंक! उत्कृष्ट!" },
    "module.wrong": { en: "Not quite. Here's why:", hi: "सही नहीं। यहाँ कारण है:" },
    "module.complete": { en: "Module Complete! 🎉", hi: "मॉड्यूल पूर्ण! 🎉" },
    "module.next": { en: "Next →", hi: "अगला →" },
    "module.continue": { en: "Continue", hi: "जारी रखें" },

    // Simulation
    "sim.title": { en: "The Delay Trap", hi: "देरी का罗" },
    "sim.subtitle": { en: "Experience what happens when you delay your NPS contributions", hi: "अनुभव करें कि NPS योगदान में देरी से क्या होता है" },
    "sim.age30.title": { en: "Age 30 Decision", hi: "30 वर्ष का निर्णय" },
    "sim.age30.body": { en: "Life got expensive. EMIs, rent, lifestyle. What do you do with your NPS?", hi: "जीवन महंगा हो गया। EMI, किराया, जीवनशैली। NPS के साथ क्या करते हैं?" },
    "sim.decision.continue": { en: "Stay the course", hi: "जारी रखें" },
    "sim.decision.reduce": { en: "Reduce by 50%", hi: "50% कम करें" },
    "sim.decision.stop": { en: "Stop contributing", hi: "योगदान बंद करें" },
    "sim.result.title": { en: "Your Retirement Outcome", hi: "आपका सेवानिवृत्ति परिणाम" },
    "sim.finalCorpus": { en: "Final Corpus at 60", hi: "60 पर अंतिम कॉर्पस" },
    "sim.monthlyPension": { en: "Estimated Monthly Pension", hi: "अनुमानित मासिक पेंशन" },
    "sim.opportunityCost": { en: "Opportunity Cost", hi: "अवसर लागत" },
    "sim.monthlyExpense": { en: "Monthly Expenses at 60 (inflation adjusted)", hi: "60 पर मासिक खर्च (मुद्रास्फीति समायोजित)" },

    // AI Coach
    "ai.title": { en: "AI Pension Coach", hi: "AI पेंशन कोच" },
    "ai.placeholder": { en: "Ask about NPS rules, tax benefits, or start a debate...", hi: "NPS नियमों, कर लाभ के बारे में पूछें, या बहस शुरू करें..." },
    "ai.debateMode": { en: "Start AI Debate", hi: "AI बहस शुरू करें" },
    "ai.qaMode": { en: "Ask a Question", hi: "प्रश्न पूछें" },

    // Leaderboard
    "lb.title": { en: "Pension Warriors", hi: "पेंशन योद्धा" },
    "lb.rank": { en: "Rank", hi: "रैंक" },
    "lb.name": { en: "Name", hi: "नाम" },
    "lb.score": { en: "Score", hi: "स्कोर" },
    "lb.dna": { en: "DNA Profile", hi: "DNA प्रोफ़ाइल" },

    // Settings
    "settings.title": { en: "Settings", hi: "सेटिंग्स" },
    "settings.language": { en: "Language", hi: "भाषा" },
    "settings.reset": { en: "Reset Progress", hi: "प्रगति रीसेट करें" },
    "settings.resetConfirm": { en: "Are you sure? This will erase all your progress.", hi: "क्या आप सुनिश्चित हैं? यह आपकी सारी प्रगति मिटा देगा।" },

    // Misc
    "common.points": { en: "points", hi: "अंक" },
    "common.loading": { en: "Loading...", hi: "लोड हो रहा है..." },
    "common.back": { en: "← Back", hi: "← वापस" },
    "common.locked": { en: "Locked", hi: "लॉक" },
    "common.completed": { en: "Completed", hi: "पूर्ण" },
    "common.stars": { en: "stars", hi: "सितारे" },
};

export function t(key: string, lang: Lang = "en"): string {
    return translations[key]?.[lang] ?? translations[key]?.en ?? key;
}
