import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: templates, error } = await supabase
            .from('industry_templates')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            templates
        });
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
