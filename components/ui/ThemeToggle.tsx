"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-muted hover:text-foreground hover:bg-card transition-colors border border-transparent hover:border-border-subtle"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <Sun size={18} className="text-amber-400" />
            ) : (
                <Moon size={18} className="text-blue-500" />
            )}
        </button>
    );
}
