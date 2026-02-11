
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables
function getSupabaseConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build time, these might not be available - that's OK
    if (!supabaseUrl || !supabaseKey) {
        console.warn(
            '⚠️ Supabase credentials not found. This is expected during build time. ' +
            'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in production.'
        );

        // Return dummy values for build time
        return {
            url: supabaseUrl || 'https://placeholder.supabase.co',
            key: supabaseKey || 'placeholder-key'
        };
    }

    return {
        url: supabaseUrl,
        key: supabaseKey
    };
}

const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.key);
