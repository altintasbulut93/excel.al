// i18n Translation System
// Lightweight translation utility for excel.al

type Translations = Record<string, any>;

const translations: Record<string, Translations> = {};

/**
 * Load translation file for a locale
 */
export async function loadTranslations(locale: string): Promise<Translations> {
    if (translations[locale]) {
        return translations[locale];
    }

    try {
        const response = await fetch(`/locales/${locale}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${locale}`);
        }
        const data = await response.json();
        translations[locale] = data;
        return data;
    } catch (error) {
        console.error(`Error loading translations for ${locale}:`, error);
        // Fallback to en-US
        if (locale !== 'en-US') {
            return loadTranslations('en-US');
        }
        return {};
    }
}

/**
 * Get translation for a key
 * @param key - Translation key (e.g., "dashboard.title")
 * @param locale - Locale code (e.g., "tr-TR")
 * @param params - Optional parameters for interpolation
 */
export function t(key: string, locale: string = 'en-US', params?: Record<string, string | number>): string {
    const trans = translations[locale] || {};

    // Navigate nested keys
    const keys = key.split('.');
    let value: any = trans;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Key not found, return key itself
            return key;
        }
    }

    if (typeof value !== 'string') {
        return key;
    }

    // Interpolate parameters
    if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return paramKey in params ? String(params[paramKey]) : match;
        });
    }

    return value;
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
    value: number,
    locale: string = 'en-US',
    currency: string = 'USD'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    } catch (error) {
        // Fallback
        return `${currency} ${value.toLocaleString()}`;
    }
}

/**
 * Format date based on locale
 */
export function formatDate(
    date: Date | string,
    locale: string = 'en-US',
    options?: Intl.DateTimeFormatOptions
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };

    try {
        return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
    } catch (error) {
        return dateObj.toLocaleDateString();
    }
}

/**
 * Format number based on locale
 */
export function formatNumber(
    value: number,
    locale: string = 'en-US',
    options?: Intl.NumberFormatOptions
): string {
    try {
        return new Intl.NumberFormat(locale, options).format(value);
    } catch (error) {
        return value.toLocaleString();
    }
}

/**
 * Format percentage
 */
export function formatPercentage(
    value: number,
    locale: string = 'en-US',
    decimals: number = 1
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(value / 100);
    } catch (error) {
        return `${value.toFixed(decimals)}%`;
    }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string, locale: string = 'en-US'): string {
    const symbols: Record<string, string> = {
        'TRY': '₺',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
    };

    return symbols[currencyCode] || currencyCode;
}

/**
 * Get locale from country code
 */
export function getLocaleFromCountry(countryCode: string): string {
    const localeMap: Record<string, string> = {
        'TR': 'tr-TR',
        'US': 'en-US',
        'UK': 'en-GB',
        'DE': 'de-DE',
        'FR': 'fr-FR',
    };

    return localeMap[countryCode] || 'en-US';
}

/**
 * Get currency from country code
 */
export function getCurrencyFromCountry(countryCode: string): string {
    const currencyMap: Record<string, string> = {
        'TR': 'TRY',
        'US': 'USD',
        'UK': 'GBP',
        'DE': 'EUR',
        'FR': 'EUR',
    };

    return currencyMap[countryCode] || 'USD';
}

/**
 * Preload translations for a locale
 */
export async function preloadTranslations(locale: string): Promise<void> {
    await loadTranslations(locale);
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): string[] {
    return ['tr-TR', 'en-US', 'en-GB', 'de-DE', 'fr-FR'];
}

/**
 * Detect browser locale
 */
export function detectBrowserLocale(): string {
    if (typeof window === 'undefined') {
        return 'en-US';
    }

    const browserLocale = navigator.language || 'en-US';

    // Check if we support this locale
    const available = getAvailableLocales();
    if (available.includes(browserLocale)) {
        return browserLocale;
    }

    // Try language code only (e.g., "tr" from "tr-TR")
    const languageCode = browserLocale.split('-')[0];
    const match = available.find(l => l.startsWith(languageCode));

    return match || 'en-US';
}
