import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { country_code, locale, user_id } = body;

        if (!user_id || !country_code) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Update profile
        const { error } = await supabase
            .from('profiles')
            .update({
                country_code,
                locale: locale || 'en-US',
                updated_at: new Date().toISOString()
            })
            .eq('id', user_id);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true
        });
    } catch (error: any) {
        console.error('Error updating user country:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
