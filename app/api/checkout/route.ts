import { NextRequest, NextResponse } from 'next/server';
import { getStripeSession } from '@/lib/stripe';
import { PRICING_PLANS } from '@/lib/pricing-plans';
import { createClient } from '@/lib/supabase'; // Adjust based on your actual Supabase client path
import { cookies } from 'next/headers';

// Mock function to determine region (In real app, use GeoIP or user selection)
const getRegion = (req: NextRequest) => {
    // Check header or query param
    const region = req.nextUrl.searchParams.get('region');
    return region === 'TR' ? 'TR' : 'GLOBAL';
};

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { planFreq, region } = body; // 'monthly' | 'yearly', 'TR' | 'GLOBAL'

        // Determine Price ID
        const selectedRegion = region === 'TR' ? 'TR' : 'GLOBAL';
        const plans = PRICING_PLANS[selectedRegion];
        const priceId = planFreq === 'yearly' ? plans.yearly.priceId : plans.monthly.priceId;

        // Create Session
        const session = await getStripeSession(
            priceId,
            user.id,
            user.email || '',
            `${req.nextUrl.origin}/dashboard?payment=success`,
            `${req.nextUrl.origin}/pricing?payment=cancelled`
        );

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
