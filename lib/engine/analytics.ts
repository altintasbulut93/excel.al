import { FinancialModelResult, ScenarioResult } from "./types";

/**
 * ANALYTICS INTELLIGENCE LAYER
 * Advanced metrics for financial health assessment
 */

/**
 * Calculate Growth Efficiency Score (0-100)
 * Measures how efficiently the company is growing relative to spending
 * 
 * Formula:
 * - Revenue Growth Rate / Burn Rate Ratio
 * - Adjusted for profitability
 * 
 * Score Interpretation:
 * - 80-100: Excellent (High growth, low burn)
 * - 60-79: Good (Balanced growth)
 * - 40-59: Fair (Moderate efficiency)
 * - 20-39: Poor (High burn, low growth)
 * - 0-19: Critical (Unsustainable)
 */
export function calculateGrowthEfficiencyScore(result: FinancialModelResult): number {
    const { monthly, summary } = result;

    if (monthly.length < 2) return 0;

    // Calculate revenue growth rate (first to last month)
    const firstRevenue = monthly[0].revenue || 1;
    const lastRevenue = monthly[monthly.length - 1].revenue || 1;
    const revenueGrowthRate = ((lastRevenue - firstRevenue) / firstRevenue) * 100;

    // Calculate average burn rate
    const totalBurn = monthly.reduce((sum, m) => {
        const burn = m.totalExpenses - m.revenue;
        return sum + (burn > 0 ? burn : 0);
    }, 0);
    const avgBurn = totalBurn / monthly.length;

    // Calculate efficiency ratio
    let efficiencyScore = 0;

    if (avgBurn === 0) {
        // No burn = profitable from start
        efficiencyScore = 100;
    } else {
        // Growth per unit of burn
        const growthPerBurn = revenueGrowthRate / (avgBurn / 1000);

        // Normalize to 0-100 scale
        efficiencyScore = Math.min(100, Math.max(0, growthPerBurn * 10));
    }

    // Bonus for profitability
    if (summary.totalProfit > 0) {
        efficiencyScore = Math.min(100, efficiencyScore * 1.2);
    }

    // Penalty for no breakeven
    if (!summary.breakevenMonth) {
        efficiencyScore *= 0.7;
    }

    return Math.round(efficiencyScore);
}

/**
 * Calculate Financial Stability Score (0-100)
 * Measures overall financial health and sustainability
 * 
 * Factors:
 * - Cash runway
 * - Profit margin
 * - Revenue growth
 * - Expense control
 * - Unit economics health
 * 
 * Score Interpretation:
 * - 80-100: Very Stable (Low risk)
 * - 60-79: Stable (Moderate risk)
 * - 40-59: Unstable (High risk)
 * - 20-39: Critical (Very high risk)
 * - 0-19: Failing (Immediate action needed)
 */
export function calculateFinancialStabilityScore(result: FinancialModelResult): number {
    const { summary, monthly } = result;
    let score = 0;

    // 1. Cash Runway Score (25 points)
    const runwayMonths = summary.runwayMonths || 0;
    let runwayScore = 0;
    if (runwayMonths >= 18) runwayScore = 25;
    else if (runwayMonths >= 12) runwayScore = 20;
    else if (runwayMonths >= 6) runwayScore = 15;
    else if (runwayMonths >= 3) runwayScore = 10;
    else runwayScore = 5;
    score += runwayScore;

    // 2. Profitability Score (25 points)
    const profitMargin = summary.totalRevenue > 0
        ? (summary.totalProfit / summary.totalRevenue) * 100
        : -100;
    let profitScore = 0;
    if (profitMargin >= 20) profitScore = 25;
    else if (profitMargin >= 10) profitScore = 20;
    else if (profitMargin >= 0) profitScore = 15;
    else if (profitMargin >= -20) profitScore = 10;
    else profitScore = 5;
    score += profitScore;

    // 3. Revenue Growth Score (20 points)
    if (monthly.length >= 2) {
        const firstRevenue = monthly[0].revenue || 1;
        const lastRevenue = monthly[monthly.length - 1].revenue || 1;
        const growthRate = ((lastRevenue - firstRevenue) / firstRevenue) * 100;

        let growthScore = 0;
        if (growthRate >= 100) growthScore = 20;
        else if (growthRate >= 50) growthScore = 15;
        else if (growthRate >= 20) growthScore = 10;
        else if (growthRate >= 0) growthScore = 5;
        else growthScore = 0;
        score += growthScore;
    }

    // 4. Unit Economics Score (20 points)
    const unitEcon = summary.unitEconomics;
    let unitEconScore = 0;
    if (unitEcon) {
        // LTV/CAC ratio
        if (unitEcon.ltvCacRatio >= 5) unitEconScore += 10;
        else if (unitEcon.ltvCacRatio >= 3) unitEconScore += 7;
        else if (unitEcon.ltvCacRatio >= 2) unitEconScore += 4;
        else unitEconScore += 2;

        // Payback period
        if (unitEcon.paybackPeriod <= 6) unitEconScore += 10;
        else if (unitEcon.paybackPeriod <= 12) unitEconScore += 7;
        else if (unitEcon.paybackPeriod <= 18) unitEconScore += 4;
        else unitEconScore += 2;
    }
    score += unitEconScore;

    // 5. Expense Control Score (10 points)
    const costStructure = summary.costStructure;
    let expenseScore = 0;
    if (costStructure) {
        // Lower fixed costs = more scalable
        if (costStructure.fixedPercentage <= 50) expenseScore = 10;
        else if (costStructure.fixedPercentage <= 70) expenseScore = 7;
        else if (costStructure.fixedPercentage <= 85) expenseScore = 4;
        else expenseScore = 2;
    }
    score += expenseScore;

    return Math.round(score);
}

