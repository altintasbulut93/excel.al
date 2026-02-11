
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Lazy initialization - creates client on first use
function getSupabaseClient(): SupabaseClient | null {
    // Return existing instance if already created
    if (supabaseInstance) {
        return supabaseInstance;
    }

    // Get env vars (works both server-side and client-side for NEXT_PUBLIC_*)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate
    const isValidUrl = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

    if (!supabaseUrl || !supabaseKey || !isValidUrl) {
        // Only warn on server-side to avoid console spam
        if (typeof window === 'undefined') {
            console.warn(
                '⚠️ Supabase credentials not found or invalid. ' +
                `URL: ${supabaseUrl ? 'present' : 'missing'}, ` +
                `Key: ${supabaseKey ? 'present' : 'missing'}, ` +
                `Valid URL: ${isValidUrl}`
            );
        } else {
            // Client-side - more helpful error
            console.error(
                '❌ Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify environment variables.'
            );
        }
        return null;
    }

    try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client created successfully');
        return supabaseInstance;
    } catch (error) {
        console.error('❌ Failed to create Supabase client:', error);
        return null;
    }
}

// Export as a getter function instead of direct instance
export const getSupabase = getSupabaseClient;

// For backward compatibility, export a direct reference (but it's lazy-initialized)
export const supabase = getSupabaseClient();
