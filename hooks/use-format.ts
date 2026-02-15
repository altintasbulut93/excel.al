"use client";

import { useFinancialStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

export function useFormat() {
    const { data } = useFinancialStore();
    const { language } = useLanguage();

    const currency = data?.pricing?.currency || 'TRY';
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';

    const format = (value: number) => {
        return formatCurrency(value, currency, locale);
    };

    return { format, currency };
}