/**
 * Calculate Scenario Confidence Percentage
 * Measures how realistic/achievable the scenarios are
 * 
 * Based on:
 * - Variance between scenarios
 * - Historical performance (if available)
 * - Market assumptions
 * 
 * Confidence Interpretation:
 * - 80-100%: High confidence (Well-researched)
 * - 60-79%: Moderate confidence (Reasonable assumptions)
 * - 40-59%: Low confidence (Speculative)
 * - 0-39%: Very low confidence (Highly uncertain)
 */
export function calculateScenarioConfidence(scenarios: ScenarioResult[]): number {
    if (!scenarios || scenarios.length < 3) return 0;

    const best = scenarios.find(s => s.scenario === 'best');
    const base = scenarios.find(s => s.scenario === 'base');
    const worst = scenarios.find(s => s.scenario === 'worst');

    if (!best || !base || !worst) return 0;

    // Calculate variance between scenarios
    const bestRevenue = best.summary.totalRevenue;
    const baseRevenue = base.summary.totalRevenue;
    const worstRevenue = worst.summary.totalRevenue;

    // Coefficient of variation
    const mean = (bestRevenue + baseRevenue + worstRevenue) / 3;
    const variance = (
        Math.pow(bestRevenue - mean, 2) +
        Math.pow(baseRevenue - mean, 2) +
        Math.pow(worstRevenue - mean, 2)
    ) / 3;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? (stdDev / mean) * 100 : 100;

    // Lower variance = higher confidence
    let confidence = 100;
    if (coefficientOfVariation > 50) confidence = 40;
    else if (coefficientOfVariation > 30) confidence = 60;
    else if (coefficientOfVariation > 15) confidence = 80;
    else confidence = 95;

    // Adjust for realistic assumptions
    // If best case is >3x worst case, reduce confidence
    const bestWorstRatio = worstRevenue > 0 ? bestRevenue / worstRevenue : 10;
    if (bestWorstRatio > 5) confidence *= 0.7;
    else if (bestWorstRatio > 3) confidence *= 0.85;

    // Adjust for breakeven consistency
    const breakevenCount = [best, base, worst].filter(s => s.summary.breakevenMonth).length;
    if (breakevenCount === 3 || breakevenCount === 0) {
        confidence *= 1.1; // Consistent scenarios
    } else if (breakevenCount === 1) {
        confidence *= 0.9; // Inconsistent scenarios
    }

    return Math.round(Math.min(100, confidence));
}

/**
 * Calculate Overall Risk Index (0-100)
 * Combines multiple risk factors
 * 
 * Lower score = Lower risk
 * Higher score = Higher risk
 */
export function calculateRiskIndex(result: FinancialModelResult): number {
    const stabilityScore = calculateFinancialStabilityScore(result);
    const growthScore = calculateGrowthEfficiencyScore(result);

    // Invert stability and growth scores to get risk
    const riskFromStability = 100 - stabilityScore;
    const riskFromGrowth = 100 - growthScore;

    // Additional risk factors
    let additionalRisk = 0;

    // No breakeven = +20 risk
    if (!result.summary.breakevenMonth) additionalRisk += 20;

    // High burn rate = +15 risk
    if (result.summary.burnRate && result.summary.burnRate > 100000) additionalRisk += 15;

    // Low runway = +15 risk
    if (result.summary.runwayMonths && result.summary.runwayMonths < 6) additionalRisk += 15;

    // Poor unit economics = +10 risk
    const unitEcon = result.summary.unitEconomics;
    if (unitEcon && unitEcon.ltvCacRatio < 2) additionalRisk += 10;

    // Calculate weighted risk index
    const riskIndex = (
        riskFromStability * 0.4 +
        riskFromGrowth * 0.3 +
        additionalRisk * 0.3
    );

    return Math.round(Math.min(100, Math.max(0, riskIndex)));
}

/**
 * Get risk level label and color
 */
export function getRiskLevel(riskIndex: number): {
    label: string;
    color: 'green' | 'yellow' | 'orange' | 'red';
    description: string;
} {
    if (riskIndex < 25) {
        return {
            label: 'Düşük Risk',
            color: 'green',
            description: 'Finansal durum sağlıklı ve sürdürülebilir'
        };
    } else if (riskIndex < 50) {
        return {
            label: 'Orta Risk',
            color: 'yellow',
            description: 'Dikkatli yönetim gerekiyor'
        };
    } else if (riskIndex < 75) {
        return {
            label: 'Yüksek Risk',
            color: 'orange',
            description: 'Acil aksiyonlar gerekli'
        };
    } else {
        return {
            label: 'Kritik Risk',
            color: 'red',
            description: 'İşletme sürekliliği tehlikede'
        };
    }
}

/**
 * Calculate all analytics metrics
 */
export function calculateAnalytics(result: FinancialModelResult) {
    return {
        growthEfficiencyScore: calculateGrowthEfficiencyScore(result),
        financialStabilityScore: calculateFinancialStabilityScore(result),
        riskIndex: calculateRiskIndex(result),
        scenarioConfidence: result.scenarios
            ? calculateScenarioConfidence(result.scenarios)
            : 0
    };
}
