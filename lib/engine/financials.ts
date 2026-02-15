
import {
    FinancialInput,
    FinancialModelResult,
    MonthlyFinancialResult,
    FinancialParameters,
    UnitEconomics
} from './types';
import { TR_CONSTANTS_2025 } from './constants';
import { calculateEmployerCost, calculateCorporateTax } from './calculations';
import { calculateUnitEconomics } from './unit-economics';
import { generateAllScenarios, calculateScenarioAnalysis } from './scenarios';

/**
 * ============================================
 * ENHANCED FINANCIAL ENGINE
 * Strategic Financial Modules Integration
 * ============================================
 */


/**
 * Get default financial parameters
 */
function getDefaultParameters(): FinancialParameters {
    return {
        usdRate: 34.50,           // Dolar kuru (TRY)
        eurRate: 37.20,           // Euro kuru (TRY)
        gbpRate: 44.10,           // Sterlin kuru (TRY)
        inflationRate: 0.40,      // %40 yıllık enflasyon
        salaryIncreaseRate: 0.25, // %25 yıllık maaş artışı
        taxRate: 0.25,            // %25 kurumlar vergisi
        kdvRate: 0.20,            // %20 KDV
        stopajRate: 0.20,         // %20 Stopaj
        sgkRate: 0.20             // %20 SGK (Teşvikli varsayım)
    };
}

/**
 * Apply currency conversion based on parameters
 * Normalizes all values to a common base (TRY) or converts to target
 */
function convertToCurrency(
    amount: number,
    from: string,
    to: string,
    parameters: FinancialParameters
): number {
    // 1. Convert any amount to TRY first
    let amountInTry = amount;
    if (from === 'USD') amountInTry = amount * parameters.usdRate;
    else if (from === 'EUR') amountInTry = amount * parameters.eurRate;
    else if (from === 'GBP') amountInTry = amount * parameters.gbpRate;

    // 2. Convert from TRY to Target
    if (to === 'USD') return amountInTry / parameters.usdRate;
    if (to === 'EUR') return amountInTry / parameters.eurRate;
    if (to === 'GBP') return amountInTry / parameters.gbpRate;

    return amountInTry; // to TRY
}

/**
 * Apply inflation to amount based on month
 */
function applyInflation(
    amount: number,
    month: number,
    parameters: FinancialParameters
): number {
    const monthlyInflation = Math.pow(1 + parameters.inflationRate, 1 / 12) - 1;
    return amount * Math.pow(1 + monthlyInflation, month - 1);
}

/**
 * MAIN FINANCIAL MODEL GENERATOR
 */
