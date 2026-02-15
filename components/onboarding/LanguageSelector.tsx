"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";
import { Check, Loader2 } from "lucide-react";

// Language Data
const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' }
];

export function LanguageSelector() {
    const { setLanguage } = useLanguage();
    const [selected, setSelected] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleSelect = (code: string) => {
        setSelected(code);
        setIsAnimating(true);

        // Simulating a smooth transition/loading effect
        setTimeout(() => {
            setLanguage(code as any);
        }, 800); // Allow animation to play
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/30 blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="relative z-10 w-full max-w-4xl px-6 py-12 text-center animate-in fade-in zoom-in-95 duration-700">

                {/* Header */}
                <div className="mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/20 mb-6 animate-in slide-in-from-top-4 duration-1000">
                        <span className="text-2xl font-bold text-white">e</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Select Your Language
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Choose your preferred language to continue to <span className="font-semibold text-indigo-600 dark:text-indigo-400">excel.al</span>
                    </p>
                </div>

                {/* Language Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {languages.map((lang, index) => (
                        <div
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={cn(
                                "group relative flex items-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 cursor-pointer transition-all duration-300",
                                "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1",
                                selected === lang.code && "ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 scale-105 shadow-xl shadow-indigo-500/20",
                                isAnimating && selected !== lang.code && "opacity-50 scale-95 blur-[1px]",
                                // Stagger animation
                                `animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[${index * 100}ms]`
                            )}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="mr-4 text-3xl drop-shadow-sm filter grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110">
                                {lang.flag}
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className={cn(
                                    "font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
                                    selected === lang.code && "text-indigo-700 dark:text-indigo-300"
                                )}>
                                    {lang.native}
                                </h3>
                                <p className="text-xs text-slate-400 group-hover:text-slate-500 font-medium">
                                    {lang.name}
                                </p>
                            </div>

                            {/* Selection Indicator */}
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                selected === lang.code
                                    ? "border-indigo-600 bg-indigo-600 text-white scale-100 opacity-100"
                                    : "border-slate-200 dark:border-slate-700 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-90"
                            )}>
                                {selected === lang.code && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Loading State */}
                <div className="mt-12 h-6 flex items-center justify-center">
                    {isAnimating && (
                        <div className="flex items-center gap-2 text-indigo-600 animate-in fade-in duration-300">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Setting up your workspace...</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
