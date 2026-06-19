# सanchay – Gamified Pension Readiness & Cognitive Personalization Engine

Sanchay is an advanced, gamified behavioral finance and literacy platform engineered to accelerate retirement readiness and National Pension System (NPS) awareness among India's young workforce. By integrating behavioral economics, adversarial AI debate coaching, time-forward simulation models, and contextual cognitive personalization, Sanchay shifts pension planning from passive math to active, consequential choice.

---

## 🏛️ System Architecture & Stack

Sanchay is engineered with a modern, high-performance web stack:
- **Core Framework**: [Next.js](https://nextjs.org/) (v16.1.6) & [React 19](https://react.dev/) utilizing Turbopack compilation.
- **Styling Architecture**: [TailwindCSS v4](https://tailwindcss.com/) with PostCSS, incorporating customized HSL tokens, absolute glassmorphism, and dark-mode radial gradients.
- **Interactive Visualizations**: [Recharts](https://recharts.org/) for high-fidelity portfolio growth modeling and opportunity cost charting.
- **Vector / Iconography**: [Lucide React](https://lucide.dev/) for crisp, scalable visual indicators.
- **AI Integrations**: Server-side chat completions utilizing the Groq SDK and `llama-3.1-8b-instant` models.
- **Persistent State**: Local-first browser persistence layer managing profile metadata, active streaks, and score matrices.

---

## 🌟 Core Engines & Capabilities

### 1. AI-Driven Cognitive Personalization
Abstract financial policies can create a cognitive barrier for young professionals. Sanchay resolves this through on-the-fly LLM-based translation of pension mechanics into familiar domains.
- **Analogy Personalization**: Rewrites learning cards using context-aware mapping to custom themes (e.g. comparing compounding to soil cultivation in *Farming*, or active asset rebalancing to batting partnerships in *Cricket*).
- **Validation Pipeline**: Checks user-submitted analogy topics for pedagogical viability via an automated evaluation model before allowing enrollment.
- **Performance Caching**: Employs client-side caching of AI translations using `sessionStorage` to eliminate network round-trips and optimize API token usage.

### 2. Adversarial AI Debate Coach
Pensions are often met with behavioral skepticism. The AI Debate Coach acts as a contrarian sparring partner to challenge assumptions and reinforce regulatory knowledge.
- **Combative Agent**: Opposes the user using fact-based arguments, cynical pushbacks, and regulatory data points.
- **Parallel Judge**: Evaluates every user turn to determine if a logically valid argument has been constructed.
- **Verdict Engine**: Computes a final 1-to-5 star performance score based on factual accuracy, logical rigor, and persuasiveness, awarding points based on the final grade.

### 3. The "Delay Trap" Lifecycle Simulator
A behavioral simulator that projects long-term consequences of temporary financial decisions.
- **Time-Forward Modeling**: Fast-forwards the user's timeline to age 30 and triggers a high-expense event (e.g. EMIs, rent inflation).
- **Outcome Analysis**: Compares the final corpus against a continuous baseline, visualizing the opportunity cost of pausing contributions.
- **Healthcare & Living Cost Indexing**: Projects final annuity pension values directly against inflation-indexed healthcare and monthly expenses (using 6% and 7% annual indices) to expose potential retirement deficits.

### 4. Empirical Pension Readiness Index
Tracks user progress and behavior through a multi-dimensional scoring rubric:
- **Knowledge Points**: Earned by solving concept quizzes.
- **Module Completion**: Points awarded for mastering learning pathways.
- **Simulation Bonus**: Points scaled to the financial discipline demonstrated during the simulation.
- **Debate Metrics**: Points linked to debate performance ratings.
- **Retirement DNA**: Classifies users into behavioral categories (*The Saver, The Curious Learner, The Procrastinator, The Freedom Architect*) based on cumulative readiness scores.

### 5. Multilingual Localization Engine
Engineered to deliver high-quality financial education across diverse demographics, with first-class support for **22 official Indian languages** (including Hindi, Bengali, Gujarati, Tamil, Telugu, Kannada, Sanskrit, and Urdu).
- Uses static dictionary JSON locales for instant client-side rendering.
- Integrates a parallelized fallback translation API (/api/translate) that utilizes MyMemory and Lingva endpoints to translate AI responses dynamically without browser rate limiting.

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
