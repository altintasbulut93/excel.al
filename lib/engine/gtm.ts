import { FinancialInput, GTMInput, MonthlyFinancialResult } from "./types";

export interface GTMResult {
    month: number;
    visits: number;
    leads: number;
    sqls: number;
    deals: number;
    marketingSpend: number;
    salesStaffCost: number;
    sdrCount: number;
    cac: number;
    newRevenue: number;
}

export function calculateGTM(input: FinancialInput): GTMResult[] {
    if (!input.gtm) return [];

    const results: GTMResult[] = [];
    const months = input.projectionMonths || 12; // Default to 12 if not specified

    // Initialize accumulators
    let currentDeals = 0;
    const isB2C = ['ecommerce', 'e-ticaret', 'retail', 'perakende', 'paryakende', 'production', 'üretim', 'marketplace'].includes((input.sector || '').toLowerCase()) || input.businessModel === 'B2C' || input.businessModel === 'B2B2C';

    for (let m = 1; m <= months; m++) {
        const { channels, funnel, capacity } = input.gtm;

        // 1. Marketing Spend & Traffic
        let totalSpend = 0;
        let totalVisits = 0;

        channels.forEach(channel => {
            // Spend can increase over time? For now, fixed monthly budget.
            // Future: Allow growth rate per channel
            totalSpend += channel.monthlyBudget;

            const visits = channel.monthlyBudget / (channel.cpc || 0.1); // Avoid div by zero
            totalVisits += visits;
        });

        // 2. Funnel Conversion
        // Weighted average conversion if needed, but simplistic for now:
        // We assume 'conversionVisitorToLead' comes from channel or global. 
        // In types, it's per channel. Good.

        let totalLeads = 0;
        channels.forEach(channel => {
            const visits = channel.monthlyBudget / (channel.cpc || 0.1);
            totalLeads += visits * channel.conversionVisitorToLead;
        });

        let sqls = 0;
        let deals = 0;

        if (isB2C) {
            // B2C Funnel: Visits -> Leads (Carts) -> SQLs (Checkout) -> Deals (Purchase)
            // uses `addToCartRate` if available, or fallback
            const cartToCheckout = funnel.addToCartRate ?? funnel.leadToSQL;
            const checkoutToPurchase = funnel.cartToPurchaseRate ?? funnel.sqlToDeal;

            sqls = totalLeads * cartToCheckout;
            deals = sqls * checkoutToPurchase;
        } else {
            // B2B Funnel
            sqls = totalLeads * funnel.leadToSQL;
            deals = sqls * funnel.sqlToDeal;
        }

        // 3. Sales Capacity (Only for B2B)
        // Leads determine conversion, but do we have enough Reps?
        // Simple logic: Hire reps to match leads.
        let requiredSDRs = 0;
        let salesStaffCost = 0;

        if (!isB2C) {
            requiredSDRs = Math.ceil(totalLeads / capacity.leadsPerRep);
            salesStaffCost = requiredSDRs * capacity.sdrSalary;
        }

        // 4. CAC Calculation
        // CAC = (Marketing Spend + Sales Salaries) / New Deals
        const totalAcquisitionCost = totalSpend + salesStaffCost;
        const cac = deals > 0 ? totalAcquisitionCost / deals : 0;

        // 5. Revenue Impact (New Revenue from Deals)
        // Assuming deals convert to the "Main Product" price
        const pricing = input.pricing;
        const newRevenue = deals * pricing.amount;

        results.push({
            month: m,
            visits: Math.round(totalVisits),
            leads: Math.round(totalLeads),
            sqls: Math.round(sqls),
            deals: Math.round(deals),
            marketingSpend: totalSpend,
            salesStaffCost,
            sdrCount: requiredSDRs,
            cac,
            newRevenue
        });
    }

    return results;
}
