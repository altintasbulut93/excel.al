
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate and create Supabase client
function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate URL format
    const isValidUrl = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

    // During build time or when env vars are missing, return null to prevent crashes
    if (!supabaseUrl || !supabaseKey || !isValidUrl) {
        if (typeof window === 'undefined') {
            // Server-side (build time) - just warn
            console.warn(
                '⚠️ Supabase credentials not found or invalid. ' +
                'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly.'
            );
        }
        return null;
    }

    try {
        return createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        console.error('Failed to create Supabase client:', error);
        return null;
    }
}

export const supabase = createSupabaseClient();
