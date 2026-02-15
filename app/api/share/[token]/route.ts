
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const token = params.token;
        const body = await req.json();
        const { password } = body;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // RPC call to secure function
        const { data, error } = await supabase.rpc('get_shared_model', {
            token_uuid: token,
            password_input: password || null
        });

        if (error) throw error;

        // Check for custom error object returned by RPC
        if (data && data.error) {
            return NextResponse.json({ success: false, ...data }, { status: data.code || 400 });
        }

        // The RPC returns { success: true, model: ... } so we return it directly
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Share Fetch Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
