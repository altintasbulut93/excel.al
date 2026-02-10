
import { FinancialInput, FinancialModelResult, MonthlyFinancialResult } from './types';
import { TR_CONSTANTS_2025 } from './constants';
import { calculateEmployerCost, calculateCorporateTax } from './calculations';

/**
 * Ana Hesaplama Motoru
 * Girdileri alır, 12 aylık finansal tabloyu üretir.
 */
export function generateFinancialModel(input: FinancialInput): FinancialModelResult {
    const monthlyResults: MonthlyFinancialResult[] = [];
    const redFlags: string[] = [];

    let currentCashBalance = input.startingCapital || 0;
    let currentCustomers = input.growth.initialCustomers;

    // Varsayılan COGS (Sektöre göre)
    let cogsRate = input.cogsRate;
    if (cogsRate === undefined) {
        // Sektör bazlı varsayılanlar
        if (input.sector.toLowerCase().includes('saas')) {
            cogsRate = 1 - TR_CONSTANTS_2025.BENCHMARKS.SAAS.GROSS_MARGIN; // %25 COGS
        } else if (input.sector.toLowerCase().includes('e-ticaret') || input.sector.toLowerCase().includes('ecommerce')) {
            cogsRate = 1 - TR_CONSTANTS_2025.BENCHMARKS.ECOMMERCE.GROSS_MARGIN; // %65 COGS
        } else {
            cogsRate = 0.30; // Genel varsayılan
        }
    }

    // 12 Aylık Döngü
    for (let month = 1; month <= 12; month++) {
        // 1. Müşteri Büyümesi (Basit bileşik büyüme)
        if (month > 1) {
            currentCustomers = currentCustomers * (1 + input.growth.monthlyGrowthRate);
        }

        // 2. Gelir Hesaplama
        // Basitleştirilmiş: Tüm müşteriler ödüyor varsayımı (Churn yok şimdilik)
        const monthlyRevenue = Math.floor(currentCustomers) * input.pricing.amount;

        // 3. Giderler

        // a) COGS
        const cogs = monthlyRevenue * cogsRate;
        const grossProfit = monthlyRevenue - cogs;

        // b) Personel Giderleri
        let personnelExpense = 0;
        input.team.forEach(member => {
            // Maaş hesabında Brüt/Net ayırımı yapılmalı. 
            // Şimdilik input'u Net kabul edip Employer Cost hesaplıyoruz.
            // calculateEmployerCost fonksiyonu Gross alıyor, o yüzden netToGross lazım ama basitlik için input'u Gross varsayalım dökümandaki gibi.
            // Veya "Net" girildiyse kabaca brüte çevirelim.
            let grossSalary = member.salary;
            if (member.isNetSalary) {
                // Basit gross-up: Net * 1.45 (Ortalama)
                grossSalary = member.salary * 1.45;
            }

            const cost = calculateEmployerCost(grossSalary);
            personnelExpense += cost * member.count;
        });

        // c) Pazarlama
        let marketingExpense = 0;
        if (input.marketing.type === 'percentage') {
            marketingExpense = monthlyRevenue * input.marketing.value;
        } else {
            marketingExpense = input.marketing.value;
        }

        // d) Sabit Giderler
        let fixedExpenseTotal = 0;
        input.fixedExpenses.forEach(exp => {
            fixedExpenseTotal += exp.amount;
        });

        const totalOperatingExpenses = personnelExpense + marketingExpense + fixedExpenseTotal;

        // 4. Karlılık
        const ebitda = grossProfit - totalOperatingExpenses;

        // Vergi (Eğer kar varsa)
        const tax = Math.max(0, calculateCorporateTax(ebitda)); // Basit Kurumlar Vergisi
        const netIncome = ebitda - tax;

        // 5. Nakit Akışı (Basit: Net Kar = Nakit Akışı varsayımı MVP için makul, tahsilat gecikmesi yok)
        // Ancak başlangıç sermayesi düşüyor mu? Hayır, o kasa bakiyesi.
        const monthlyNetCashFlow = netIncome; // Amortisman vs eklenmeli normalde

        const beginningCash = currentCashBalance;
        currentCashBalance += monthlyNetCashFlow;

        // 6. Sonuç Obj
        monthlyResults.push({
            month,
            revenue: monthlyRevenue,
            cogs,
            grossProfit,
            expenses: {
                personnel: personnelExpense,
                marketing: marketingExpense,
                fixed: fixedExpenseTotal,
                other: 0
            },
            totalExpenses: totalOperatingExpenses + cogs, // Muhasebe toplamı
            ebitda,
            netIncome,
            cashFlow: {
                inflow: monthlyRevenue, // Sadece satış
                outflow: totalOperatingExpenses + cogs + tax,
                net: monthlyNetCashFlow,
                beginningBalance: beginningCash,
                endingBalance: currentCashBalance
            },
            metrics: {
                burnRate: monthlyNetCashFlow < 0 ? -monthlyNetCashFlow : 0,
                runway: monthlyNetCashFlow < 0 ? (beginningCash / -monthlyNetCashFlow) : 99,
                grossMargin: monthlyRevenue > 0 ? (grossProfit / monthlyRevenue) : 0
            }
        });
    }

    // Özet Hesaplama
    const totalRevenue = monthlyResults.reduce((sum, m) => sum + m.revenue, 0);
    const totalProfit = monthlyResults.reduce((sum, m) => sum + m.netIncome, 0);

    // Breakeven: İlk pozitif net kar ayı
    const breakevenMonthObj = monthlyResults.find(m => m.netIncome > 0);
    const breakevenMonth = breakevenMonthObj ? breakevenMonthObj.month : null;

    // Needed Capital: En düşük kümülatif nakit (Eğer negatifse o kadar ek lazım)
    const minCash = Math.min(...monthlyResults.map(m => m.cashFlow.endingBalance));
    const neededCapital = minCash < 0 ? Math.abs(minCash) : 0;

    // Red Flags Kontrolü
    if (neededCapital > 0 && input.startingCapital < neededCapital) {
        redFlags.push(`Nakit yetersiz kalabilir! En düşük bakiye: ${Math.floor(minCash)} TL. Ek sermaye gerekebilir.`);
    }

    const totalMarketing = monthlyResults.reduce((sum, m) => sum + m.expenses.marketing, 0);
    if (totalMarketing < totalRevenue * 0.10 && totalRevenue > 0) {
        redFlags.push("Pazarlama bütçesi çok düşük (%10'un altında). Büyüme hedefleri riskli olabilir.");
    }

    return {
        monthly: monthlyResults,
        summary: {
            totalRevenue,
            totalProfit,
            breakevenMonth,
            neededCapital
        },
        redFlags
    };
}
