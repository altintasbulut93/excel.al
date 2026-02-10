
// Türkiye 2025 Yasal Parametreleri
export const TR_CONSTANTS_2025 = {
    // Asgari Ücret (Aylık)
    MIN_WAGE_NET: 17002.12,
    MIN_WAGE_GROSS: 20002.50, // Brüt

    // SGK İşveren Payı
    SGK_EMPLOYER_RATE: 0.225, // %22.5 (5 puan indirimli varsayım, PRD %22.5 diyor)

    // Damga Vergisi Oranı (Maaşlarda)
    STAMP_TAX_RATE: 0.00759,

    // Gelir Vergisi Dilimleri (Yıllık Kümülatif Vergi Matrahına Göre)
    // 2025 Tahmini/PRD verileri
    INCOME_TAX_BRACKETS: [
        { limit: 110000, rate: 0.15 },
        { limit: 230000, rate: 0.20 },
        { limit: 580000, rate: 0.27 },
        { limit: 3000000, rate: 0.35 },
        { limit: Number.POSITIVE_INFINITY, rate: 0.40 },
    ],

    // Benchmark Verileri (Varsayılan)
    BENCHMARKS: {
        SAAS: {
            GROSS_MARGIN: 0.75,
            MARKETING_RATE: 0.25,
            CHURN: 0.05
        },
        ECOMMERCE: {
            GROSS_MARGIN: 0.35,
            MARKETING_RATE: 0.20,
            CHURN: 0.08 // Return rate impact or churn?
        }
    }
};
