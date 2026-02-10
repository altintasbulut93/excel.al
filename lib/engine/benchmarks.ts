
export const BENCHMARKS = {
    SaaS: {
        grossMargin: [0.70, 0.85], // 70-85%
        marketingSpend: [0.20, 0.30], // 20-30% of revenue
        churn: [0.03, 0.07], // 3-7%
        revenuePerEmployee: [150000, 300000] // USD -> TRY 
    },
    'E-commerce': {
        grossMargin: [0.25, 0.40],
        marketingSpend: [0.15, 0.25],
        churn: [0.05, 0.10], // Higher customer turnover
        revenuePerEmployee: [300000, 500000] // High volume low margin
    },
    Marketplace: {
        grossMargin: [0.60, 0.75], // If commission based
        marketingSpend: [0.25, 0.35],
        churn: [0.03, 0.05],
        revenuePerEmployee: [200000, 400000]
    },
    Consulting: {
        grossMargin: [0.50, 0.60],
        marketingSpend: [0.05, 0.10], // Referrals
        churn: [0.02, 0.03], // Long term contracts
        revenuePerEmployee: [100000, 200000]
    },
    Other: {
        grossMargin: [0.40, 0.60],
        marketingSpend: [0.10, 0.20],
        churn: [0.05, 0.10],
        revenuePerEmployee: [150000, 300000]
    }
};