export function generateFinancialModel(input: FinancialInput): FinancialModelResult {
    const monthlyResults: MonthlyFinancialResult[] = [];
    const redFlags: string[] = [];

    const parameters = input.parameters || getDefaultParameters();
    const targetCurrency = input.pricing.currency;

    let currentCashBalance = convertToCurrency(input.startingCapital || 0, 'TRY', targetCurrency, parameters);
    let currentCustomers = input.growth.initialCustomers;
    const churnRate = input.growth.churnRate || 0.05;

    let cogsRate = input.cogsRate;
    if (cogsRate === undefined) {
        if (input.sector.toLowerCase().includes('saas')) {
            cogsRate = 1 - TR_CONSTANTS_2025.BENCHMARKS.SAAS.GROSS_MARGIN;
        } else if (input.sector.toLowerCase().includes('e-ticaret') || input.sector.toLowerCase().includes('ecommerce')) {
            cogsRate = 1 - TR_CONSTANTS_2025.BENCHMARKS.ECOMMERCE.GROSS_MARGIN;
        } else {
            cogsRate = 0.30;
        }
    }

    const projectionMonths = input.projectionMonths || 12;

    const revenueStreams: import('./types').RevenueItem[] = input.revenueItems && input.revenueItems.length > 0
        ? input.revenueItems
        : [{
            id: 'default',
            name: 'Ana Gelir',
            type: input.revenueModel as any,
            price: input.pricing.amount,
            currency: input.pricing.currency,
            initialCustomers: input.growth.initialCustomers,
            monthlyGrowthRate: input.growth.monthlyGrowthRate,
            churnRate: input.growth.churnRate || 0.05
        }];

    const streamStates = revenueStreams.map(s => ({
        ...s,
        currentCount: s.initialCustomers,
        isOneTime: s.type === 'one_time' || s.type === 'service'
    }));

    let totalMarketingSpend = 0;
    let totalNewCustomers = 0;
    let totalRevenue = 0;
    let totalActiveCustomers = 0;

    for (let month = 1; month <= projectionMonths; month++) {
        let monthNewCustomers = 0;
        let monthChurnedCustomers = 0;
        let monthActiveCustomers = 0;
        let monthRevenue = 0;
        let monthCogs = 0;
        let monthShipping = 0;

        streamStates.forEach(stream => {
            let newCust = 0;
            let churnedCust = 0;
            const price = convertToCurrency(stream.price, stream.currency, targetCurrency, parameters);

            if (month > 1) {
                if (stream.isOneTime) {
                    const previousSales = stream.currentCount;
                    stream.currentCount = previousSales * (1 + stream.monthlyGrowthRate);
                    newCust = stream.currentCount;
                } else {
                    newCust = stream.currentCount * stream.monthlyGrowthRate;
                    churnedCust = stream.currentCount * (stream.churnRate || 0.05);
                    stream.currentCount = stream.currentCount + newCust - churnedCust;
                }
            } else {
                newCust = stream.currentCount;
            }

            const effectiveCount = Math.floor(stream.currentCount);
            const effectiveNew = Math.floor(newCust);
            const effectiveChurn = Math.floor(churnedCust);

            let streamRevenue = 0;
            let streamUnits = 0;

            if (stream.isOneTime) {
                streamRevenue = effectiveNew * price;
                streamUnits = effectiveNew;
                monthActiveCustomers += effectiveNew;
            } else {
                streamRevenue = effectiveCount * price;
                streamUnits = effectiveCount; // Recurring units (e.g. active subs) - though shipping usually only on new?
                // For SaaS, shipping is 0. For subscription box, shipping is on all active.
                // We'll assume shippingCost applies to ALL active units for subscription types if set.
                monthActiveCustomers += effectiveCount;
            }

            monthRevenue += streamRevenue;
            monthNewCustomers += effectiveNew;
            monthChurnedCustomers += effectiveChurn;

            // COST CALCULATIONS (Per Item)
            // 1. COGS (Cost of Goods Sold)
            const itemCogsRate = stream.cogsPercentage !== undefined ? stream.cogsPercentage : cogsRate;
            monthCogs += streamRevenue * itemCogsRate;

            // 2. Returns (Refunds)
            const itemReturnRate = stream.returnRate || 0;
            const refundAmount = streamRevenue * itemReturnRate;
            monthRevenue -= refundAmount; // Reduces Net Revenue
            // (Note: COGS should technically be reduced by returns too, but keeping simple for now or treating as write-off)

            // 3. Shipping (Variable Cost)
            // If one_time, valid for new units. If subscription, valid for all active units (box model)
            const unitsToShip = stream.type === 'subscription' ? effectiveCount : effectiveNew;
            monthShipping += unitsToShip * (stream.shippingCost || 0);
        });

        // Aggregated Costs
        const cogs = monthCogs;
        const variableCosts = monthShipping; // Shipping is variable
        const grossProfit = monthRevenue - cogs - variableCosts;
        const grossMargin = monthRevenue > 0 ? grossProfit / monthRevenue : 0;

        // Personnel
        let personnelExpense = 0;
        input.team.forEach(member => {
            const startMonth = member.startMonth || 1;

            // Future Hire Logic
            if (month < startMonth) {
                return; // Skip cost for this month
            }
            // For salary increases, calculate years relative to START date or Model Start?
            // Usually relative to Model Start (inflation hits everyone).

            let salaryInTarget = convertToCurrency(member.salary, 'TRY', targetCurrency, parameters);

            if (member.isNetSalary) {
                // Brütleştirme: Net / (1 - (SGK + Gelir Vergisi vs)) ~ 1.45 katsayı basitleştirilmiş
                // Localization: Use SGK rate if available
                const burden = parameters.sgkRate ? (1 + parameters.sgkRate) : 1.45;
                salaryInTarget = salaryInTarget * burden;
            }

            if (month > 12) {
                const years = Math.floor((month - 1) / 12);
                salaryInTarget *= Math.pow(1 + parameters.salaryIncreaseRate, years);
            }

            salaryInTarget = applyInflation(salaryInTarget, month, parameters);
            personnelExpense += salaryInTarget * member.count;
        });

        // Marketing
        let marketingExpense = 0;
        if (input.marketing.type === 'percentage') {
            marketingExpense = monthRevenue * input.marketing.value;
        } else {
            marketingExpense = convertToCurrency(input.marketing.value, 'TRY', targetCurrency, parameters);
            marketingExpense = applyInflation(marketingExpense, month, parameters);
        }

        // Fixed & Variable
        let fixedExpenseTotal = 0;
        input.fixedExpenses.filter(e => !e.isVariable).forEach(exp => {
            let amount = convertToCurrency(exp.amount, exp.currency || 'TRY', targetCurrency, parameters);

            // Localization: Stopaj on Rent (Kira)
            if (parameters.stopajRate && (exp.name.toLowerCase().includes('kira') || exp.name.toLowerCase().includes('rent'))) {
                // Kira bedeli net ise, stopaj ekle (Net / (1 - Stopaj) - Net) değil, direkt brüt hesap veya ek maliyet
                // Basit kural: Kira 10.000 TL ise, devlete +2.500 TL ödenir (Brütleşirse). 
                // Burada basitçe maliyeti artırıyoruz.
                amount = amount * (1 + parameters.stopajRate);
            }

            amount = applyInflation(amount, month, parameters);
            fixedExpenseTotal += amount;
        });

        let variableExpenseTotal = 0;
        input.fixedExpenses.filter(e => e.isVariable).forEach(exp => {
            let amount = convertToCurrency(exp.amount, exp.currency || 'TRY', targetCurrency, parameters);
            // Variable scaler logic (assume input amount is percentage if isVariable true?)
            // Actually usually it's % of revenue. Let's stick to % of revenue if isVariable is true.
            amount = (amount / 100) * monthRevenue;
            variableExpenseTotal += amount;
        });

        const totalOperatingExpenses = personnelExpense + marketingExpense + fixedExpenseTotal + variableExpenseTotal;
        const ebitda = grossProfit - totalOperatingExpenses;
        const tax = ebitda > 0 ? ebitda * parameters.taxRate : 0;
        const netIncome = ebitda - tax;

        const beginningCash = currentCashBalance;
        currentCashBalance += netIncome;

        totalMarketingSpend += marketingExpense;
        totalNewCustomers += monthNewCustomers;
        totalRevenue += monthRevenue;
        totalActiveCustomers += monthActiveCustomers;

        monthlyResults.push({
            month,
            revenue: monthRevenue,
            customers: monthActiveCustomers,
            newCustomers: Math.floor(monthNewCustomers),
            churnedCustomers: Math.floor(monthChurnedCustomers),
            cogs,
            grossProfit,
            expenses: {
                personnel: personnelExpense,
                marketing: marketingExpense,
                fixed: fixedExpenseTotal,
                variable: variableExpenseTotal,
                other: 0
            },
            totalExpenses: totalOperatingExpenses + cogs,
            ebitda,
            netIncome,
            cashFlow: {
                inflow: monthRevenue,
                outflow: totalOperatingExpenses + cogs + tax,
                net: netIncome,
                beginningBalance: beginningCash,
                endingBalance: currentCashBalance
            },
            metrics: {
                burnRate: netIncome < 0 ? -netIncome : 0,
                runway: netIncome < 0 ? (beginningCash / -netIncome) : 99,
                grossMargin,
                cac: monthNewCustomers > 0 ? marketingExpense / monthNewCustomers : 0,
                arpu: monthActiveCustomers > 0 ? monthRevenue / monthActiveCustomers : 0,
                ltv: churnRate > 0 ? ((monthRevenue / monthActiveCustomers) * grossMargin) / churnRate : 12 * (monthRevenue / monthActiveCustomers),
                ltvCacRatio: (monthNewCustomers > 0 && marketingExpense > 0) ? (((monthRevenue / monthActiveCustomers) * grossMargin) / churnRate) / (marketingExpense / monthNewCustomers) : 0
            }
        });
    }

    const summaryTotalRevenue = monthlyResults.reduce((sum, m) => sum + m.revenue, 0);
    const summaryTotalProfit = monthlyResults.reduce((sum, m) => sum + m.netIncome, 0);
    const breakevenMonth = monthlyResults.find(m => m.netIncome > 0)?.month || null;
    const minCash = Math.min(...monthlyResults.map(m => m.cashFlow.endingBalance));
    const neededCapital = minCash < 0 ? Math.abs(minCash) : 0;

    let cumulativeProfit = 0;
    let paybackMonth = null;
    for (const m of monthlyResults) {
        cumulativeProfit += m.netIncome;
        if (cumulativeProfit > 0 && !paybackMonth) {
            paybackMonth = m.month;
            break;
        }
    }

    const avgActiveCustomers = totalActiveCustomers / monthlyResults.length;
    const overallUnitEconomics: UnitEconomics | undefined = input.enableUnitEconomics !== false
        ? calculateUnitEconomics(
            totalMarketingSpend,
            totalNewCustomers,
            summaryTotalRevenue,
            avgActiveCustomers,
            monthlyResults[monthlyResults.length - 1]?.metrics.grossMargin || 0,
            churnRate
        )
        : undefined;

    const totalFixedCosts = monthlyResults.reduce((sum, m) => sum + m.expenses.fixed + m.expenses.personnel, 0);
    const totalVariableCosts = monthlyResults.reduce((sum, m) => sum + m.expenses.variable + m.cogs, 0);
    const totalCosts = totalFixedCosts + totalVariableCosts;

    const costStructure = {
        totalFixed: totalFixedCosts,
        totalVariable: totalVariableCosts,
        fixedPercentage: totalCosts > 0 ? (totalFixedCosts / totalCosts) * 100 : 0,
        variablePercentage: totalCosts > 0 ? (totalVariableCosts / totalCosts) * 100 : 0
    };

    // Red Flags
    if (neededCapital > 0 && convertToCurrency(input.startingCapital || 0, 'TRY', targetCurrency, parameters) < neededCapital) {
        redFlags.push("dashboard.red_flags.low_cash");
    }

    if (overallUnitEconomics && overallUnitEconomics.ltvCacRatio < 3) {
        redFlags.push("dashboard.red_flags.low_ltv_cac");
    }

    if (churnRate > 0.07) {
        redFlags.push("dashboard.red_flags.high_churn");
    }

    if (costStructure.fixedPercentage > 70) {
        redFlags.push("dashboard.red_flags.high_fixed_costs");
    }

    const healthScore = calculateStartupHealthScore(
        summaryTotalProfit,
        monthlyResults[monthlyResults.length - 1].metrics.runway,
        input.growth.monthlyGrowthRate,
        overallUnitEconomics?.ltvCacRatio || 0,
        churnRate
    );

    return {
        monthly: monthlyResults,
        summary: {
            totalRevenue: summaryTotalRevenue,
            totalProfit: summaryTotalProfit,
            breakevenMonth,
            neededCapital,
            paybackPeriod: paybackMonth,
            unitEconomics: overallUnitEconomics,
            costStructure
        },
        redFlags,
        healthScore,
        averageProfit: summaryTotalProfit / projectionMonths,
        riskScore: (neededCapital > 0) ? 70 : 10
    };
}

