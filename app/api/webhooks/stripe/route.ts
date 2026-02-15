import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Initialize Supabase Admin Client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = session.client_reference_id;

        if (!userId) {
            return NextResponse.json({ error: 'No user ID in session' }, { status: 400 });
        }

        // Upsert subscription
        await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0].price.id,
            stripe_status: subscription.status,
            stripe_current_period_end: new Date(subscription.current_period_end * 1000)
        });

        // Update profile tier
        await supabase.from('profiles').update({ subscription_tier: 'pro' }).eq('id', userId);
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        // Upsert subscription (extend date)
        await supabase.from('subscriptions').upsert({
            stripe_subscription_id: subscription.id,
            // ... match your schema ...
            stripe_status: subscription.status,
            stripe_current_period_end: new Date(subscription.current_period_end * 1000)
        });
    }

    return NextResponse.json({ received: true });
}
