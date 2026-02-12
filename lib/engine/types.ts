
// ============================================
// STRATEGIC FINANCIAL MODULES - TYPE SYSTEM
// ============================================

export interface Pricing {
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR';
    period: 'monthly' | 'annual' | 'one_time';
}

export interface Growth {
    initialCustomers: number;
    monthlyGrowthRate: number; // 0.10 for 10%
    churnRate?: number; // 0.05 for 5% monthly churn
}

export interface TeamMember {
    id: string;
    role: string;
    count: number;
    salary: number;
    isNetSalary: boolean;
}

export interface FixedExpense {
    id: string;
    name: string;
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR';
    isVariable?: boolean; // true = değişken gider, false = sabit gider
}

export interface Marketing {
    type: 'percentage' | 'fixed';
    value: number; // 0.20 or 5000
}

// ============================================
// 1. FINANCIAL PARAMETERS (Dinamik Parametreler)
// ============================================
export interface FinancialParameters {
    usdRate: number;          // Dolar kuru (TRY)
    eurRate: number;          // Euro kuru (TRY)
    inflationRate: number;    // Yıllık enflasyon (0.40 = %40)
    salaryIncreaseRate: number; // Yıllık maaş artış oranı (0.25 = %25)
    taxRate: number;          // Kurumlar vergisi (0.25 = %25)
}

// ============================================
// 2. SCENARIO MANAGEMENT (Çoklu Senaryo)
// ============================================
export type ScenarioType = 'best' | 'base' | 'worst';

export interface ScenarioInput {
    type: ScenarioType;
    name: string; // "İyi Senaryo", "Orta Senaryo", "Kötü Senaryo"
    growthRate: number;
    churnRate: number;
    conversionRate: number; // Lead'den müşteriye dönüşüm oranı
}

// ============================================
// 3. UNIT ECONOMICS (Birim Ekonomisi)
// ============================================
export interface UnitEconomics {
    cac: number;              // Customer Acquisition Cost
    arpu: number;             // Average Revenue Per User
    ltv: number;              // Lifetime Value
    ltvCacRatio: number;      // LTV/CAC oranı (>3 olmalı)
    paybackPeriod: number;    // CAC geri ödeme süresi (ay)
    grossMargin: number;      // Brüt kar marjı
}

// ============================================
// ENHANCED FINANCIAL INPUT
// ============================================
export interface FinancialInput {
    businessName: string;
    sector: string;
    revenueModel: string;
    pricing: Pricing;
    growth: Growth;
    team: TeamMember[];
    fixedExpenses: FixedExpense[];
    marketing: Marketing;
    startingCapital: number;
    cogsRate?: number;
    projectionMonths?: number; // 12 or 36

    // NEW: Strategic Modules
    parameters?: FinancialParameters;
    scenarios?: ScenarioInput[];
    enableUnitEconomics?: boolean;
}

// ============================================
// ENHANCED MONTHLY RESULT
// ============================================
export interface MonthlyFinancialResult {
    month: number;

    // Revenue
    revenue: number;
    customers: number;        // NEW: Müşteri sayısı
    newCustomers: number;     // NEW: Yeni müşteriler
    churnedCustomers: number; // NEW: Kaybedilen müşteriler

    // Costs
    cogs: number;
    grossProfit: number;

    // Expenses (Gider Kırılımı)
    expenses: {
        personnel: number;
        marketing: number;
        fixed: number;         // Sabit giderler
        variable: number;      // NEW: Değişken giderler
        other: number;
    };
    totalExpenses: number;

    // Profitability
    ebitda: number;
    netIncome: number;

    // Cash Flow
    cashFlow: {
        inflow: number;
        outflow: number;
        net: number;
        beginningBalance: number;
        endingBalance: number;
    };

    // Metrics
    metrics: {
        burnRate: number;
        runway: number;
        grossMargin: number;

        // NEW: Unit Economics
        cac?: number;
        arpu?: number;
        ltv?: number;
        ltvCacRatio?: number;
    };
}

// ============================================
// SCENARIO RESULT
// ============================================
export interface ScenarioResult {
    scenario: ScenarioType;
    name: string;
    monthly: MonthlyFinancialResult[];
    summary: {
        totalRevenue: number;
        totalProfit: number;
        breakevenMonth: number | null;
        neededCapital: number;
        unitEconomics?: UnitEconomics;
    };
}

// ============================================
// ENHANCED FINANCIAL MODEL RESULT
// ============================================
export interface FinancialModelResult {
    // Base scenario (Orta Senaryo)
    monthly: MonthlyFinancialResult[];

    summary: {
        totalRevenue: number;
        totalProfit: number;
        breakevenMonth: number | null;
        neededCapital: number;
        paybackPeriod: number | null; // NEW: Yatırım geri ödeme süresi

        // NEW: Unit Economics
        unitEconomics?: UnitEconomics;

        // NEW: Cost Structure
        costStructure?: {
            totalFixed: number;
            totalVariable: number;
            fixedPercentage: number;
            variablePercentage: number;
        };
    };

    redFlags: string[];

    // NEW: Multi-scenario results
    scenarios?: ScenarioResult[];

    // NEW: Scenario Analysis Summary
    scenarioAnalysis?: {
        averageRevenue: number;
        averageProfit: number;
        riskScore: number; // 0-100 (worst-best farkına göre)
    };
}

// ============================================
// DEATH VALLEY CHART DATA
// ============================================
export interface DeathValleyChartData {
    month: number;
    cumulativeProfit: number;
    cumulativeCash: number;
    isPositive: boolean;
    deathValleyDepth?: number; // En derin nokta
}
