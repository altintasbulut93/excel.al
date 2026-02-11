import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialInput } from './engine/types';
import { generateFinancialModel } from './engine/financials';
import { formatCurrency } from './utils';

export function createPDFReport(input: FinancialInput): jsPDF {
    const model = generateFinancialModel(input);
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('excel.al', 105, 15, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Finansal Model Özeti', 105, 25, { align: 'center' });

    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Şirket: ${input.businessName}`, 20, 35);
    doc.text(`Sektör: ${input.sector}`, 20, 40);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, 45);

    // Summary Metrics Box
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.rect(15, 50, 180, 40);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('📊 TEMEL METRİKLER', 20, 58);

    doc.setFontSize(10);
    const metrics = [
        `• İlk Yıl Toplam Ciro: ${formatCurrency(model.summary.totalRevenue)}`,
        `• Toplam Net Kâr: ${formatCurrency(model.summary.totalProfit)}`,
        `• Brüt Kâr Marjı: %${((model.summary.totalRevenue - model.monthly.reduce((sum, m) => sum + m.cogs, 0)) / model.summary.totalRevenue * 100).toFixed(1)}`,
        `• Başabaş Noktası: ${model.summary.breakevenMonth ? model.summary.breakevenMonth + '. Ay' : 'Yok'}`,
        `• Gerekli Sermaye: ${formatCurrency(model.summary.neededCapital)}`,
    ];

    metrics.forEach((metric, i) => {
        doc.text(metric, 20, 65 + (i * 6));
    });

    // Monthly Summary Table
    doc.setFontSize(12);
    doc.text('📈 AYLIK ÖZET', 20, 100);

    const tableData = model.monthly.slice(0, 12).map((m, i) => [
        `${i + 1}. Ay`,
        formatCurrency(m.revenue),
        formatCurrency(m.expenses.personnel + m.expenses.marketing + m.expenses.fixed),
        formatCurrency(m.netIncome),
        formatCurrency(m.cashFlow.endingBalance),
    ]);

    autoTable(doc, {
        startY: 105,
        head: [['Ay', 'Gelir', 'Toplam Gider', 'Net Kâr', 'Nakit']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' },
        },
    });

    // Red Flags
    if (model.redFlags.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || 200;

        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38); // Red
        doc.text('⚠️ DİKKAT EDİLMESİ GEREKENLER', 20, finalY + 10);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        model.redFlags.forEach((flag, i) => {
            const lines = doc.splitTextToSize(`• ${flag}`, 170);
            doc.text(lines, 20, finalY + 18 + (i * 8));
        });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('excel.al ile oluşturuldu', 105, 285, { align: 'center' });

    return doc;
}
