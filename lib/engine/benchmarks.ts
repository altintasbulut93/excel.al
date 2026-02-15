
// Basic industry standards (Mock Data for now)
export const SECTOR_BENCHMARKS = {
    'saas': [
        { subject: 'Kar Marjı (Profit)', A: 20, fullMark: 100 },
        { subject: 'Büyüme (Growth)', A: 10, fullMark: 100 },
        { subject: 'Pazarlama (Mkt)', A: 30, fullMark: 100 },
        { subject: 'Churn', A: 5, fullMark: 100 }, // Lower is better, but radar logic might need inversion or normalization
        { subject: 'Ar-Ge (R&D)', A: 20, fullMark: 100 },
        { subject: 'Gider/Gelir', A: 80, fullMark: 100 },
    ],
    'e-ticaret': [
        { subject: 'Kar Marjı (Profit)', A: 15, fullMark: 100 },
        { subject: 'Büyüme (Growth)', A: 15, fullMark: 100 },
        { subject: 'Pazarlama (Mkt)', A: 20, fullMark: 100 },
        { subject: 'İade (Return)', A: 10, fullMark: 100 },
        { subject: 'Lojistik', A: 15, fullMark: 100 },
        { subject: 'Gider/Gelir', A: 85, fullMark: 100 },
    ],
    'default': [
        { subject: 'Profit', A: 15, fullMark: 100 },
        { subject: 'Growth', A: 10, fullMark: 100 },
        { subject: 'Marketing', A: 20, fullMark: 100 },
        { subject: 'Efficiency', A: 60, fullMark: 100 },
        { subject: 'Innovation', A: 10, fullMark: 100 },
        { subject: 'Resilience', A: 50, fullMark: 100 },
    ]
};

export function getBenchmarks(sector: string) {
    const key = sector.toLowerCase();
    if (key.includes('saas') || key.includes('yazılım')) return SECTOR_BENCHMARKS['saas'];
    if (key.includes('ticaret') || key.includes('retail') || key.includes('perakende')) return SECTOR_BENCHMARKS['e-ticaret'];
    return SECTOR_BENCHMARKS['default'];
}