function calculateStartupHealthScore(
    totalProfit: number,
    runway: number,
    growthRate: number,
    ltvCac: number,
    churnRate: number
): import('./types').StartupHealthScore {
    let score = 0;
    const details = { profitability: 0, runway: 0, growth: 0, unitEconomics: 0, churn: 0 };
    const feedback: string[] = [];

    if (totalProfit > 0) { details.profitability = 20; feedback.push("dashboard.health_feedback.profit_success"); }
    else if (totalProfit > -5000) { details.profitability = 10; feedback.push("dashboard.health_feedback.profit_near"); }
    else { details.profitability = 0; feedback.push("dashboard.health_feedback.profit_fail"); }
    score += details.profitability;

    if (runway > 12 || runway > 90) { details.runway = 20; feedback.push("dashboard.health_feedback.runway_success"); }
    else if (runway > 6) { details.runway = 10; feedback.push("dashboard.health_feedback.runway_near"); }
    else { details.runway = 0; feedback.push("dashboard.health_feedback.runway_fail"); }
    score += details.runway;

    if (growthRate >= 0.15) { details.growth = 20; feedback.push("dashboard.health_feedback.growth_success"); }
    else if (growthRate >= 0.05) { details.growth = 10; feedback.push("dashboard.health_feedback.growth_near"); }
    else { details.growth = 5; feedback.push("dashboard.health_feedback.growth_fail"); }
    score += details.growth;

    if (ltvCac >= 3) { details.unitEconomics = 20; feedback.push("dashboard.health_feedback.unit_success"); }
    else if (ltvCac >= 1) { details.unitEconomics = 10; feedback.push("dashboard.health_feedback.unit_near"); }
    else { details.unitEconomics = 0; feedback.push("dashboard.health_feedback.unit_fail"); }
    score += details.unitEconomics;

    if (churnRate <= 0.03) { details.churn = 20; }
    else if (churnRate <= 0.07) { details.churn = 10; }
    else { details.churn = 0; feedback.push("dashboard.health_feedback.churn_fail"); }
    score += details.churn;

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 60) grade = 'B';
    else if (score >= 40) grade = 'C';
    else if (score >= 20) grade = 'D';

    return { score, grade, details, feedback };
}

function formatCurrency(val: number, currency: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
}
