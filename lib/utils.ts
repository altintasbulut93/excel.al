import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency using Intl.NumberFormat
 * @param value - The number to format
 * @param currency - Currency code (e.g., "TRY", "USD", "EUR")
 * @param locale - Locale string (e.g., "tr-TR", "en-US")
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'TRY', locale: string = 'tr-TR'): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  // Number format without currency for the numeric part
  const numerFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedValue = numerFormatter.format(value);

  // Symbol mapping
  let symbol = '₺';
  if (currency === 'USD') symbol = '$';
  else if (currency === 'EUR') symbol = '€';
  else if (currency === 'GBP') symbol = '£';
  else if (currency === 'TRY') symbol = '₺';

  // Return with symbol at the end (as requested: "sayılaların sonunda seçilen para kısaltması logosu olsun")
  return `${formattedValue} ${symbol}`;
}
