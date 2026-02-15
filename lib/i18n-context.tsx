"use client";


import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language as TranslationsLanguage } from './translations';

export type Language = TranslationsLanguage;

interface LanguageContextType {
    language: Language | null;
    setLanguage: (lang: Language) => void;
    t: (key: string, variables?: Record<string, string | number>) => string;
    isLoading: boolean;
    dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en'); // Default to 'en' immediately to avoid null flashes

    // Load saved language on mount
    useEffect(() => {
        // Check URL first
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang') as Language;

        // Check LocalStorage
        const savedLang = localStorage.getItem('excel_al_language') as Language;

        const finalLang = urlLang || savedLang;

        if (finalLang && translations[finalLang]) {
            setLanguageState(finalLang);
            if (urlLang) localStorage.setItem('excel_al_language', urlLang);
        } else {
            // Detect browser language roughly? No, stick to EN default or generic
            // keeping 'en' as default set above.
        }

    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('excel_al_language', lang);

        // Update HTML dir attribute for RTL support (Arabic)
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    };

    // Recursive key lookup: t("common.welcome")
    const t = (key: string, variables?: Record<string, string | number>): string => {
        const keys = key.split('.');
        const langData = translations[language] || translations['en'];

        let value: any = langData;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Key not found in current lang, try fallback to EN
                if (language !== 'en') {
                    let enValue: any = translations['en'];
                    for (const ek of keys) {
                        if (enValue && typeof enValue === 'object' && ek in enValue) {
                            enValue = enValue[ek];
                        } else {
                            // Even EN fallback failed
                            return key;
                        }
                    }
                    value = enValue;
                    break; // Found in EN, proceed to replacement
                }
                return key;
            }
        }

        if (typeof value === 'string') {
            let result = value;
            if (variables) {
                Object.entries(variables).forEach(([k, v]) => {
                    result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
                });
            }
            return result;
        }

        return key;
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            isLoading: false,
            dir: language === 'ar' ? 'rtl' : 'ltr'
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
