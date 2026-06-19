# सanchay – Gamified Pension Readiness & Cognitive Personalization Engine

🚀 **Live Demo**: [https://sanchay-pension.netlify.app](https://sanchay-pension.netlify.app)

Sanchay is an advanced, gamified behavioral finance and literacy platform engineered to accelerate retirement readiness and National Pension System (NPS) awareness among India's young workforce. By integrating behavioral economics, adversarial AI debate coaching, time-forward simulation models, and contextual cognitive personalization, Sanchay shifts pension planning from passive math to active, consequential choice.

---

## 🏛️ System Architecture & Stack

Sanchay is engineered with a modern, high-performance web stack:
- **Core Framework**: [Next.js](https://nextjs.org/) (v16.1.6) & [React 19](https://react.dev/) utilizing Turbopack compilation.
- **Styling Architecture**: [TailwindCSS v4](https://tailwindcss.com/) with PostCSS, incorporating customized HSL tokens, absolute glassmorphism, and dark-mode radial gradients.

---

## 🌟 Core Engines & Capabilities

### 1. AI-Driven Cognitive Personalization
Abstract financial policies can create a cognitive barrier for young professionals. Sanchay resolves this through on-the-fly LLM-based translation of pension mechanics into familiar domains.
- **Analogy Personalization**: Rewrites learning cards using context-aware mapping to custom themes (e.g. comparing compounding to soil cultivation in *Farming*, or active asset rebalancing to batting partnerships in *Cricket*).
- **Validation Pipeline**: Checks user-submitted analogy topics for pedagogical viability via an automated evaluation model before allowing enrollment.

### 2. Adversarial AI Debate Coach
Pensions are often met with behavioral skepticism. The AI Debate Coach acts as a contrarian sparring partner to challenge assumptions and reinforce regulatory knowledge.
- **Combative Agent**: Opposes the user using fact-based arguments, cynical pushbacks, and regulatory data points.
- **Parallel Judge**: Evaluates every user turn to determine if a logically valid argument has been constructed.

### 3. The "Delay Trap" Lifecycle Simulator
A behavioral simulator that projects long-term consequences of temporary financial decisions.
- **Time-Forward Modeling**: Fast-forwards the user's timeline to age 30 and triggers a high-expense event (e.g. EMIs, rent inflation).

### 4. Empirical Pension Readiness Index
Tracks user progress and behavior through a multi-dimensional scoring rubric:
- **Knowledge Points**: Earned by solving concept quizzes.
- **Module Completion**: Points awarded for mastering learning pathways.

---

## 📂 Project Directory Structure

```text
sanchay-app/
├── app/                  # Next.js App Router folders & pages
│   ├── ai-coach/        # Q&A and Debate Coach interface
│   ├── api/             # API routes (chat, analogy, validate, translate)
│   ├── dashboard/       # Dashboard & DNA profiling center
│   ├── modules/         # Interactive learning modules & dynamic card renderer
│   ├── onboarding/      # Profile builder & personalization step
│   ├── settings/        # Locale toggles & analogy controllers
│   ├── simulation/      # The Delay Trap simulation flow
│   └── globals.css      # Core theme, variables, styling & animations
├── components/          # Reusable UI cards, nav bars, and charts
├── context/             # Global providers for languages & analogy states
├── lib/                 # Utility logic (simulation formulas, scoring, constants)
├── public/              # Static media assets and localized locale JSON files
└── scripts/             # Developer translation and compilation scripts
```

---

## 🚀 Execution & Verification

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Development Server
Initialize the local dev server:
```bash
npm run dev
```

### Production Build
Verify compilation, type safety, and bundle optimization:
```bash
npm run build
```
