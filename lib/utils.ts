import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Turkish Lira currency
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "₺1.234,56")
 */
export function formatCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "₺0";
  }

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
