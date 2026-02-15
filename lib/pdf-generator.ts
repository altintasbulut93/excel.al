import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialInput, FinancialModelResult } from './engine/types';
import { generateFinancialModel } from './engine/financials';

// --- DESIGN SYSTEM (21.dev Inspired) ---
const THEME = {
    colors: {
        primary: [15, 23, 42],      // Slate 900 (Deep, Professional)
        secondary: [71, 85, 105],   // Slate 600 (Subtle Text)
        accent: [37, 99, 235],      // Blue 600 (Trust, Action)
        success: [22, 163, 74],     // Green 600
        danger: [220, 38, 38],      // Red 600
        surface: [248, 250, 252],   // Slate 50 (Backgrounds)
        border: [226, 232, 240]     // Slate 200
    },
    layout: {
        margin: 20,
        pageWidth: 210, // A4 width in mm
        pageHeight: 297, // A4 height in mm
        contentWidth: 170
    }
};

const formatCurrency = (value: number): string => {
    if (value === 0) return '-';
    try {
        const txt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.abs(value));
        return value < 0 ? `(${txt})` : txt;
    } catch (e) {
        return value.toFixed(0);
    }
};

const formatPercent = (value: number): string => {
    return `%${(value * 100).toFixed(1)}`;
};

// --- HELPER: Fetch Font (Roboto) ---
const fetchFont = async (): Promise<string> => {
    try {
        const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
        if (!response.ok) throw new Error('Font download failed');
        const buffer = await response.arrayBuffer();

        if (typeof window === 'undefined') {
            return Buffer.from(buffer).toString('base64');
        } else {
            const blob = new Blob([buffer]);
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    resolve(base64data.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
    } catch (e) {
        console.error("Font loading error", e);
        return "";
    }
};

// --- NARRATIVE ENGINE ---
const generateNarrative = (model: FinancialModelResult, input: FinancialInput): any => {
    const revenueItems = input.revenueItems || [];
    const mainRevenueDriver = revenueItems.length > 0 ? revenueItems.sort((a, b) => (b.price * b.initialCustomers) - (a.price * a.initialCustomers))[0] : null;

    // Revenue Story
    let revenueStory = `Bu finansal model, ${input.businessName || 'Girişim'} için oluşturulmuş stratejik bir projeksiyondur. `;
    if (mainRevenueDriver) {
        revenueStory += `Gelir yapısı, özellikle "${mainRevenueDriver.name}" kaleminin performansına dayalıdır. `;
    }
    if (revenueItems.length > 1) {
        revenueStory += `Modelde toplam ${revenueItems.length} farklı gelir akışı tanımlanmış olup, bu çeşitlilik nakit akışı istikrarını desteklemektedir. `;
    }

    // Calculate CAGR safely
    let cagr = 0;
    if (model.monthly && model.monthly.length >= 12 && model.monthly[0].revenue > 0) {
        cagr = Math.pow(model.monthly[11].revenue / model.monthly[0].revenue, 1 / 11) - 1;
    }

    revenueStory += `İlk 12 aylık dönemde, aylık bileşik büyüme oranının (CMGR) ${formatPercent(cagr)} seviyesinde gerçekleşmesi öngörülmektedir.`;

    // Cost Story
    const fixedRatio = (model.summary.costStructure?.fixedPercentage || 0);
    let costStory = `Operasyonel verimlilik açısından bakıldığında, maliyet yapısının %${fixedRatio.toFixed(0)}'si sabit giderlerden oluşmaktadır. `;
    if (fixedRatio > 60) {
        costStory += `Yüksek sabit gider oranı, ölçeklenme sürecinde operasyonel kaldıraç avantajı sağlayabilir, ancak başlangıçta nakit rezervlerinin güçlü tutulmasını gerektirir. `;
    } else {
        costStory += `Değişken gider ağırlıklı yapı, talep dalgalanmalarına karşı esnek bir maliyet yönetimi imkanı sunmaktadır. `;
    }

    // Investment/Funding Story
    let fundingStory = `Girişimin ilk yıl operasyonlarını sürdürebilmesi için toplam simule edilen nakit ihtiyacı ${formatCurrency(model.summary.neededCapital)} TL seviyesindedir. `;

    if (model.monthly && model.monthly.length >= 12 && model.monthly[11].metrics.runway < 6) {
        fundingStory += `Mevcut projeksiyonlara göre 12. ay itibarıyla nakit rezervleri kritiktir ve ek finansman turları planlanmalıdır. `;
    } else {
        fundingStory += `Model, 12 ayın sonunda sağlıklı bir nakit pozisyonuna işaret etmekte olup, finansal sürdürülebilirlik açısından güven vermektedir. `;
    }

    return { revenueStory, costStory, fundingStory };
};

// --- PDF GENERATOR CORE ---
export async function createPDFReport(input: FinancialInput, purpose: string = 'Genel'): Promise<jsPDF> {
    const model = generateFinancialModel(input);
    const narrative = generateNarrative(model, input);
    const doc = new jsPDF();

    // Load Font
    const fontBase64 = await fetchFont();
    if (fontBase64) {
        doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");
    } else {
        doc.setFont("helvetica");
    }

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- DRAW UTILS ---
    const drawHeader = (page: number, title: string) => {
        // Top Line
        doc.setDrawColor(THEME.colors.border[0], THEME.colors.border[1], THEME.colors.border[2]);
        doc.line(THEME.layout.margin, 25, THEME.layout.pageWidth - THEME.layout.margin, 25);

        // Logo / Name Left
        doc.setFontSize(10);
        doc.setTextColor(THEME.colors.secondary[0], THEME.colors.secondary[1], THEME.colors.secondary[2]);
        if (input.businessName) {
            doc.text(input.businessName.toUpperCase(), THEME.layout.margin, 20);
        }

        // Section Title Right
        doc.text(title.toUpperCase(), THEME.layout.pageWidth - THEME.layout.margin, 20, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`excel.al | ${purpose} Raporu`, THEME.layout.margin, THEME.layout.pageHeight - 10);
        doc.text(page.toString(), THEME.layout.pageWidth - THEME.layout.margin, THEME.layout.pageHeight - 10, { align: 'right' });
    };

    // ==========================================
    // PAGE 1: COVER PAGE (Minimalist & Bold)
    // ==========================================

    // Background Accent
    doc.setFillColor(THEME.colors.surface[0], THEME.colors.surface[1], THEME.colors.surface[2]);
    doc.rect(0, 0, THEME.layout.pageWidth, THEME.layout.pageHeight, 'F');

    // Logo (Centered, Larger)
    if (input.logoUrl) {
        try {
            const imgProps = doc.getImageProperties(input.logoUrl);
            const maxWidth = 50;
            const ratio = maxWidth / imgProps.width;
            doc.addImage(input.logoUrl, 'PNG', (THEME.layout.pageWidth - (imgProps.width * ratio)) / 2, 80, imgProps.width * ratio, imgProps.height * ratio);
        } catch (e) { }
    } else {
        // Fallback Logo text
        doc.setFontSize(30);
        doc.setTextColor(THEME.colors.accent[0], THEME.colors.accent[1], THEME.colors.accent[2]);
        doc.text((input.businessName || 'GIRIŞIM').charAt(0).toUpperCase(), THEME.layout.pageWidth / 2, 90, { align: 'center' });
    }

    // Title Block
    doc.setFontSize(28); // Slightly smaller to ensure fit
    doc.setTextColor(THEME.colors.primary[0], THEME.colors.primary[1], THEME.colors.primary[2]);
    const titleY = input.logoUrl ? 140 : 120;
    doc.text(input.businessName || "FİNANSAL MODEL", THEME.layout.pageWidth / 2, titleY, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(THEME.colors.accent[0], THEME.colors.accent[1], THEME.colors.accent[2]);
    doc.text(`${purpose.toUpperCase()} RAPORU`, THEME.layout.pageWidth / 2, titleY + 15, { align: 'center' });

    // Date & Version
    doc.setFontSize(10);
    doc.setTextColor(THEME.colors.secondary[0], THEME.colors.secondary[1], THEME.colors.secondary[2]);
    const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(dateStr, THEME.layout.pageWidth / 2, 260, { align: 'center' });
    doc.text("Hazırlayan: excel.al", THEME.layout.pageWidth / 2, 266, { align: 'center' });

    // ==========================================
    // PAGE 2: EXECUTIVE SUMMARY
    // ==========================================
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, THEME.layout.pageWidth, THEME.layout.pageHeight, 'F');
    drawHeader(2, "Yönetici Özeti");

    let yPos = 40;

    // 1. Business Description
    doc.setFontSize(18);
    doc.setTextColor(THEME.colors.primary[0], THEME.colors.primary[1], THEME.colors.primary[2]);
    doc.text("Girişim Özeti", THEME.layout.margin, yPos);
    yPos += 12;

    doc.setFontSize(10);
    doc.setTextColor(THEME.colors.secondary[0], THEME.colors.secondary[1], THEME.colors.secondary[2]);
    const descText = input.description || "Girişim açıklaması girilmemiştir.";
    try {
        const splitDesc = doc.splitTextToSize(descText, THEME.layout.contentWidth);
        doc.text(splitDesc, THEME.layout.margin, yPos);
        yPos += (splitDesc.length * 5) + 15;
    } catch (e) {
        doc.text(descText.substring(0, 200) + '...', THEME.layout.margin, yPos);
        yPos += 20;
    }

    // 2. Financial Narrative (Generated)
    doc.setFontSize(16);
    doc.setTextColor(THEME.colors.primary[0], THEME.colors.primary[1], THEME.colors.primary[2]);
    doc.text("Finansal Analiz & Görünüm", THEME.layout.margin, yPos);
    yPos += 10;

    const sections = [
        { title: "Gelir Modeli", text: narrative.revenueStory },
        { title: "Maliyet Yapısı", text: narrative.costStory },
        { title: "Yatırım İhtiyacı", text: narrative.fundingStory }
    ];

    sections.forEach(sec => {
        // Section Title
        doc.setFontSize(11);
        doc.setFont(fontBase64 ? 'Roboto' : 'helvetica', 'bold'); // Make bold
        doc.setTextColor(THEME.colors.primary[0], THEME.colors.primary[1], THEME.colors.primary[2]);
        doc.text(sec.title, THEME.layout.margin, yPos);
        yPos += 6;

        // Section Text
        doc.setFontSize(10);
        doc.setFont(fontBase64 ? 'Roboto' : 'helvetica', 'normal');
        doc.setTextColor(THEME.colors.secondary[0], THEME.colors.secondary[1], THEME.colors.secondary[2]);

        try {
            const splitText = doc.splitTextToSize(sec.text, THEME.layout.contentWidth);
            doc.text(splitText, THEME.layout.margin, yPos);
            yPos += (splitText.length * 5) + 8; // Spacing
        } catch (e) { }
    });

    // 3. Key Metrics Grid
    yPos += 5;
    const metricsY = yPos;

    // Draw 3 cards
    const cardWidth = (THEME.layout.contentWidth - 10) / 3;
    const metrics = [
        { label: "Yıllık Gelir Projeksiyonu", value: `${formatCurrency(model.summary.totalRevenue)}`, sub: "İlk 12 Ay Toplamı" },
        { label: "Net Kâr Marjı", value: formatPercent(model.summary.totalProfit / (model.summary.totalRevenue || 1)), sub: "Ortalama" },
        { label: "Gerekli Sermaye", value: `${formatCurrency(model.summary.neededCapital)}`, sub: "Başlangıç + Burn" }
    ];

    metrics.forEach((m, i) => {
        const x = THEME.layout.margin + (i * (cardWidth + 5));

        // Card Bg
        doc.setFillColor(THEME.colors.surface[0], THEME.colors.surface[1], THEME.colors.surface[2]);
        doc.setDrawColor(THEME.colors.border[0], THEME.colors.border[1], THEME.colors.border[2]);
        doc.roundedRect(x, metricsY, cardWidth, 30, 2, 2, 'FD');

        // Content
        doc.setFontSize(8);
        doc.setTextColor(THEME.colors.secondary[0], THEME.colors.secondary[1], THEME.colors.secondary[2]);
        doc.text(m.label.toUpperCase(), x + 6, metricsY + 8);

        doc.setFontSize(12); // Slightly smaller value text
        doc.setTextColor(THEME.colors.primary[0], THEME.colors.primary[1], THEME.colors.primary[2]);
        // Simple truncation for very long numbers
        const valText = m.value.length > 15 ? m.value.substring(0, 15) + '..' : m.value;
        doc.text(valText, x + 6, metricsY + 18);

        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(m.sub, x + 6, metricsY + 25);
    });

    // ==========================================
    // PAGE 3: REVENUE BREAKDOWN
    // ==========================================
    doc.addPage();
    drawHeader(3, "Gelir Detayları");

    doc.setFontSize(16);
    doc.setTextColor(THEME.colors.primary[0], THEME.colors.primary[1], THEME.colors.primary[2]);
    doc.text("Gelir Kalemleri ve Büyüme", THEME.layout.margin, 40);

    // Revenue Items Table
    const revenueData = (input.revenueItems || []).map(item => [
        item.name,
        `${formatCurrency(item.price)} ${item.currency || 'TL'}`,
        item.initialCustomers.toString(),
        formatPercent(item.monthlyGrowthRate || 0)
    ]);

    autoTable(doc, {
        startY: 50,
        head: [['Gelir Kalemi', 'Birim Fiyat', 'Başlangıç Adedi', 'Aylık Büyüme']],
        body: revenueData,
        theme: 'plain',
        styles: { font: fontBase64 ? 'Roboto' : 'helvetica', fontSize: 10, cellPadding: 8 },
        headStyles: {
            fillColor: THEME.colors.surface,
            textColor: THEME.colors.secondary,
            fontStyle: 'bold',
            lineColor: THEME.colors.border,
            lineWidth: 0.1
        },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: THEME.colors.primary },
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
    });

    // Monthly Projection Table (Last 6 Months Snapshot)
    let finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.text("Aylık Gelir Projeksiyonu (Detay)", THEME.layout.margin, finalY);

    const monthlySnap = model.monthly.slice(0, 12).map(m => [
        `${m.month}. Ay`,
        formatCurrency(m.revenue),
        formatCurrency(m.expenses.variable),
        formatCurrency(m.grossProfit),
        formatPercent((m.grossProfit / (m.revenue || 1)))
    ]);

    autoTable(doc, {
        startY: finalY + 10,
        head: [['Ay', 'Toplam Ciro', 'Değişken Giderler', 'Brüt Kâr', 'Brüt Kâr Marjı']],
        body: monthlySnap,
        theme: 'striped',
        styles: { font: fontBase64 ? 'Roboto' : 'helvetica', fontSize: 9 },
        headStyles: { fillColor: THEME.colors.primary, textColor: 255 },
        columnStyles: { 0: { halign: 'center', fontStyle: 'bold' }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
        margin: { left: 20, right: 20 }
    });

    // ==========================================
    // PAGE 4: DETAILED P&L STATEMENT
    // ==========================================
    doc.addPage();
    drawHeader(4, "Gelir Tablosu (P&L)");

    doc.setFontSize(16);
    doc.setTextColor(THEME.colors.primary[0], THEME.colors.primary[1], THEME.colors.primary[2]);
    doc.text("12 Aylık Kar/Zarar Tablosu", THEME.layout.margin, 40);

    const pnlData = model.monthly.slice(0, 12).map(m => [
        m.month.toString(),
        formatCurrency(m.revenue),
        formatCurrency(m.cogs),
        formatCurrency(m.grossProfit),
        formatCurrency(m.expenses.fixed + m.expenses.personnel + m.expenses.marketing),
        formatCurrency(m.ebitda),
        formatCurrency(m.netIncome)
    ]);

    autoTable(doc, {
        startY: 50,
        head: [['Ay', 'Gelir', 'SMM', 'Brüt Kâr', 'Faaliyet Gid.', 'EBITDA', 'Net Kâr']],
        body: pnlData,
        theme: 'grid',
        styles: { font: fontBase64 ? 'Roboto' : 'helvetica', fontSize: 8, halign: 'right', cellPadding: 3 },
        headStyles: { fillColor: THEME.colors.surface, textColor: THEME.colors.primary, lineColor: THEME.colors.border, lineWidth: 0.1 },
        columnStyles: {
            0: { halign: 'center', fontStyle: 'bold' },
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { fontStyle: 'bold', textColor: THEME.colors.accent, halign: 'right' },
            6: { fontStyle: 'bold', textColor: THEME.colors.success, halign: 'right' }
        },
        didParseCell: (data) => {
            if (data.section === 'body') {
                const raw = data.cell.raw as string;
                if (raw && raw.includes('(')) {
                    data.cell.styles.textColor = THEME.colors.danger;
                }
            }
        },
        margin: { left: 20, right: 20 }
    });

    return doc;
}
