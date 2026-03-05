"use client";
import Link from "next/link";
import { Settings, Globe } from "lucide-react";
import { useLang, Lang } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface TopbarProps { score?: number; name?: string; }

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
    { code: "kok", native: "कोंकणी" },
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

export default function Topbar({ score, name }: TopbarProps) {
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

    const currentLabel = LANG_OPTIONS.find(l => l.code === lang)?.native ?? lang.toUpperCase();

    return (
        <header className="sticky top-0 z-40 glass border-b border-border-subtle px-4 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-black gradient-text tracking-tight">सanchay</span>
                </Link>
                <div className="flex items-center gap-3">
                    {score !== undefined && (
                        <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                            <span className="text-amber-400 text-xs font-bold">⚡ {score}</span>
                        </div>
                    )}
                    {name && <span className="text-muted text-sm hidden sm:block">{name}</span>}
                    {/* Theme & Language */}
                    <ThemeToggle />
                    <LanguageSelector />

                    <Link href="/settings" className="text-muted hover:text-foreground transition-colors">
                        <Settings size={20} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
