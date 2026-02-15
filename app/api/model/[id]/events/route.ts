import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const model_id = id;
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const model_id = id;
        const body = await request.json();
        const { event_type, event_name, effective_date, payload } = body;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify/Get User using token explicitly
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            console.error("Auth Fail:", userError);
            return NextResponse.json({ error: 'User not found or token invalid' }, { status: 401 });
        }

        // Ownership Check (Explicit)
        // This helps diagnose RLS failures by catching mismatch early
        const { data: model, error: modelError } = await supabase
            .from('financial_models')
            .select('user_id')
            .eq('id', model_id)
            .single();

        if (modelError || !model) {
            console.error(`Model Not Found Debug: User ${user.id} lookup model ${model_id}. Error:`, modelError);
            return NextResponse.json({
                error: `Model bulunamadı. (User: ${user.id}, Model: ${model_id}). RLS policy engeliyor olabilir.`
            }, { status: 404 });
        }

        if (model.user_id !== user.id) {
            console.error(`RLS Mismatch: Model Owner ${model.user_id} vs Request User ${user.id}`);
            return NextResponse.json({
                error: 'Model sahipliği doğrulanamadı. Lütfen sayfayı yenileyip modeli tekrar kaydedin.'
            }, { status: 403 });
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
