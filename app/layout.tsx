import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AnalogyProvider } from "@/context/AnalogyContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sanchay – Gamified Pension Readiness",
  description: "Train your pension discipline with simulations, AI debate, and behavioral science. India's NPS literacy platform.",
  keywords: "NPS, pension, retirement planning, India, PFRDA, NPS calculator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <AnalogyProvider>
              {children}
            </AnalogyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
