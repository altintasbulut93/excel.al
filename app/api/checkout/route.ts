
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia',
});

const PRICE_ID = 'price_1Sz0ABCDEF...'; // You need to replace this with your actual Price ID from Stripe Dashboard

export async function POST(req: NextRequest) {
    try {
        const { modelId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription', // or 'payment' for one-time
            success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}&model_id=${modelId}`,
            cancel_url: `${req.headers.get('origin')}/?canceled=true`,
            metadata: {
                modelId: modelId
            }
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
