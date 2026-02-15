import { FinancialModel, MonthlyFinancials } from './types';

export interface DecisionAnalysis {
    runwayMonths: number;
    burnRate: {
        average: number;
        current: number;
        trend: 'improving' | 'worsening' | 'stable';
    };
    riskScore: {
        total: number; // 0-100
        growthStability: number;
        capitalEfficiency: number;
        sustainability: number;
    };
    breakevenPoint: number | null; // Month index or null
    ltvCac: number; // Placeholder for now
}

export function analyzeFinancials(model: FinancialModel): DecisionAnalysis {
    const monthly = model.monthly;

    // 1. Calculate Runway
    // Find the first month where cash balance drops below 0 OR goes trend to 0
    let runwayMonths = 12; // Default max (if never runs out in 12 months)
    const firstNegativeMonth = monthly.findIndex(m => m.cashFlow.endingBalance < 0);

    if (firstNegativeMonth !== -1) {
        runwayMonths = firstNegativeMonth;
    } else {
        // Check if cash is decreasing rapidly
        const lastMonth = monthly[11];
        if (lastMonth.cashFlow.endingBalance < monthly[0].cashFlow.startingBalance * 0.2) {
            // Heuristic: If we have less than 20% left, maybe 12+ but risky
            runwayMonths = 12;
        } else {
            runwayMonths = 18; // 18+ implies "Safe"
        }
    }

    // 2. Calculate Burn Rate (Net Cash Flow when Negative)
    const burnMonths = monthly.filter(m => m.cashFlow.netCashFlow < 0);
    let avgBurn = 0;
    let currentBurn = 0;

    if (burnMonths.length > 0) {
        const totalBurn = burnMonths.reduce((sum, m) => sum + Math.abs(m.cashFlow.netCashFlow), 0);
        avgBurn = totalBurn / burnMonths.length;
        currentBurn = Math.abs(burnMonths[burnMonths.length - 1].cashFlow.netCashFlow);
    }

    // 3. Break-even Point
    const breakevenIndex = monthly.findIndex(m => m.netIncome > 0);
    const breakevenPoint = breakevenIndex !== -1 ? breakevenIndex + 1 : null;

    // 4. Risk Score Calculation (0-100, Lower is Better... Wait, User wants 0-100 Score. Let's make 100 = Healthy, 0 = Risky)

    // Sustainability (Runway)
    let sustainabilityScore = 0;
    if (runwayMonths >= 18) sustainabilityScore = 100;
    else if (runwayMonths >= 12) sustainabilityScore = 80;
    else if (runwayMonths >= 6) sustainabilityScore = 50;
    else if (runwayMonths >= 3) sustainabilityScore = 20;
    else sustainabilityScore = 0;

    // Capital Efficiency (Revenue vs Burn)
    // Rule of 40 style: Revenue Growth + Profit Margin? Or just Revenue / Burn?
    // Let's use: If Profit > 0, Score 100. If Burn > Revenue, Score Low.
    let efficiencyScore = 50;
    const totalRev = model.summary.totalRevenue;
    const totalExp = model.summary.totalExpenses;

    if (model.summary.totalProfit > 0) {
        efficiencyScore = 100;
    } else {
        const ratio = totalRev / totalExp; // 0.5 means we spend 2x what we make
        efficiencyScore = Math.min(100, ratio * 100);
    }

    // Growth Stability (Revenue Trend)
    // Check if revenue is consistently growing
    let growingMonths = 0;
    for (let i = 1; i < monthly.length; i++) {
        if (monthly[i].revenue.total > monthly[i - 1].revenue.total) {
            growingMonths++;
        }
    }
    const stabilityScore = (growingMonths / 11) * 100;

    // Weighted Total Score
    const totalScore = Math.round(
        (sustainabilityScore * 0.5) +
        (efficiencyScore * 0.3) +
        (stabilityScore * 0.2)
    );

    return {
        runwayMonths,
        burnRate: {
            average: avgBurn,
            current: currentBurn,
            trend: currentBurn > avgBurn ? 'worsening' : 'improving'
        },
        riskScore: {
            total: totalScore,
            sustainability: sustainabilityScore,
            capitalEfficiency: efficiencyScore,
            growthStability: stabilityScore
        },
        breakevenPoint,
        ltvCac: 0 // To be implemented with marketing data
    };
}
