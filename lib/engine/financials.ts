
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
        inflationRate: 0.40,      // %40 yıllık enflasyon
        salaryIncreaseRate: 0.25, // %25 yıllık maaş artışı
        taxRate: 0.25             // %25 kurumlar vergisi
    };
}

/**
 * Apply currency conversion based on parameters
 */
function convertCurrency(
    amount: number,
    currency: 'TRY' | 'USD' | 'EUR',
    parameters: FinancialParameters
): number {
    if (currency === 'USD') return amount * parameters.usdRate;
    if (currency === 'EUR') return amount * parameters.eurRate;
    return amount; // TRY
}

/**
 * Apply inflation to amount based on month
 */
function applyInflation(
    amount: number,
    month: number,
    parameters: FinancialParameters
): number {
    // Aylık enflasyon = (1 + yıllık)^(1/12) - 1
    const monthlyInflation = Math.pow(1 + parameters.inflationRate, 1 / 12) - 1;
    return amount * Math.pow(1 + monthlyInflation, month - 1);
}

/**
 * Separate fixed and variable expenses
 */
function categorizeExpenses(input: FinancialInput) {
    const fixed = input.fixedExpenses.filter(e => !e.isVariable);
    const variable = input.fixedExpenses.filter(e => e.isVariable);
    return { fixed, variable };
}

/**
 * MAIN FINANCIAL MODEL GENERATOR
 * Enhanced with: Churn, Parameters, Unit Economics, Cost Structure
 */
