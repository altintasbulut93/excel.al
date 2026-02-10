
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
    id: string; // Add ID property
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
    startingCapital: number; // Added this field
}

export interface MonthlyFinancials {
    month: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: {
        personnel: number;
        marketing: number;
        fixed: number;
        total: number;
    };
    ebitda: number;
    tax: number;
    netIncome: number;
    cashFlow: {
        inflow: number;
        outflow: number;
        net: number;
        openingBalance: number;
        endingBalance: number;
    };
}

export interface FinancialModelResult {
    monthly: MonthlyFinancials[];
    summary: {
        totalRevenue: number;
        totalProfit: number;
        totalExpenses: number;
        breakevenMonth: number | null;
        neededCapital: number;
        runwayMonths: number;
    };
    redFlags: string[];
}
