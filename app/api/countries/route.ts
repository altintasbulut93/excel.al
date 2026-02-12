import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get countries
        const { data: countries, error: countriesError } = await supabase
            .from('countries')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (countriesError) {
            throw countriesError;
        }

        // Get country rules
        const { data: rules, error: rulesError } = await supabase
            .from('country_financial_rules')
            .select('*');

        if (rulesError) {
            throw rulesError;
        }

        return NextResponse.json({
            success: true,
            countries,
            rules
        });
    } catch (error: any) {
        console.error('Error fetching countries:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
