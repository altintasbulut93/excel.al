
import { FinancialInput } from './engine/types';
import ExcelJS from 'exceljs';
import { generateFinancialModel } from './engine/financials';
import { TR_CONSTANTS_2025 } from './engine/constants';

export async function createExcelFile(input: FinancialInput): Promise<Buffer> {
    const model = generateFinancialModel(input);
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'excel.al';
    workbook.lastModifiedBy = 'excel.al';
    workbook.created = new Date();
    workbook.modified = new Date();

    // --- SHEET 1: DASHBOARD ---
    const sheetDash = workbook.addWorksheet('Dashboard');
    sheetDash.properties.tabColor = { argb: 'FF2563EB' };

    const titleStyle = { name: 'Arial', size: 20, bold: true, color: { argb: 'FF2563EB' } };
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
    const headerFont = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };

    sheetDash.mergeCells('A1:E1');
    const titleCell = sheetDash.getCell('A1');
    titleCell.value = `Finansal Projeksiyon: ${input.businessName}`;
    titleCell.font = titleStyle;

    // Summary Metrics
    const summaryTitle = sheetDash.getCell('A3');
    summaryTitle.value = "ÖZET METRİKLER";
    summaryTitle.font = { bold: true };

    sheetDash.columns = [
        { header: 'Metrik', key: 'metric', width: 30 },
        { header: 'Değer', key: 'value', width: 25 },
        { header: 'Not', key: 'note', width: 40 },
    ];

    sheetDash.addRow(['Toplam Ciro (1. Yıl)', model.summary.totalRevenue, 'İlk 12 ay satış toplamı']);
    sheetDash.addRow(['Toplam Net Kâr', model.summary.totalProfit, 'Vergi sonrası net kazanç']);
    sheetDash.addRow(['Başabaş Noktası', model.summary.breakevenMonth ? `${model.summary.breakevenMonth}. Ay` : 'Yok', 'Kâra geçilen ilk ay']);
    sheetDash.addRow(['Gerekli Sermaye', model.summary.neededCapital, 'En düşük kasa bakiyesi kadar ek kaynak']);

    // Format Currencies
    ['B5', 'B6', 'B8'].forEach(cell => {
        sheetDash.getCell(cell).numFmt = '#,##0 "TL"';
    });

    // Red Flags
    if (model.redFlags.length > 0) {
        sheetDash.addRow([]);
        sheetDash.addRow(['RİSK UYARILARI (Red Flags)']);
        sheetDash.lastRow!.font = { color: { argb: 'FFFF0000' }, bold: true };

        model.redFlags.forEach(flag => {
            sheetDash.addRow([flag]);
        });
    }

    // --- SHEET 2: GELİR TABLOSU (P&L) ---
    const sheetPnL = workbook.addWorksheet('Gelir Tablosu (P&L)');

    // Headers
    const pnlHeaders = ['Kalemler', ...Array.from({ length: 12 }, (_, i) => `${i + 1}. Ay`), 'TOPLAM'];
    const headerRow = sheetPnL.addRow(pnlHeaders);
    headerRow.font = headerFont;
    headerRow.fill = headerFill;

    // Data Rows helper
    const addRow = (title: string, dataKey: string, style: 'bold' | 'normal' = 'normal', indent = 0) => {
        const rowData: any[] = [
            ' '.repeat(indent) + title,
            ...model.monthly.map(m => {
                if (dataKey === 'revenue') return m.revenue;
                if (dataKey === 'cogs') return m.cogs;
                if (dataKey === 'grossProfit') return m.grossProfit;
                if (dataKey === 'expenses.personnel') return m.expenses.personnel;
                if (dataKey === 'expenses.marketing') return m.expenses.marketing;
                if (dataKey === 'expenses.fixed') return m.expenses.fixed;
                if (dataKey === 'ebitda') return m.ebitda;
                if (dataKey === 'netIncome') return m.netIncome;
                return 0;
            })
        ];
        // Total Calculation
        const total = rowData.slice(1).reduce((a: number, b: number) => a + b, 0);
        rowData.push(total);

        const row = sheetPnL.addRow(rowData);
        if (style === 'bold') row.font = { bold: true };

        // Formatting
        for (let i = 2; i <= 14; i++) {
            row.getCell(i).numFmt = '#,##0';
        }
    };

    addRow('GELİRLER', 'revenue', 'bold');
    addRow('Satışların Maliyeti (COGS)', 'cogs', 'normal', 2);
    addRow('BRÜT KÂR', 'grossProfit', 'bold');

    sheetPnL.addRow([]);

    addRow('FAALİYET GİDERLERİ', '', 'bold');
    addRow('Personel Giderleri', 'expenses.personnel', 'normal', 2);
    addRow('Pazarlama Giderleri', 'expenses.marketing', 'normal', 2);
    addRow('Sabit Giderler', 'expenses.fixed', 'normal', 2);

    sheetPnL.addRow([]);

    addRow('EBITDA (FAVÖK)', 'ebitda', 'bold');
    addRow('NET KÂR', 'netIncome', 'bold');

    sheetPnL.columns.forEach(column => { column.width = 15; });
    sheetPnL.getColumn(1).width = 35;

    // --- SHEET 3: NAKİT AKIŞI ---
    const sheetCash = workbook.addWorksheet('Nakit Akışı');
    const cashHeaderRow = sheetCash.addRow(pnlHeaders);
    cashHeaderRow.font = headerFont;
    cashHeaderRow.fill = headerFill;

    const addCashRow = (title: string, key: string, isBalance = false) => {
        const rowData = [
            title,
            ...model.monthly.map(m => {
                // @ts-ignore
                return m.cashFlow[key] || 0;
            }),
            0
        ];
        // Balance is not summed up, it's the last month's value for the "Total" column (or N/A)
        if (isBalance) {
            rowData[13] = rowData[12]; // Last month balance
        } else {
            rowData[13] = rowData.slice(1, 13).reduce((a: number, b: number) => a + b, 0);
        }

        const row = sheetCash.addRow(rowData);
        for (let i = 2; i <= 14; i++) {
            row.getCell(i).numFmt = '#,##0';
        }
        if (isBalance) row.font = { bold: true };
    }

    addCashRow('Nakit Girişi', 'inflow');
    addCashRow('Nakit Çıkışı', 'outflow');
    addCashRow('Net Nakit Akışı', 'net');
    addCashRow('KASA BAKİYESİ', 'endingBalance', true);

    sheetCash.columns.forEach(column => { column.width = 15; });
    sheetCash.getColumn(1).width = 35;

    // --- SHEET 4: VARSAYIMLAR ---
    const sheetAssumptions = workbook.addWorksheet('Varsayımlar');
    sheetAssumptions.addRow(['Parametre', 'Değer']);
    sheetAssumptions.getRow(1).font = { bold: true };

    sheetAssumptions.addRow(['İş Fikri', input.businessName]);
    sheetAssumptions.addRow(['Sektör', input.sector]);
    sheetAssumptions.addRow(['Gelir Modeli', input.revenueModel]);
    sheetAssumptions.addRow(['Başlangıç Müşteri', input.growth.initialCustomers]);
    sheetAssumptions.addRow(['Aylık Büyüme', `%${(input.growth.monthlyGrowthRate * 100).toFixed(1)}`]);
    sheetAssumptions.addRow(['Asgari Ücret (Net 2025)', TR_CONSTANTS_2025.MIN_WAGE_NET]);
    sheetAssumptions.addRow(['Asgari Ücret (Brüt 2025)', TR_CONSTANTS_2025.MIN_WAGE_GROSS]);

    sheetAssumptions.getColumn(1).width = 30;
    sheetAssumptions.getColumn(2).width = 30;

    const buffer = await workbook.xlsx.writeBuffer();
    // @ts-ignore - writeBuffer returns ArrayBuffer, node buffer expects Buffer
    return Buffer.from(buffer);
}
