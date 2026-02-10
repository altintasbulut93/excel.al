
import { FinancialInput } from "./types";

interface ReverseGoalResult {
    targetRevenue: number;
    requiredCustomers: number;
    marketingBudget: number;
    grossProfit: number;
    netProfit: number;
    isFeasible: boolean;
    notes: string[];
}

/**
 * Calculates required revenue and customers to reach a monthly NET profit target.
 */
export function calculateReverseGoal(data: FinancialInput, targetNetProfit: number): ReverseGoalResult {
    // 1. Calculate Fixed Costs (Monthly)
    const fixedCosts = data.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);

    // 2. Calculate Personnel Costs (Approximate with Tax/SGK factor ~1.5 for simplicity or use detailed)
    // Let's use a rough multiplier 1.5x of Net Salary for Total Employer Cost if not computed
    // But data.team has salary. Assuming salary in input is Net for simplicity of reverse calc, 
    // or use the engine logic constraints. Let's assume input salary is Gross for easier calc 
    // or use a standard multiplier.
    const personnelCosts = data.team.reduce((sum, t) => sum + (t.salary * t.count * 1.5), 0);

    const totalFixedBurn = fixedCosts + personnelCosts;

    // 3. Determine Variable Ratios (as % of Revenue)
    // COGS (Cost of Goods Sold)
    let cogsRatio = 0.0;
    if (data.sector === 'SaaS') cogsRatio = 0.20; // Hosting + Support
    else if (data.sector === 'E-commerce') cogsRatio = 0.60;
    else if (data.sector === 'Consulting') cogsRatio = 0.10;
    else cogsRatio = 0.30;

    // Marketing
    let marketingRatio = 0;
    if (data.marketing.type === 'percentage') {
        marketingRatio = data.marketing.value;
    } else {
        // If fixed marketing, add to fixed burn
        // But usually reverse engineering assumes marketing scales. 
        // Let's assume input fixed marketing is part of fixed costs, 
        // but to scale we might need % logic. Let's stick to input.
        // If fixed, it's already in 'fixedCosts' ? No, marketing is separate in our types.
        // Let's add fixed marketing to burn.
        // Wait, data.marketing.value is number.
    }

    let effectiveFixedBurn = totalFixedBurn;
    if (data.marketing.type === 'fixed') {
        effectiveFixedBurn += data.marketing.value;
    }

    // Tax Rate (Simplified Corporate Tax ~25%)
    const taxRate = 0.25;

    // Formula:
    // NetProfit = (Revenue - COGS - Marketing - FixedBurn) * (1 - Tax)
    // NetProfit / (1 - Tax) = Revenue - Revenue*CogsRatio - Revenue*MarketingRatio - FixedBurn
    // (NetProfit / 0.75) + FixedBurn = Revenue * (1 - CogsRatio - MarketingRatio)

    const targetPreTax = targetNetProfit / (1 - taxRate);
    const requiredContribution = targetPreTax + effectiveFixedBurn;

    // Contribution Margin Ratio
    let contributionMargin = 1 - cogsRatio;
    if (data.marketing.type === 'percentage') {
        contributionMargin -= data.marketing.value;
    }

    // Safety break
    if (contributionMargin <= 0.05) {
        return {
            targetRevenue: 0,
            requiredCustomers: 0,
            marketingBudget: 0,
            grossProfit: 0,
            netProfit: 0,
            isFeasible: false,
            notes: ["Marjlarınız çok düşük (%5'in altında). Bu kârlılığa ulaşmak matematiksel olarak imkansız görünüyor."]
        };
    }

    const targetRevenue = requiredContribution / contributionMargin;

    // Customers
    const price = data.pricing.amount || 1; // avoid div by zero
    const requiredCustomers = Math.ceil(targetRevenue / price);

    // Marketing Budget Calculation
    let marketingBudget = 0;
    if (data.marketing.type === 'percentage') {
        marketingBudget = targetRevenue * data.marketing.value;
    } else {
        marketingBudget = data.marketing.value;
    }

    const grossProfit = targetRevenue * (1 - cogsRatio);

    return {
        targetRevenue,
        requiredCustomers,
        marketingBudget,
        grossProfit,
        netProfit: targetNetProfit,
        isFeasible: true,
        notes: []
    };
}
