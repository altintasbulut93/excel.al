
// ============================================
// STRATEGIC FINANCIAL MODULES - TYPE SYSTEM
// ============================================

export interface Pricing {
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
    period: 'monthly' | 'annual' | 'one_time';
}

export interface MarketingChannel {
    id: string;
    name: string; // "Google Ads", "Meta", "SEO"
    monthlyBudget: number;
    cpc: number; // Cost Per Click
    conversionVisitorToLead: number; // 0.05 = 5%
}

export interface SalesFunnel {
    leadToSQL: number; // 0.20 = 20% (Marketing Qualified -> Sales Qualified)
    sqlToDeal: number; // 0.10 = 10% (Sales Qualified -> Won)
    salesCycleDays: number; // 30, 60, 90
    // NEW: B2C / E-commerce Funnel
    addToCartRate?: number; // 0.10 for 10%
    cartToPurchaseRate?: number; // 0.30 for 30%
}

export interface CapacityPlanning {
    leadsPerRep: number; // e.g. 100 leads/month per SDR
    sdrSalary: number; // Monthly gross cost per SDR
}

export interface GTMInput {
    channels: MarketingChannel[];
    funnel: SalesFunnel;
    capacity: CapacityPlanning;
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
    startMonth?: number; // 1 = Active/Immediately, >1 = Future Hire
}

export interface FixedExpense {
    id: string;
    name: string;
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
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
    gbpRate: number;          // Sterlin kuru (TRY)
    inflationRate: number;    // Yıllık enflasyon (0.40 = %40)
    salaryIncreaseRate: number; // Yıllık maaş artış oranı (0.25 = %25)
    taxRate: number;          // Kurumlar vergisi (0.25 = %25)
    // NEW: Localization (Turkey)
    kdvRate?: number;         // VAT (0.20)
    stopajRate?: number;      // Withholding Tax (0.20)
    sgkRate?: number;         // Social Security Employer Burden (0.20-0.35)
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

export interface RevenueItem {
    id: string;
    name: string;
    type: 'subscription' | 'one_time' | 'commission' | 'service';
    price: number;
    currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
    initialCustomers: number;
    monthlyGrowthRate: number; // 0.05 for 5%
    churnRate?: number; // 0.0-1.0
    // NEW: E-commerce / Retail Specific
    cogsPercentage?: number; // 0.40 = 40% cost of goods
    returnRate?: number; // 0.10 = 10% returns
    shippingCost?: number; // Fixed shipping cost per unit
}

// ============================================
// ENHANCED FINANCIAL INPUT
// ============================================
export interface FinancialInput {
    businessName: string;
    logoUrl?: string; // NEW: Logo image (Base64 or URL)
    description?: string; // NEW: Business Idea Description
    sector: string;
    businessModel?: 'B2B' | 'B2C' | 'B2B2C'; // NEW: Target Audience / Business Model
    revenueModel: string; // Global default/fallback
    revenueItems?: RevenueItem[]; // NEW: Multiple revenue streams
    pricing: Pricing;     // Global default/fallback
    growth: Growth;       // Global default/fallback
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
    gtm?: GTMInput; // NEW: Growth Engine Input
    language?: 'en' | 'tr' | 'de' | 'es' | 'fr' | 'ar' | 'pt'; // NEW: Global Language
    country?: string; // NEW: Selected Country (e.g., "Turkey", "United Kingdom")
    currency?: string; // NEW: Base Currency (e.g., "TRY", "USD", "EUR", "GBP")

    // NEW: User Reporting
    monthlyHighlights?: Record<string, string>; // "1": "We launched...", "2": "Revenue grew..."
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

    // GTM Metrics
    gtm?: {
        visits: number;
        leads: number;
        sqls: number;
        deals: number;
        marketingSpend: number;
        salesStaffCost: number;
        sdrCount: number;
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

        // NEW: Analytics helper fields
        runwayMonths?: number;
        burnRate?: number;
    };

    redFlags: string[];

    // NEW: Multi-scenario results
    scenarios?: ScenarioResult[];

    // NEW: Scenario Analysis Summary
    averageProfit: number;
    riskScore: number; // 0-100 (worst-best farkına göre)

    // NEW: Startup Health Score
    healthScore?: StartupHealthScore;
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

// ============================================
// NEW: STARTUP HEALTH SCORE
// ============================================
export interface StartupHealthScore {
    score: number; // 0-100
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    details: {
        profitability: number; // 0-20
        runway: number;        // 0-20
        growth: number;        // 0-20
        unitEconomics: number; // 0-20
        churn: number;         // 0-20
    };
    feedback: string[];
}
