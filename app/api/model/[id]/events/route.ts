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

        const { data: events, error } = await supabase
            .from('model_events')
            .select('*')
            .eq('model_id', model_id)
            .order('effective_date', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, events });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const model_id = params.id;
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
            .insert([{
                model_id,
                event_type,
                event_name,
                effective_date,
                payload,
                created_by: user.id
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, event });
    } catch (error: any) {
        // console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
