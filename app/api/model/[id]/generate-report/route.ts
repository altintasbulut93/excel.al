import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const model_id = params.id;
        const body = await request.json();
        const { report_type, report_month } = body;

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

        // Create Report Entry
        const { data: report, error } = await supabase
            .from('monthly_reports')
            .insert([{
                model_id,
                user_id: user.id,
                report_type: report_type || 'monthly',
                report_month: report_month || new Date().toISOString(), // format YYYY-MM-DD
                visibility: 'private',
                // Assuming storage_path and public_url will be updated by a worker later
            }])
            .select()
            .single();

        if (error) throw error;

        // Ideally enqueue a job here (e.g. to Supabase Edge Function or external queue)
        // await fetch(process.env.REPORT_WORKER_URL, { method: 'POST', body: JSON.stringify({ reportId: report.id }) });

        return NextResponse.json({ success: true, report });

    } catch (error: any) {
        console.error('Report generation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
