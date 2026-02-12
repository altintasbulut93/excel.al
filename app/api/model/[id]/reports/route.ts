import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const model_id = params.id;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify/Get User
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const { data: reports, error } = await supabase
            .from('monthly_reports')
            .select('*')
            .eq('model_id', model_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, reports });
    } catch (error: any) {
        console.error('List reports error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
