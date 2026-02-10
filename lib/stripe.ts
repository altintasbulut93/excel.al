
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia', // Latest API version
    typescript: true,
});

export const getStripeSession = async (priceId: string, successUrl: string, cancelUrl: string) => {
    // Implementation in API route
};
