"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Zap, Bot, Trophy } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const NAV_KEYS = [
    { href: "/dashboard", icon: LayoutDashboard, key: "bottomnav.dashboard" },
    { href: "/modules", icon: FileText, key: "bottomnav.modules" },
    { href: "/simulation", icon: Zap, key: "bottomnav.simulate" },
    { href: "/ai-coach", icon: Bot, key: "bottomnav.aiCoach" },
    { href: "/leaderboard", icon: Trophy, key: "bottomnav.ranks" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { t } = useLang();

    return (
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 glass border-t border-border-subtle">
            <div className="flex items-center justify-around py-2 max-w-5xl mx-auto">
                {NAV_KEYS.map(({ href, icon: Icon, key }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${active ? "text-amber-400" : "text-muted hover:text-foreground"
                                }`}
                        >
                            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                            <span className="text-[10px] font-medium">{t(key)}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
