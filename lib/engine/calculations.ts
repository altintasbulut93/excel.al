
import { TR_CONSTANTS_2025 } from './constants';

// --- VERGİ & SGK HESAPLAMALARI ---

/**
 * Brüt Maaştan Toplam İşveren Maliyetini Hesaplar (Aylık)
 * @param grossSalary Aylık Brüt Maaş
 * @param applyIncentive %5 Hazine teşviki uygulansın mı? (Varsayılan: Evet)
 */
export function calculateEmployerCost(grossSalary: number, applyIncentive = true): number {
    // SGK Tavan Kontrolü (2025: Asgari ücretin 7.5 katı)
    const SGK_CEILING = TR_CONSTANTS_2025.MIN_WAGE_GROSS * 7.5;
    const baseSalary = Math.min(grossSalary, SGK_CEILING);

    // İşsizlik Sigortası İşveren Payı (%2)
    const unemploymentEmployer = baseSalary * 0.02;

    // SGK İşveren Payı (%20.5 - Teşvikli, %25.5 - Teşviksiz? PRD says 22.5 total)
    // Normalde: %20.5 (Malullük, Yaşlılık, Ölüm) + %2 (Kısa Vadeli Sigorta) = %22.5
    // 5 puan indirim varsa: %15.5 + %2 = %17.5 + %2 (işsizlik) = %19.5?
    // PRD net olarak "SGK İşveren Payı: %22.5" diyor. Biz bunu baz alalım.
    // Bu oran genellikle "5 puanlık indirim HARİÇ" %22.5 civarıdır veya dahil edilmiş halidir.
    // PRD'yi kaynak (source of truth) kabul edip 22.5% uyguluyoruz.

    const sgkEmployer = baseSalary * TR_CONSTANTS_2025.SGK_EMPLOYER_RATE;

    return grossSalary + sgkEmployer;
}

/**
 * Net Maaştan Brüt Maaşa (Yaklaşık)
 * @param netSalary Hedeflenen Net Maaş
 * Not: Bu çok karmaşık bir hesap (vergi dilimleri kümülatif artar).
 * Basitlik için ortalama bir "Gross Up" katsayısı kullanacağız veya iteratif hesaplayacağız.
 * MVP için: Net * 1.45 (Yaklaşık %30-35 kesinti varsayımı)
 */
export function netToGrossEstimate(netSalary: number): number {
    // 2025 Asgari ücret civarında oran: ~1.17
    // Yüksek maaşlarda oran: ~1.60
    if (netSalary <= TR_CONSTANTS_2025.MIN_WAGE_NET * 1.1) return TR_CONSTANTS_2025.MIN_WAGE_GROSS;
    return netSalary * 1.45;
}

/**
 * Gelir Vergisi Hesaplama (Basitleştirilmiş - Aylık/Yıllık Matrah)
 * @param cumulativeIncomeBaset Yıllık Kümülatif Matrah
 * @param monthlyTaxBase Aylık Vergi Matrahı
 */
export function calculateIncomeTax(cumulativeIncomeBase: number, monthlyTaxBase: number): number {
    // Dilim hesabı - MVP için basitleştirilmiş:
    // Sadece o ayki matrahın hangi dilime girdiğine kabaca bakacağız.
    // Gerçekte dilimler arası geçişi hesaplamak gerekir.

    let remainingBase = monthlyTaxBase;
    let currentCumulative = cumulativeIncomeBase;
    let totalTax = 0;

    for (const bracket of TR_CONSTANTS_2025.INCOME_TAX_BRACKETS) {
        if (remainingBase <= 0) break;

        const limit = bracket.limit;
        const rate = bracket.rate;

        // Bu dilimde ne kadar boşluk var?
        const spaceInBracket = limit - currentCumulative;

        if (spaceInBracket > 0) {
            const amountInBracket = Math.min(remainingBase, spaceInBracket);
            totalTax += amountInBracket * rate;
            remainingBase -= amountInBracket;
            currentCumulative += amountInBracket;
        }
        // Eğer zaten bu dilimi geçtiysek devam et
    }

    return totalTax;
}

// --- FİNANSAL TABLO HESAPLAMALARI ---

/**
 * Brüt Kâr Hesapla
 */
export function calculateGrossProfit(revenue: number, cogs: number) {
    return revenue - cogs;
}

/**
 * EBITDA (FAVÖK) Hesapla
 */
export function calculateEBITDA(grossProfit: number, operatingExpenses: number) {
    return grossProfit - operatingExpenses;
}

/**
 * Kurumlar Vergisi (Tahmini %25 - 2025)
 */
export function calculateCorporateTax(profitBeforeTax: number): number {
    if (profitBeforeTax <= 0) return 0;
    return profitBeforeTax * 0.25;
}
