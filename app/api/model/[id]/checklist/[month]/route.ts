import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const DEFAULT_TASKS = [
    { id: 'revenue', title: 'Gelirleri Güncelle', completed: false },
    { id: 'expenses', title: 'Giderleri Güncelle', completed: false },
    { id: 'customers', title: 'Yeni Müşteri Sayısını Gir', completed: false },
    { id: 'review', title: 'Metrikleri İncele', completed: false }
];

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string, month: string } }
) {
    try {
        const { id: model_id, month } = params;
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

        let { data: checklist, error } = await supabase
            .from('monthly_checklists')
            .select('*')
            .eq('model_id', model_id)
            .eq('month', month)
            .maybeSingle();

        if (error) throw error;

        // If checklist doesn't exist, return default structure (don't create yet to save DB space until interaction)
        if (!checklist) {
            return NextResponse.json({
                success: true,
                checklist: {
                    model_id,
                    user_id: user.id,
                    month,
                    tasks: DEFAULT_TASKS,
                    completed_count: 0,
                    total_count: DEFAULT_TASKS.length
                }
            });
        }

        return NextResponse.json({ success: true, checklist });

    } catch (error: any) {
        console.error('Checklist get error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
