import Link from "next/link";
import { Lock, CheckCircle, Star, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface ModuleCardProps {
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
    isCompleted: boolean;
    isLocked: boolean;
    stars?: number;
}

export default function ModuleCard({ id, title, description, icon, color, isCompleted, isLocked, stars }: ModuleCardProps) {
    const { t } = useLang();
    if (isLocked) {
        return (
            <div className="glass rounded-2xl p-4 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl opacity-40 grayscale`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-muted text-sm truncate">{title}</p>
                            <Lock size={12} className="text-muted shrink-0" />
                        </div>
                        <p className="text-xs text-muted truncate">{description}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link href={`/modules/${id}`}>
            <div className={`glass rounded-2xl p-4 card-hover cursor-pointer border ${isCompleted ? "border-emerald-500/30" : "border-border-subtle"}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground text-sm truncate">{title}</p>
                            {isCompleted && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted truncate">{description}</p>
                    </div>
                    {isCompleted && stars !== undefined && (
                        <div className="flex gap-0.5">
                            {[1, 2, 3].map(s => (
                                <Star key={s} size={12} className={s <= stars ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                            ))}
                        </div>
                    )}
                    {!isCompleted && (
                        <div className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 whitespace-nowrap flex items-center gap-1">
                            {t("module.start")} <ArrowRight size={12} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
