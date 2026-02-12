import { ScenarioInput, ScenarioType, FinancialInput, ScenarioResult } from './types';
import { generateFinancialModel } from './financials';

/**
 * SCENARIO MANAGEMENT MODULE
 * Çoklu senaryo yönetimi ve analizi
 */

/**
 * Default Scenarios
 */
export const DEFAULT_SCENARIOS: ScenarioInput[] = [
    {
        type: 'best',
        name: 'İyi Senaryo',
        growthRate: 0.20,      // %20 aylık büyüme
        churnRate: 0.03,       // %3 churn
        conversionRate: 0.15   // %15 conversion
    },
    {
        type: 'base',
        name: 'Orta Senaryo (Hedef)',
        growthRate: 0.10,      // %10 aylık büyüme
        churnRate: 0.05,       // %5 churn
        conversionRate: 0.10   // %10 conversion
    },
    {
        type: 'worst',
        name: 'Kötü Senaryo',
        growthRate: 0.05,      // %5 aylık büyüme
        churnRate: 0.08,       // %8 churn
        conversionRate: 0.05   // %5 conversion
    }
];

/**
 * Generate financial model for a specific scenario
 */
export function generateScenarioModel(
    baseInput: FinancialInput,
    scenario: ScenarioInput
): ScenarioResult {
    // Clone input and apply scenario parameters
    const scenarioInput: FinancialInput = {
        ...baseInput,
        growth: {
            ...baseInput.growth,
            monthlyGrowthRate: scenario.growthRate,
            churnRate: scenario.churnRate
        }
    };

    // Generate model
    const result = generateFinancialModel(scenarioInput);

    return {
        scenario: scenario.type,
        name: scenario.name,
        monthly: result.monthly,
        summary: result.summary
    };
}

/**
 * Generate all scenarios
 */
export function generateAllScenarios(
    baseInput: FinancialInput,
    scenarios: ScenarioInput[] = DEFAULT_SCENARIOS
): ScenarioResult[] {
    return scenarios.map(scenario => generateScenarioModel(baseInput, scenario));
}

/**
 * Calculate scenario analysis summary
 */
export function calculateScenarioAnalysis(scenarios: ScenarioResult[]) {
    if (scenarios.length === 0) {
        return {
            averageRevenue: 0,
            averageProfit: 0,
            riskScore: 50
        };
    }

    // Calculate averages
    const totalRevenue = scenarios.reduce((sum, s) => sum + s.summary.totalRevenue, 0);
    const totalProfit = scenarios.reduce((sum, s) => sum + s.summary.totalProfit, 0);
    const averageRevenue = totalRevenue / scenarios.length;
    const averageProfit = totalProfit / scenarios.length;

    // Calculate risk score (0-100)
    // Risk = (Best - Worst) / Best * 100
    const bestScenario = scenarios.find(s => s.scenario === 'best');
    const worstScenario = scenarios.find(s => s.scenario === 'worst');

    let riskScore = 50; // Default medium risk
    if (bestScenario && worstScenario) {
        const revenueSpread = bestScenario.summary.totalRevenue - worstScenario.summary.totalRevenue;
        const riskPercentage = (revenueSpread / bestScenario.summary.totalRevenue) * 100;
        riskScore = Math.min(100, Math.max(0, riskPercentage));
    }

    return {
        averageRevenue,
        averageProfit,
        riskScore
    };
}

/**
 * Get scenario by type
 */
export function getScenarioByType(
    scenarios: ScenarioResult[],
    type: ScenarioType
): ScenarioResult | undefined {
    return scenarios.find(s => s.scenario === type);
}

/**
 * Compare scenarios
 */
export function compareScenarios(scenarios: ScenarioResult[]) {
    return {
        revenue: {
            best: scenarios.find(s => s.scenario === 'best')?.summary.totalRevenue || 0,
            base: scenarios.find(s => s.scenario === 'base')?.summary.totalRevenue || 0,
            worst: scenarios.find(s => s.scenario === 'worst')?.summary.totalRevenue || 0
        },
        profit: {
            best: scenarios.find(s => s.scenario === 'best')?.summary.totalProfit || 0,
            base: scenarios.find(s => s.scenario === 'base')?.summary.totalProfit || 0,
            worst: scenarios.find(s => s.scenario === 'worst')?.summary.totalProfit || 0
        },
        breakeven: {
            best: scenarios.find(s => s.scenario === 'best')?.summary.breakevenMonth || null,
            base: scenarios.find(s => s.scenario === 'base')?.summary.breakevenMonth || null,
            worst: scenarios.find(s => s.scenario === 'worst')?.summary.breakevenMonth || null
        }
    };
}
