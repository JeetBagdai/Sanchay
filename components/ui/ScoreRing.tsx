"use client";
import { useEffect, useRef } from "react";

interface ScoreRingProps {
    score: number;
    maxScore: number;
    size?: number;
    label?: string;
    color?: string;
}

export default function ScoreRing({ score, maxScore, size = 120, label, color = "#f59e0b" }: ScoreRingProps) {
    const percentage = Math.min(100, (score / maxScore) * 100);
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="rotate-[-90deg]">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-glass)" strokeWidth={10} />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius} fill="none"
                        stroke={color} strokeWidth={10}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                    <span className="text-2xl font-black" style={{ color }}>{score}</span>
                    <span className="text-xs text-muted">/{maxScore}</span>
                </div>
            </div>
            {label && <span className="text-xs text-muted font-medium text-center">{label}</span>}
        </div>
    );
}
