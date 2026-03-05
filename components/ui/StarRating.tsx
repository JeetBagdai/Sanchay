"use client";
import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 28, readonly = false }: StarRatingProps) {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    disabled={readonly}
                    onClick={() => onChange?.(s)}
                    onMouseEnter={() => !readonly && setHovered(s)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className="star transition-transform duration-100 disabled:cursor-default"
                    style={{ background: "none", border: "none", padding: 2 }}
                >
                    <Star
                        size={size}
                        className={s <= display ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                        style={{ transition: "color 0.15s, fill 0.15s" }}
                    />
                </button>
            ))}
        </div>
    );
}
