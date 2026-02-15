// SHARED PRICING CONFIGURATION (Safe for Client & Server)

export const PRICING_PLANS = {
    TR: {
        currency: 'TRY',
        monthly: {
            priceId: 'price_1Q...', // Create this in Stripe (499 TL)
            amount: 499,
            label: 'Aylık Plan'
        },
        yearly: {
            priceId: 'price_1Q...', // Create this in Stripe (399 * 12 TL)
            amount: 4788, // 399 * 12
            label: 'Yıllık Plan (%20 İndirimli)'
        }
    },
    GLOBAL: {
        currency: 'USD',
        monthly: {
            priceId: 'price_1Q...', // Create this in Stripe ($49)
            amount: 49,
            label: 'Monthly Plan'
        },
        yearly: {
            priceId: 'price_1Q...', // Create this in Stripe ($39 * 12)
            amount: 468, // 39 * 12
            label: 'Annual Plan (Save 20%)'
        }
    }
};
