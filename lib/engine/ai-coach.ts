
import { FinancialModelResult } from './types';

export interface Advice {
    id: string;
    type: 'critical' | 'warning' | 'opportunity' | 'success';
    title: string;
    message: string;
    metric?: string;
    action?: string;
}

export function analyzeFinancialHealth(results: FinancialModelResult): Advice[] {
    const advice: Advice[] = [];
    const summary = results.summary;
    const monthly = results.monthly;

    // 1. RUNWAY ANALYSIS (Critical)
    const runway = summary.runwayMonths || 0;
    if (runway < 6) {
        advice.push({
            id: 'runway-critical',
            type: 'critical',
            title: 'Nakit Akışı Riski',
            message: `Mevcut nakit akışınız 4. ayda daralıyor. Runway süreniz sadece ${runway} ay.`,
            metric: `${runway} Ay`,
            action: 'Sabit giderleri %10 düşürmeyi veya ek yatırım aramayı değerlendirin.'
        });
    } else if (runway < 12) {
        advice.push({
            id: 'runway-warning',
            type: 'warning',
            title: 'Yatırım İhtiyacı',
            message: 'Runway 12 ayın altında. Seri A hazırlıklarına başlamalısınız.',
            metric: `${runway} Ay`
        });
    } else {
        advice.push({
            id: 'runway-success',
            type: 'success',
            title: 'Güçlü Nakit Pozisyonu',
            message: '12+ ay runway ile büyüme odaklı harcama yapabilirsiniz.',
            metric: 'Güvenli'
        });
    }

    // 2. PROFITABILITY (Unit Economics)
    // Check if profitMargin exists, otherwise calculate it
    const margin = (summary as any).profitMargin ?? (summary.totalRevenue > 0 ? summary.totalProfit / summary.totalRevenue : 0);

    if (margin < 0.10 && summary.totalRevenue > 0) {
        advice.push({
            id: 'margin-low',
            type: 'warning',
            title: 'Düşük Kar Marjı',
            message: `Net kar marjınız %${(margin * 100).toFixed(1)}. Endüstri ortalamasının altında.`,
            action: 'COGS kalemlerini veya pazarlama verimliliğini (CAC) gözden geçirin.'
        });
    }

    // 3. MARKETING EFFICIENCY
    // Check if marketing spend is growing faster than revenue
    const m1Rev = monthly[0]?.revenue || 0;
    const m6Rev = monthly[5]?.revenue || 0;
    const m1Mkt = monthly[0]?.expenses.marketing || 0;
    const m6Mkt = monthly[5]?.expenses.marketing || 0;

    if (m1Rev > 0 && m6Rev > 0) {
        const revGrowth = (m6Rev - m1Rev) / m1Rev;
        const mktGrowth = (m6Mkt - m1Mkt) / m1Mkt;

        if (mktGrowth > revGrowth * 1.5) {
            advice.push({
                id: 'mkt-inefficient',
                type: 'opportunity',
                title: 'Pazarlama Optimizasyonu',
                message: 'Pazarlama bütçeniz gelirden 1.5x hızlı artıyor. Verimsiz kanalları kapatın.',
                action: '%10 Bütçe Kesintisi Önerilir'
            });
        }
    }

    return advice;
}
