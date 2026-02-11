
export interface Pricing {
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR';
    period: 'monthly' | 'annual' | 'one_time';
}

export interface Growth {
    initialCustomers: number;
    monthlyGrowthRate: number; // 0.10 for 10%
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
}

export interface Marketing {
    type: 'percentage' | 'fixed';
    value: number; // 0.20 or 5000
}

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
}

export interface MonthlyFinancialResult {
    month: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: {
        personnel: number;
        marketing: number;
        fixed: number;
        other: number;
    };
    totalExpenses: number;
    ebitda: number;
    netIncome: number;
    cashFlow: {
        inflow: number;
        outflow: number;
        net: number;
        beginningBalance: number;
        endingBalance: number;
    };
    metrics: {
        burnRate: number;
        runway: number;
        grossMargin: number;
    };
}

export interface FinancialModelResult {
    monthly: MonthlyFinancialResult[];
    summary: {
        totalRevenue: number;
        totalProfit: number;
        breakevenMonth: number | null;
        neededCapital: number;
    };
    redFlags: string[];
}
