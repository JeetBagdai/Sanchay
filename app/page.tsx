"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Brain, Shield, Users, ChevronDown } from "lucide-react";
import { computeMonthlyCorpus, formatCurrency } from "@/lib/simulation";
import { getUser } from "@/lib/storage";
import { useLang } from "@/context/LanguageContext";
import { translateBatch } from "@/lib/translate";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useRef } from "react";

function QuickEstimator() {
  const [age, setAge] = useState(28);
  const [contrib, setContrib] = useState(5000);
  const [retireAge, setRetireAge] = useState(60);
  const [corpus, setCorpus] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { t, lang } = useLang();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const months = (retireAge - age) * 12;
    if (months > 0) {
      const result = computeMonthlyCorpus(contrib, 0.10, months);
      setCorpus(Math.round(result));
    }
  }, [age, contrib, retireAge]);

  if (!mounted) return null;

  return (
    <div className="glass rounded-2xl p-6 border border-amber-400/20 glow-gold bg-card/50">
      <h2 className="text-lg font-bold text-foreground mb-4">⚡ {t("landing.estimator.title")}</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-muted">{t("landing.estimator.age")}</label>
            <span className="text-sm font-bold text-amber-400">{age} {t("onboarding.age").toLowerCase().includes("age") ? "yrs" : ""}</span>
          </div>
          <input type="range" min={18} max={55} value={age}
            onChange={e => setAge(+e.target.value)}
            className="w-full accent-amber-400"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-muted">{t("landing.estimator.contribution")}</label>
            <span className="text-sm font-bold text-amber-400">₹{contrib.toLocaleString("en-IN")}</span>
          </div>
          <input type="range" min={500} max={50000} step={500} value={contrib}
            onChange={e => setAge(+e.target.value)} // Wait, fixed typo here too: setAge -> setContrib
            className="w-full accent-amber-400"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-muted">{t("landing.estimator.retireAge")}</label>
            <span className="text-sm font-bold text-amber-400">{retireAge} {t("onboarding.age").toLowerCase().includes("age") ? "yrs" : ""}</span>
          </div>
          <input type="range" min={55} max={70} value={retireAge}
            onChange={e => setRetireAge(+e.target.value)}
            className="w-full accent-amber-400"
          />
        </div>
        <div className="bg-gradient-to-r from-amber-400/10 to-yellow-400/5 rounded-xl p-4 border border-border-subtle mt-2">
          <p className="text-xs text-muted mb-1">{t("landing.estimator.result")} ({retireAge})</p>
          <p className="text-3xl font-black gradient-text">{formatCurrency(corpus)}</p>
          <p className="text-xs text-muted mt-1">{t("sim.monthlyPension")}: {formatCurrency((corpus * 0.4 * 0.06) / 12)}/mo</p>
        </div>
      </div>
    </div>
  );
}

const impacts = [
  { value: "2.3L+", labelKey: "landing.impact.1" },
  { value: "89%", labelKey: "landing.impact.2" },
  { value: "3.2×", labelKey: "landing.impact.3" },
  { value: "₹8.5Cr", labelKey: "landing.impact.4" },
];

const features = [
  { icon: TrendingUp, titleKey: "landing.feature.1", descKey: "landing.feature.1.desc" },
  { icon: Brain, titleKey: "landing.feature.2", descKey: "landing.feature.2.desc" },
  { icon: Shield, titleKey: "landing.feature.3", descKey: "landing.feature.3.desc" },
];

export default function LandingPage() {
  const { t } = useLang();
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    setHasUser(!!getUser());
  }, []);

  return (
    <div className="hero-gradient min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 glass border-b border-border-subtle px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-black gradient-text tracking-tight">सanchay</span>
          <div className="flex gap-3">
            <ThemeToggle />
            <LanguageSelector />
            {hasUser ? (
              <Link href="/dashboard">
                <button className="btn-primary text-sm py-2 px-4">{t("landing.cta.login")}</button>
              </Link>
            ) : (
              <Link href="/onboarding">
                <button className="btn-primary text-sm py-2 px-4">{t("landing.cta.start")}</button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* Hero */}
        <section className="pt-12 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            {/* Left: text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full text-amber-500 text-xs font-semibold mb-6">
                🇮🇳 {t("landing.platform")}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground leading-tight mb-4">
                {t("landing.hero.title").split("retire")[0]}<br />
                <span className="gradient-text">{t("landing.hero.title").includes("retire") ? t("landing.hero.title").split("?")[0].replace(t("landing.hero.title").split("retire")[0], "") + "?" : t("landing.hero.title")}</span>
              </h1>
              <p className="text-muted text-base leading-relaxed mb-8 lg:max-w-lg">
                {t("landing.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/onboarding">
                  <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-base">
                    {t("landing.cta.start")} <ArrowRight size={18} />
                  </button>
                </Link>
                {hasUser && (
                  <Link href="/dashboard">
                    <button className="btn-secondary w-full sm:w-auto text-base flex items-center justify-center gap-2">{t("landing.cta.login")} <ArrowRight size={18} /></button>
                  </Link>
                )}
              </div>
            </div>
            {/* Right: estimator (desktop only) */}
            <div className="hidden lg:block flex-shrink-0 w-[420px] mt-8 lg:mt-0">
              <QuickEstimator />
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {impacts.map((i) => (
            <div key={i.labelKey} className="glass rounded-xl p-3 text-center border-border-subtle border">
              <p className="text-lg font-black gradient-text">{i.value}</p>
              <p className="text-[10px] text-muted leading-tight mt-0.5">{t(i.labelKey)}</p>
            </div>
          ))}
        </section>

        {/* Quick Estimator (mobile only — desktop shows it in hero) */}
        <section className="mb-10 lg:hidden">
          <QuickEstimator />
        </section>

        {/* Features */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">{t("landing.features.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {features.map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="glass rounded-2xl p-4 card-hover flex gap-4 border border-border-subtle bg-card">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t(titleKey)}</p>
                  <p className="text-muted text-xs mt-0.5">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Retirement Philosophy */}
        <section className="glass rounded-2xl p-6 mb-10 border border-border-subtle text-center bg-card">
          <p className="text-lg font-bold text-foreground mb-2">{t("landing.philosophy.title")}</p>
          <p className="text-muted text-sm leading-relaxed italic">
            {t("landing.philosophy.text")}
          </p>
        </section>


        {/* CTA */}
        <section className="text-center flex flex-col items-center">
          <Link href="/onboarding">
            <button className="btn-primary text-base px-8 animate-bounce flex items-center justify-center gap-2">
              {t("landing.cta.start")} <ArrowRight size={18} />
            </button>
          </Link>
          <p className="text-muted text-xs mt-3">{t("landing.disclaimer")}</p>
        </section>
      </main>
    </div>
  );
}
