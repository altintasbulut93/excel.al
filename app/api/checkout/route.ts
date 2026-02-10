

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const PRICE_ID = 'price_1Sz0ABCDEF...'; // You need to replace this with your actual Price ID from Stripe Dashboard

export async function POST(req: NextRequest) {
    try {
        const { modelId } = await req.json();

        // Create Stripe client at runtime
        const apiKey = process.env.STRIPE_SECRET_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });
        }

        const stripe = new Stripe(apiKey, {
            apiVersion: '2026-01-28.clover',
        });

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
