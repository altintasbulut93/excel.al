import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia', // Latest API version
    typescript: true,
});

// PRICING CONFIGURATION
// Replace 'price_...' with actual Price IDs from your Stripe Dashboard
// Pricing Plans moved to @/lib/pricing-plans.ts

export const getStripeSession = async (
    priceId: string,
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
) => {
    // 1. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        client_reference_id: userId,
        customer_email: userEmail, // Pre-fill email
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
            metadata: {
                userId: userId // Store userId in subscription metadata too
            }
        },
        metadata: {
            userId: userId
        }
    });

    return session;
};

export const createCustomerPortal = async (customerId: string, returnUrl: string) => {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return session;
};
