"use client";

import { useLanguage } from "@/lib/i18n-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const languages = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'tr', flag: '🇹🇷', label: 'Türkçe' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'ar', flag: '🇸🇦', label: 'العربية' },
    { code: 'pt', flag: '🇵🇹', label: 'Português' }
];

export function HeaderLanguageSelector() {
    const { language, setLanguage } = useLanguage();

    // Default to EN flag if null
    const currentLang = languages.find(l => l.code === (language || 'en')) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-sm shadow-sm hover:bg-slate-100 transition-all duration-200"
                >
                    <span className="text-xl leading-none filter drop-shadow-sm">{currentLang.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-md border-slate-100 shadow-xl rounded-xl p-1">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code as any)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer focus:bg-slate-100",
                            language === lang.code && "bg-blue-50 text-blue-700 font-medium"
                        )}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm">{lang.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
