
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

        // Insert Inputs as separate columns for easier querying if needed, or just dump to JSON
        const record = {
            business_name: input.businessName,
            sector: input.sector,
            inputs: input,
            outputs: results.summary,
            user_id: uid || null,
            updated_at: new Date().toISOString()
        };

        // Check if we should update or insert? For MVP simple insert (new version) or we need model_id in store
        // Let's just insert new for now

        const { data, error } = await supabase
            .from('financial_models')
            .insert([record])
            .select()
            .single();

        if (error) {
            console.error('Supabase Save Error:', error);
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
