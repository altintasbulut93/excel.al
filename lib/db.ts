
import { FinancialInput, FinancialModelResult } from './engine/types';
import { supabase } from './supabase';

/**
 * Saves the current financial model state to Supabase.
 * If user is not logged in, user_id will be null.
 */
export async function saveModelToSupabase(input: FinancialInput, results: FinancialModelResult, userId?: string) {
    try {
        // If userId not explicitly passed, try to get from session
        let uid = userId;
        if (!uid) {
            const { data } = await supabase.auth.getUser();
            uid = data.user?.id;
        }

        if (!uid) {
            throw new Error("Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.");
        }

        // Prepare record with enhanced fields
        const record = {
            business_name: input.businessName,
            sector: input.sector,
            inputs: input, // Store raw inputs
            outputs: results, // Store full results cache
            user_id: uid || null,
            updated_at: new Date().toISOString(),

            // Strategic Modules Data
            unit_economics: results.summary.unitEconomics || {},
            scenarios: results.scenarios || [],
            parameters: input.parameters || {},
            cost_structure: results.summary.costStructure || {},

            // Key Metrics for easy querying
            total_revenue: results.summary.totalRevenue || 0,
            total_profit: results.summary.totalProfit || 0,
            breakeven_month: results.summary.breakevenMonth,
            cac: results.summary.unitEconomics?.cac || 0,
            ltv: results.summary.unitEconomics?.ltv || 0,
            ltv_cac_ratio: results.summary.unitEconomics?.ltvCacRatio || 0,
            churn_rate: input.growth.churnRate || 0
        };

        // Check if we should update or insert? For MVP simple insert (new version) or we need model_id in store
        // Let's just insert new for now

        const { data, error } = await supabase
            .from('financial_models')
            .insert([record])
            .select()
            .single();

        if (error) {
            console.error('Supabase Save Error Details:', JSON.stringify(error, null, 2));
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Save failed:', err);
        throw err;
    }
}

export async function getUserModels() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('financial_models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
