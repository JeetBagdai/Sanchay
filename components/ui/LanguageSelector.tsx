"use client";
import { Globe } from "lucide-react";
import { useLang, Lang } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";

const LANG_OPTIONS: { code: Lang; native: string }[] = [
    { code: "en", native: "English" },
    { code: "as", native: "অসমীয়া" },
    { code: "bn", native: "বাংলা" },
    { code: "brx", native: "बड़ो" },
    { code: "doi", native: "डोगरी" },
    { code: "gu", native: "ગુજરાતી" },
    { code: "hi", native: "हिन्दी" },
    { code: "kn", native: "ಕನ್ನಡ" },
    { code: "ks", native: "كٲشُر" },
    { code: "kok", native: "कोंکણી" },
    { code: "mai", native: "मैथिली" },
    { code: "ml", native: "മലയാളം" },
    { code: "mni", native: "মেইতেই" },
    { code: "mr", native: "मराठी" },
    { code: "ne", native: "नेपाली" },
    { code: "or", native: "ଓଡ଼ିଆ" },
    { code: "pa", native: "ਪੰਜਾਬੀ" },
    { code: "sa", native: "संस्कृतम्" },
    { code: "sd", native: "سنڌي" },
    { code: "ta", native: "தமிழ்" },
    { code: "te", native: "తెలుగు" },
    { code: "ur", native: "اردو" },
];

export default function LanguageSelector() {
    const { lang, setLang, translating } = useLang();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                disabled={translating}
                className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-card disabled:opacity-50 border border-border-subtle"
                title="Switch language"
            >
                <Globe size={18} className={translating ? "animate-spin" : ""} />
                <span className="text-xs font-bold uppercase">{lang}</span>
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border-subtle rounded-xl shadow-2xl overflow-y-auto z-50 w-52" style={{ maxHeight: "60vh" }}>
                    {LANG_OPTIONS.map(l => (
                        <button
                            key={l.code}
                            onClick={() => { setLang(l.code); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${lang === l.code ? "bg-blue-500/20 text-blue-500 font-bold" : "text-foreground hover:bg-foreground/5"}`}
                        >
                            {l.native}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