export function generateFinancialModel(input: FinancialInput): FinancialModelResult {
    const monthlyResults: MonthlyFinancialResult[] = [];
    const redFlags: string[] = [];

    // Parameters
    const parameters = input.parameters || getDefaultParameters();

    // Initial state
    let currentCashBalance = input.startingCapital || 0;
    let currentCustomers = input.growth.initialCustomers;
    const churnRate = input.growth.churnRate || 0.05; // Default 5% monthly churn

    // COGS Rate (Sector-based)
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

    // Projection period
    const projectionMonths = input.projectionMonths || 12;

    // Categorize expenses
    const { fixed: fixedExpenses, variable: variableExpenses } = categorizeExpenses(input);

    // Tracking for unit economics
    let totalMarketingSpend = 0;
    let totalNewCustomers = 0;
    let totalRevenue = 0;
    let totalActiveCustomers = 0;

    // ============================================
    // MONTHLY LOOP
    // ============================================
    for (let month = 1; month <= projectionMonths; month++) {
        // ----------------------------------------
        // 1. CUSTOMER DYNAMICS (with Churn)
        // ----------------------------------------
        let newCustomers = 0;
        let churnedCustomers = 0;

        if (month > 1) {
            // New customers from growth
            newCustomers = currentCustomers * input.growth.monthlyGrowthRate;

            // Churned customers
            churnedCustomers = currentCustomers * churnRate;

            // Net change
            currentCustomers = currentCustomers + newCustomers - churnedCustomers;
        } else {
            // First month: all customers are "new"
            newCustomers = currentCustomers;
        }

        const activeCustomers = Math.floor(currentCustomers);

        // ----------------------------------------
        // 2. REVENUE CALCULATION
        // ----------------------------------------
        const priceInTRY = convertCurrency(
            input.pricing.amount,
            input.pricing.currency,
            parameters
        );

        const monthlyRevenue = activeCustomers * priceInTRY;

        // ----------------------------------------
        // 3. COST OF GOODS SOLD (COGS)
        // ----------------------------------------
        const cogs = monthlyRevenue * cogsRate;
        const grossProfit = monthlyRevenue - cogs;
        const grossMargin = monthlyRevenue > 0 ? grossProfit / monthlyRevenue : 0;

        // ----------------------------------------
        // 4. OPERATING EXPENSES
        // ----------------------------------------

        // a) Personnel (with inflation and salary increase)
        let personnelExpense = 0;
        input.team.forEach(member => {
            let grossSalary = member.salary;

            // Convert to gross if net
            if (member.isNetSalary) {
                grossSalary = member.salary * 1.45;
            }

            // Apply salary increase (yearly, so every 12 months)
            if (month > 12) {
                const years = Math.floor((month - 1) / 12);
                grossSalary *= Math.pow(1 + parameters.salaryIncreaseRate, years);
            }

            // Apply inflation
            grossSalary = applyInflation(grossSalary, month, parameters);

            const cost = calculateEmployerCost(grossSalary);
            personnelExpense += cost * member.count;
        });

        // b) Marketing
        let marketingExpense = 0;
        if (input.marketing.type === 'percentage') {
            marketingExpense = monthlyRevenue * input.marketing.value;
        } else {
            marketingExpense = convertCurrency(
                input.marketing.value,
                'TRY',
                parameters
            );
            marketingExpense = applyInflation(marketingExpense, month, parameters);
        }

        // c) Fixed Expenses (Sabit Giderler)
        let fixedExpenseTotal = 0;
        fixedExpenses.forEach(exp => {
            let amount = convertCurrency(exp.amount, exp.currency, parameters);
            amount = applyInflation(amount, month, parameters);
            fixedExpenseTotal += amount;
        });

        // d) Variable Expenses (Değişken Giderler)
        let variableExpenseTotal = 0;
        variableExpenses.forEach(exp => {
            let amount = convertCurrency(exp.amount, exp.currency, parameters);
            // Variable expenses scale with revenue
            amount = (amount / 100) * monthlyRevenue; // Assume percentage
            variableExpenseTotal += amount;
        });

        const totalOperatingExpenses = personnelExpense + marketingExpense + fixedExpenseTotal + variableExpenseTotal;

        // ----------------------------------------
        // 5. PROFITABILITY
        // ----------------------------------------
        const ebitda = grossProfit - totalOperatingExpenses;

        // Tax (using parameter tax rate)
        const tax = ebitda > 0 ? ebitda * parameters.taxRate : 0;
        const netIncome = ebitda - tax;

        // ----------------------------------------
        // 6. CASH FLOW
        // ----------------------------------------
        const monthlyNetCashFlow = netIncome;
        const beginningCash = currentCashBalance;
        currentCashBalance += monthlyNetCashFlow;

        // ----------------------------------------
        // 7. UNIT ECONOMICS (per month)
        // ----------------------------------------
        const monthlyCac = newCustomers > 0 ? marketingExpense / newCustomers : 0;
        const monthlyArpu = activeCustomers > 0 ? monthlyRevenue / activeCustomers : 0;
        const monthlyLtv = churnRate > 0 ? (monthlyArpu * grossMargin) / churnRate : monthlyArpu * 12;
        const monthlyLtvCacRatio = monthlyCac > 0 ? monthlyLtv / monthlyCac : 0;

        // Tracking for overall unit economics
        totalMarketingSpend += marketingExpense;
        totalNewCustomers += newCustomers;
        totalRevenue += monthlyRevenue;
        totalActiveCustomers += activeCustomers;

        // ----------------------------------------
        // 8. STORE MONTHLY RESULT
        // ----------------------------------------
        monthlyResults.push({
            month,

            // Revenue
            revenue: monthlyRevenue,
            customers: activeCustomers,
            newCustomers: Math.floor(newCustomers),
            churnedCustomers: Math.floor(churnedCustomers),

            // Costs
            cogs,
            grossProfit,

            // Expenses (with breakdown)
            expenses: {
                personnel: personnelExpense,
                marketing: marketingExpense,
                fixed: fixedExpenseTotal,
                variable: variableExpenseTotal,
                other: 0
            },
            totalExpenses: totalOperatingExpenses + cogs,

            // Profitability
            ebitda,
            netIncome,

            // Cash Flow
            cashFlow: {
                inflow: monthlyRevenue,
                outflow: totalOperatingExpenses + cogs + tax,
                net: monthlyNetCashFlow,
                beginningBalance: beginningCash,
                endingBalance: currentCashBalance
            },

            // Metrics
            metrics: {
                burnRate: monthlyNetCashFlow < 0 ? -monthlyNetCashFlow : 0,
                runway: monthlyNetCashFlow < 0 ? (beginningCash / -monthlyNetCashFlow) : 99,
                grossMargin,

                // Unit Economics
                cac: monthlyCac,
                arpu: monthlyArpu,
                ltv: monthlyLtv,
                ltvCacRatio: monthlyLtvCacRatio
            }
        });
    }

    // ============================================
    // SUMMARY CALCULATIONS
    // ============================================
    const summaryTotalRevenue = monthlyResults.reduce((sum, m) => sum + m.revenue, 0);
    const summaryTotalProfit = monthlyResults.reduce((sum, m) => sum + m.netIncome, 0);

    // Breakeven
    const breakevenMonthObj = monthlyResults.find(m => m.netIncome > 0);
    const breakevenMonth = breakevenMonthObj ? breakevenMonthObj.month : null;

    // Needed Capital
    const minCash = Math.min(...monthlyResults.map(m => m.cashFlow.endingBalance));
    const neededCapital = minCash < 0 ? Math.abs(minCash) : 0;

    // Payback Period (when cumulative profit > 0)
    let cumulativeProfit = 0;
    let paybackMonth = null;
    for (const m of monthlyResults) {
        cumulativeProfit += m.netIncome;
        if (cumulativeProfit > 0 && !paybackMonth) {
            paybackMonth = m.month;
            break;
        }
    }

    // ============================================
    // UNIT ECONOMICS (Overall)
    // ============================================
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

    // ============================================
    // COST STRUCTURE
    // ============================================
    const totalFixedCosts = monthlyResults.reduce((sum, m) => sum + m.expenses.fixed + m.expenses.personnel, 0);
    const totalVariableCosts = monthlyResults.reduce((sum, m) => sum + m.expenses.variable + m.cogs, 0);
    const totalCosts = totalFixedCosts + totalVariableCosts;

    const costStructure = {
        totalFixed: totalFixedCosts,
        totalVariable: totalVariableCosts,
        fixedPercentage: totalCosts > 0 ? (totalFixedCosts / totalCosts) * 100 : 0,
        variablePercentage: totalCosts > 0 ? (totalVariableCosts / totalCosts) * 100 : 0
    };

    // ============================================
    // RED FLAGS
    // ============================================
    if (neededCapital > 0 && input.startingCapital < neededCapital) {
        redFlags.push(`⚠️ Nakit yetersiz! En düşük bakiye: ${Math.floor(minCash)} TL. Ek sermaye: ${Math.floor(neededCapital)} TL gerekli.`);
    }

    if (overallUnitEconomics && overallUnitEconomics.ltvCacRatio < 3) {
        redFlags.push(`⚠️ LTV/CAC oranı düşük (${overallUnitEconomics.ltvCacRatio.toFixed(1)}). Sağlıklı bir SaaS için >3 olmalı.`);
    }

    if (churnRate > 0.07) {
        redFlags.push(`⚠️ Churn rate yüksek (%${(churnRate * 100).toFixed(1)}). Müşteri tutma stratejileri geliştirin.`);
    }

    if (costStructure.fixedPercentage > 70) {
        redFlags.push(`⚠️ Sabit giderler çok yüksek (%${costStructure.fixedPercentage.toFixed(0)}). Ölçeklenebilirlik riski.`);
    }

    // ============================================
    // SCENARIOS (if enabled)
    // ============================================
    let scenarios = undefined;
    let scenarioAnalysis = undefined;

    if (input.scenarios && input.scenarios.length > 0) {
        scenarios = generateAllScenarios(input, input.scenarios);
        scenarioAnalysis = calculateScenarioAnalysis(scenarios);
    }

    // ============================================
    // RETURN RESULT
    // ============================================
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
        scenarios,
        scenarioAnalysis
    };
}
