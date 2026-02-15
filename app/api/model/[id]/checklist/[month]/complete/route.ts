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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, month: string }> }
) {
    try {
        const { id: model_id, month } = await params;
        const body = await request.json();
        const { taskId } = body;

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

        // 1. Get Checklist
        let { data: checklist, error } = await supabase
            .from('monthly_checklists')
            .select('*')
            .eq('model_id', model_id)
            .eq('month', month)
            .maybeSingle();

        if (error) throw error;

        if (!checklist) {
            // Create New Checklist if not exists
            const { data: newChecklist, error: createError } = await supabase
                .from('monthly_checklists')
                .insert([{
                    model_id,
                    user_id: user.id,
                    month: month, // YYYY-MM-DD format assumed
                    tasks: DEFAULT_TASKS,
                    completed_count: 0,
                    total_count: DEFAULT_TASKS.length
                }])
                .select()
                .single();

            if (createError) throw createError;
            checklist = newChecklist;
        }

        // 2. Update Task
        const tasks = checklist.tasks || [];
        const taskIndex = tasks.findIndex((t: any) => t.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].completed = true;
            const completedCount = tasks.filter((t: any) => t.completed).length;

            const { data: updatedChecklist, error: updateError } = await supabase
                .from('monthly_checklists')
                .update({
                    tasks: tasks,
                    completed_count: completedCount,
                    completed_at: completedCount === tasks.length ? new Date().toISOString() : null
                })
                .eq('id', checklist.id)
                .select()
                .single();

            if (updateError) throw updateError;
            return NextResponse.json({ success: true, checklist: updatedChecklist });
        }

        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

    } catch (error: any) {
        console.error('Checklist update error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
