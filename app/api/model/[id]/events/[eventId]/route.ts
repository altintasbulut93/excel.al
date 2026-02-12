import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string, eventId: string } }
) {
    try {
        const { id: model_id, eventId } = params;
        const body = await request.json();
        const { event_type, event_name, effective_date, payload } = body;
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

        const { data: event, error } = await supabase
            .from('model_events')
            .update({
                event_type,
                event_name,
                effective_date,
                payload,
                updated_at: new Date().toISOString()
            })
            .eq('id', eventId)
            // RLS ensures user owns the model, but for strict check:
            // .eq('model_id', model_id) // technically redundant with RLS but good
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, event });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string, eventId: string } }
) {
    try {
        const { id: model_id, eventId } = params;
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

        const { error } = await supabase
            .from('model_events')
            .delete()
            .eq('id', eventId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
