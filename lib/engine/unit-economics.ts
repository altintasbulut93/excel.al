import { UnitEconomics } from './types';

/**
 * UNIT ECONOMICS CALCULATOR
 * Birim ekonomisi metriklerini hesaplar
 */

/**
 * CAC (Customer Acquisition Cost) - Müşteri Kazanma Maliyeti
 * Formül: Toplam Pazarlama Harcaması / Yeni Müşteri Sayısı
 */
export function calculateCAC(
    marketingSpend: number,
    newCustomers: number
): number {
    if (newCustomers === 0) return 0;
    return marketingSpend / newCustomers;
}

/**
 * ARPU (Average Revenue Per User) - Kullanıcı Başına Ortalama Gelir
 * Formül: Toplam Gelir / Aktif Kullanıcı Sayısı
 */
export function calculateARPU(
    totalRevenue: number,
    activeCustomers: number
): number {
    if (activeCustomers === 0) return 0;
    return totalRevenue / activeCustomers;
}

/**
 * LTV (Lifetime Value) - Yaşam Boyu Değer
 * Formül: (ARPU * Gross Margin) / Churn Rate
 * 
 * Örnek: ARPU = 100 TL, Gross Margin = 75%, Churn = 5%
 * LTV = (100 * 0.75) / 0.05 = 1,500 TL
 */
export function calculateLTV(
    arpu: number,
    grossMargin: number,
    churnRate: number
): number {
    if (churnRate === 0) return arpu * grossMargin * 12; // Varsayılan 12 ay
    return (arpu * grossMargin) / churnRate;
}

/**
 * LTV/CAC Ratio
 * Sağlıklı bir SaaS için >3 olmalı
 */
export function calculateLTVCACRatio(
    ltv: number,
    cac: number
): number {
    if (cac === 0) return 0;
    return ltv / cac;
}

/**
 * Payback Period - CAC Geri Ödeme Süresi (Ay)
 * Formül: CAC / (ARPU * Gross Margin)
 */
export function calculatePaybackPeriod(
    cac: number,
    arpu: number,
    grossMargin: number
): number {
    const monthlyProfit = arpu * grossMargin;
    if (monthlyProfit === 0) return 0;
    return cac / monthlyProfit;
}

/**
 * Comprehensive Unit Economics Calculator
 */
export function calculateUnitEconomics(
    totalMarketingSpend: number,
    newCustomers: number,
    totalRevenue: number,
    activeCustomers: number,
    grossMargin: number,
    churnRate: number
): UnitEconomics {
    const cac = calculateCAC(totalMarketingSpend, newCustomers);
    const arpu = calculateARPU(totalRevenue, activeCustomers);
    const ltv = calculateLTV(arpu, grossMargin, churnRate);
    const ltvCacRatio = calculateLTVCACRatio(ltv, cac);
    const paybackPeriod = calculatePaybackPeriod(cac, arpu, grossMargin);

    return {
        cac,
        arpu,
        ltv,
        ltvCacRatio,
        paybackPeriod,
        grossMargin
    };
}

/**
 * Churn Rate Calculator
 * Formül: Kaybedilen Müşteriler / Başlangıç Müşteri Sayısı
 */
export function calculateChurnRate(
    churnedCustomers: number,
    startingCustomers: number
): number {
    if (startingCustomers === 0) return 0;
    return churnedCustomers / startingCustomers;
}

/**
 * Customer Retention Rate
 * Formül: 1 - Churn Rate
 */
export function calculateRetentionRate(churnRate: number): number {
    return 1 - churnRate;
}

/**
 * Net Revenue Retention (NRR)
 * Expansion revenue dahil retention
 */
export function calculateNRR(
    startingMRR: number,
    churnedMRR: number,
    expansionMRR: number
): number {
    if (startingMRR === 0) return 1;
    return (startingMRR - churnedMRR + expansionMRR) / startingMRR;
}
