import { FinancialInput } from './engine/types';
import ExcelJS from 'exceljs';
import { generateFinancialModel } from './engine/financials';
import { getExcelTranslations } from './excel-translations';

const getCountryData = (country: string = 'Turkey') => {
    const data: Record<string, { tax: number, benefit: number, symbol: string, currency: string }> = {
        'Turkey': { tax: 0.25, benefit: 0.225, symbol: '₺', currency: 'TRY' },
        'United Kingdom': { tax: 0.25, benefit: 0.138, symbol: '£', currency: 'GBP' },
        'USA': { tax: 0.21, benefit: 0.15, symbol: '$', currency: 'USD' },
        'Germany': { tax: 0.30, benefit: 0.20, symbol: '€', currency: 'EUR' },
        'France': { tax: 0.25, benefit: 0.45, symbol: '€', currency: 'EUR' },
        'Saudi Arabia': { tax: 0.20, benefit: 0.12, symbol: '﷼', currency: 'SAR' },
        'United Arab Emirates': { tax: 0.09, benefit: 0.0, symbol: 'د.إ', currency: 'AED' }
    };
    return data[country] || data['Turkey'];
};

export async function createExcelFile(input: FinancialInput): Promise<Buffer> {
    const lang = input.language || 'en';
    const isRTL = lang === 'ar';
    const t = getExcelTranslations(lang);

    // Country & Currency Logic
    const countryInfo = getCountryData(input.country || 'Turkey');
    const activeCurrency = input.pricing?.currency || input.currency || countryInfo.currency;

    let currencySymbol = countryInfo.symbol;
    if (activeCurrency === 'USD') currencySymbol = '$';
    else if (activeCurrency === 'EUR') currencySymbol = '€';
    else if (activeCurrency === 'GBP') currencySymbol = '£';
    else if (activeCurrency === 'TRY') currencySymbol = '₺';

    const currencyFmtFull = `#,##0 "${currencySymbol}"`;
    const percentFmtFull = '0.0%';

    // Override parameters based on country if not provided
    if (input.parameters) {
        if (!input.parameters.taxRate) input.parameters.taxRate = countryInfo.tax;
    }

    const model = generateFinancialModel(input);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'excel.al';
    workbook.lastModifiedBy = 'excel.al';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ==========================================
    // STYLING PRESETS
    // ==========================================
    const primaryColor = 'FF2D3748';
    const accentColor = 'FF3B82F6';
    const successColor = 'FF10B981';
    const warningColor = 'FFF59E0B';
    const dangerColor = 'FFEF4444';

    const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } },
        alignment: { horizontal: 'center', vertical: 'middle', readingOrder: isRTL ? 'rtl' : 'ltr' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    const subHeaderStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } },
        alignment: { horizontal: isRTL ? 'right' : 'left', readingOrder: isRTL ? 'rtl' : 'ltr' },
        border: { bottom: { style: 'thin' } }
    };

    const cellStyle: Partial<ExcelJS.Alignment> = {
        horizontal: isRTL ? 'right' : 'left',
        readingOrder: isRTL ? 'rtl' : 'ltr'
    };



    // ==========================================
    // 1. PARAMETERS SHEET
    // ==========================================
    const sheetParams = workbook.addWorksheet(t.sheets.params, {
        properties: { tabColor: { argb: 'FF64748B' } },
        views: [{ rightToLeft: isRTL, state: 'frozen', ySplit: 1 }]
    });

    sheetParams.columns = [
        { header: t.cols.category, key: 'cat', width: 20 },
        { header: t.cols.variable, key: 'name', width: 40 },
        { header: t.cols.value, key: 'value', width: 20 },
        { header: t.cols.unit, key: 'unit', width: 15 },
        { header: t.cols.desc, key: 'desc', width: 50 }
    ];

    sheetParams.getRow(1).eachCell(c => Object.assign(c, headerStyle));

    const paramsData = [
        { cat: t.params.financial, name: t.params.initial_investment, value: input.startingCapital, unit: input.currency || countryInfo.currency },
        { cat: t.params.financial, name: t.params.tax_rate, value: input.parameters?.taxRate || countryInfo.tax, unit: '%' },
        { cat: t.params.financial, name: `${input.country || 'Turkey'} Benefit Rate`, value: countryInfo.benefit, unit: '%' },
        { cat: t.params.financial, name: 'USD rate', value: input.parameters?.usdRate || 34.5, unit: 'TRY' },
        { cat: t.params.scenario, name: t.params.optimistic, value: 1.25, unit: 'x' },
        { cat: t.params.scenario, name: t.params.base, value: 1.0, unit: 'x' },
        { cat: t.params.scenario, name: t.params.pessimistic, value: 0.70, unit: 'x' },
        { cat: t.params.valuation, name: 'ARR Multiple', value: 8, unit: 'x' },
        { cat: t.params.valuation, name: 'Churn Rate', value: input.growth.churnRate || 0.05, unit: '%' }
    ];

    paramsData.forEach((row) => {
        const r = sheetParams.addRow(row);
        r.eachCell(c => c.alignment = cellStyle);
        const valCell = r.getCell(3);
        if (row.unit === '%') valCell.numFmt = percentFmtFull;
        else if (row.unit === 'x') valCell.numFmt = '0.0"x"';
        else valCell.numFmt = currencyFmtFull;
    });

    // ==========================================
    // 2. MARKETING PLAN
    // ==========================================
    const sheetMkt = workbook.addWorksheet(t.sheets.marketing, {
        properties: { tabColor: { argb: 'FFF59E0B' } },
        views: [{ rightToLeft: isRTL, state: 'frozen', xSplit: 1, ySplit: 1 }]
    });

    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}. ${t.cols.month}`);
    sheetMkt.addRow([t.cols.metric, ...months, t.cols.total]);
    sheetMkt.getRow(1).eachCell(c => Object.assign(c, headerStyle));

    // Marketing Logic from GTM or Default
    const gtm = input.gtm;
    const baseCPL = gtm ? (gtm.channels.reduce((acc, c) => acc + c.monthlyBudget, 0) / (gtm.channels.reduce((acc, c) => acc + (c.monthlyBudget / c.cpc) * c.conversionVisitorToLead, 0))) : 150;
    const baseBudget = input.marketing.type === 'fixed' ? input.marketing.value : (input.startingCapital * 0.1);

    // Budget Row
    sheetMkt.addRow([t.marketing.budget]);
    const budgetRow = sheetMkt.lastRow!;
    budgetRow.getCell(1).font = { bold: true };
    for (let i = 1; i <= 12; i++) {
        // Linear increase in budget logic
        const val = baseBudget * (1 + (i - 1) * 0.15);
        budgetRow.getCell(i + 1).value = Math.round(val);
        budgetRow.getCell(i + 1).numFmt = currencyFmtFull;
    }
    budgetRow.getCell(14).value = { formula: `SUM(B${budgetRow.number}:M${budgetRow.number})` };
    budgetRow.getCell(14).numFmt = currencyFmtFull;

    // CPL Row
    sheetMkt.addRow([t.marketing.cpl]);
    const cplRow = sheetMkt.lastRow!;
    for (let i = 1; i <= 12; i++) {
        cplRow.getCell(i + 1).value = Math.round(baseCPL);
        cplRow.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // Lead Count
    sheetMkt.addRow([t.marketing.leads]);
    const leadRow = sheetMkt.lastRow!;
    for (let i = 1; i <= 12; i++) {
        const b = budgetRow.getCell(i + 1).address;
        const c = cplRow.getCell(i + 1).address;
        leadRow.getCell(i + 1).value = { formula: `IF(${c}>0, ROUND(${b}/${c}, 0), 0)` };
    }
    leadRow.getCell(14).value = { formula: `SUM(B${leadRow.number}:M${leadRow.number})` };

    // Conversion
    sheetMkt.addRow([t.marketing.conversion]);
    const convRow = sheetMkt.lastRow!;
    const conversionRate = gtm ? (gtm.funnel.leadToSQL * gtm.funnel.sqlToDeal) : 0.05;
    for (let i = 1; i <= 12; i++) {
        convRow.getCell(i + 1).value = conversionRate;
        convRow.getCell(i + 1).numFmt = percentFmtFull;
    }

    // New Customers
    sheetMkt.addRow([t.marketing.new_customers]);
    const newCustRow = sheetMkt.lastRow!;
    newCustRow.font = { bold: true, color: { argb: successColor.slice(2) } };
    for (let i = 1; i <= 12; i++) {
        const l = leadRow.getCell(i + 1).address;
        const cv = convRow.getCell(i + 1).address;
        newCustRow.getCell(i + 1).value = { formula: `ROUND(${l}*${cv}, 0)` };
    }
    newCustRow.getCell(14).value = { formula: `SUM(B${newCustRow.number}:M${newCustRow.number})` };

    // CAC
    sheetMkt.addRow([t.marketing.cac]);
    const cacRow = sheetMkt.lastRow!;
    for (let i = 1; i <= 12; i++) {
        const b = budgetRow.getCell(i + 1).address;
        const nc = newCustRow.getCell(i + 1).address;
        cacRow.getCell(i + 1).value = { formula: `IF(${nc}>0, ${b}/${nc}, 0)` };
        cacRow.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // SDR Need
    sheetMkt.addRow([t.marketing.sdr_need]);
    const sdrNeedRow = sheetMkt.lastRow!;
    const sdrCap = gtm?.capacity.leadsPerRep || 50;
    for (let i = 1; i <= 12; i++) {
        const nc = newCustRow.getCell(i + 1).address;
        sdrNeedRow.getCell(i + 1).value = { formula: `ROUNDUP(${nc}/${sdrCap}, 0)` };
    }


    // ==========================================
    // 3. HUMAN RESOURCES (HR)
    // ==========================================
    const sheetHR = workbook.addWorksheet(t.sheets.hr, {
        properties: { tabColor: { argb: 'FF06B6D4' } },
        views: [{ rightToLeft: isRTL, state: 'frozen', xSplit: 1, ySplit: 1 }]
    });

    const hrHeaders = [t.hr.title, ...months, t.cols.total];
    sheetHR.addRow(hrHeaders);
    sheetHR.getRow(1).eachCell(c => Object.assign(c, headerStyle));

    // Dynamic Team Mapping
    const team = input.team && input.team.length > 0 ? input.team : [
        { id: '1', role: t.hr.founders, count: 2, salary: 0, isNetSalary: false },
        { id: '2', role: t.hr.developers, count: 2, salary: 85000, isNetSalary: false },
        { id: '3', role: t.hr.sales, count: 0, salary: 40000, isNetSalary: false } // SDR will be linked
    ];

    let hrCostRows: number[] = [];

    team.forEach((member) => {
        const isSDR = member.role.toLowerCase().includes('sdr') || member.role.toLowerCase().includes('satış');

        sheetHR.addRow([member.role]);
        const titleRow = sheetHR.lastRow!;
        titleRow.font = { bold: true };
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

        sheetHR.addRow([`  → ${t.hr.count}`]);
        const countRow = sheetHR.lastRow!;

        sheetHR.addRow([`  → ${t.hr.salary}`]);
        const salRow = sheetHR.lastRow!;

        sheetHR.addRow([`  → ${t.hr.cost}`]);
        const costRow = sheetHR.lastRow!;
        hrCostRows.push(costRow.number);

        for (let i = 1; i <= 12; i++) {
            const currentMonth = i;
            const startMonth = member.startMonth || 1;

            // Headcount Logic: 0 before start month
            let activeCount = member.count;
            if (currentMonth < startMonth) {
                activeCount = 0;
            }

            countRow.getCell(i + 1).value = activeCount;

            salRow.getCell(i + 1).value = member.salary; // Salary is constant
            salRow.getCell(i + 1).numFmt = currencyFmtFull;

            costRow.getCell(i + 1).value = { formula: `${countRow.getCell(i + 1).address}*${salRow.getCell(i + 1).address}*1.45` }; // Tax Burden simplified
            costRow.getCell(i + 1).numFmt = currencyFmtFull;

            if (activeCount === 0) {
                costRow.getCell(i + 1).font = { color: { argb: 'FFCBD5E1' } }; // Gray out
            }
        }
        // Row Totals
        costRow.getCell(14).value = { formula: `SUM(B${costRow.number}:M${costRow.number})` };
        costRow.getCell(14).numFmt = currencyFmtFull;
    });



    // Total HR Row
    sheetHR.addRow([t.hr.total]);
    const totalHRRow = sheetHR.lastRow!;
    totalHRRow.font = { bold: true };
    totalHRRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
    for (let i = 1; i <= 12; i++) {
        const colLet = String.fromCharCode(65 + i);
        const formula = hrCostRows.map(r => `${colLet}${r}`).join('+');
        totalHRRow.getCell(i + 1).value = { formula };
        totalHRRow.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // ==========================================
    // 4. REVENUE SCENARIOS
    // ==========================================
    const sheetRev = workbook.addWorksheet(t.sheets.revenue, {
        properties: { tabColor: { argb: 'FF22C55E' } },
        views: [{ rightToLeft: isRTL, state: 'frozen', xSplit: 1, ySplit: 2 }]
    });

    // Merge for Scenario Titles
    sheetRev.mergeCells('A1:H1');
    sheetRev.mergeCells('J1:Q1');
    sheetRev.mergeCells('S1:Z1');

    const scLabelRow = sheetRev.getRow(1);
    scLabelRow.getCell(1).value = t.revenue.optimistic;
    scLabelRow.getCell(10).value = t.revenue.base;
    scLabelRow.getCell(19).value = t.revenue.pessimistic;

    [1, 10, 19].forEach(c => {
        Object.assign(scLabelRow.getCell(c), headerStyle);
        scLabelRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c === 1 ? 'FF15803D' : c === 10 ? 'FFB45309' : 'FFB91C1C' } };
    });

    // Sub Headers
    const revSubHeaders = [t.cols.month, t.revenue.starter, t.revenue.pro, t.revenue.enterprise, t.revenue.setup, t.revenue.training, t.revenue.total_count, t.revenue.total_revenue];
    const subRow = sheetRev.getRow(2);
    [1, 10, 19].forEach(start => {
        revSubHeaders.forEach((h, idx) => {
            const cell = subRow.getCell(start + idx);
            cell.value = h;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        });
    });

    // Data Rows (18 Months)
    const baseRevItems = input.revenueItems && input.revenueItems.length > 0 ? input.revenueItems : [
        { name: 'Starter', price: 1000, initialCustomers: 10, monthlyGrowthRate: 0.15 },
        { name: 'Pro', price: 2500, initialCustomers: 5, monthlyGrowthRate: 0.10 },
        { name: 'Enterprise', price: 10000, initialCustomers: 1, monthlyGrowthRate: 0.05 }
    ];

    const revAddresses: { [key: string]: string[] } = { best: [], base: [], worst: [] };

    for (let i = 0; i < 18; i++) {
        const row = sheetRev.getRow(3 + i);
        const mLabel = `${i + 1}. ${t.cols.month}`;

        const fillScenario = (startCol: number, coefAddr: string, type: string) => {
            row.getCell(startCol).value = mLabel;

            let rowRevParts: string[] = [];
            let rowCountParts: string[] = [];

            baseRevItems.forEach((item, idx) => {
                const vol = Math.round(item.initialCustomers * Math.pow(1 + item.monthlyGrowthRate, i));
                const cell = row.getCell(startCol + 1 + idx);
                cell.value = { formula: `ROUND(${vol}*${coefAddr}, 0)` };
                rowCountParts.push(cell.address);
                rowRevParts.push(`${cell.address}*${item.price}`);
            });

            // Total Count
            row.getCell(startCol + 6).value = { formula: `SUM(${rowCountParts.join(',')})` };

            // Total Revenue
            const trCell = row.getCell(startCol + 7);
            trCell.value = { formula: rowRevParts.join('+') };
            trCell.numFmt = currencyFmtFull;
            trCell.font = { bold: true };

            if (i < 12) revAddresses[type].push(trCell.address);
        };

        fillScenario(1, 'Parametreler!$C$7', 'best');
        fillScenario(10, 'Parametreler!$C$8', 'base');
        fillScenario(19, 'Parametreler!$C$9', 'worst');
    }

    // Adjust Widths
    sheetRev.columns.forEach(c => c.width = 12);
    // Spacers
    sheetRev.getColumn(9).width = 2; // I
    sheetRev.getColumn(18).width = 2; // R


    // ==========================================
    // 5. PROFIT & LOSS (P&L)
    // ==========================================
    const sheetPL = workbook.addWorksheet(t.sheets.pl, {
        properties: { tabColor: { argb: 'FF3B82F6' } },
        views: [{ rightToLeft: isRTL, state: 'frozen', xSplit: 1, ySplit: 1 }]
    });

    sheetPL.addRow([t.cols.metric, ...months, t.cols.total]);
    sheetPL.getRow(1).eachCell(c => Object.assign(c, headerStyle));

    // A. Revenue
    sheetPL.addRow([t.pl.revenue]);
    const plRev = sheetPL.lastRow!;
    plRev.font = { bold: true };
    for (let i = 1; i <= 12; i++) {
        plRev.getCell(i + 1).value = { formula: `\'${t.sheets.revenue}\'!${revAddresses.base[i - 1]}` };
        plRev.getCell(i + 1).numFmt = currencyFmtFull;
    }
    plRev.getCell(14).value = { formula: `SUM(B${plRev.number}:M${plRev.number})` };
    plRev.getCell(14).numFmt = currencyFmtFull;

    // B. Expenses
    sheetPL.addRow([t.pl.expenses]);
    sheetPL.lastRow!.font = { bold: true };

    // Marketing Expense
    sheetPL.addRow([t.pl.marketing_exp]);
    const plMkt = sheetPL.lastRow!;
    for (let i = 1; i <= 12; i++) {
        plMkt.getCell(i + 1).value = { formula: `\'${t.sheets.marketing}\'!${budgetRow.getCell(i + 1).address}` };
        plMkt.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // Personnel Expense
    sheetPL.addRow([t.pl.personnel_exp]);
    const plHr = sheetPL.lastRow!;
    for (let i = 1; i <= 12; i++) {
        plHr.getCell(i + 1).value = { formula: `\'${t.sheets.hr}\'!${totalHRRow.getCell(i + 1).address}` };
        plHr.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // Server & COGS (%10 dynamic)
    sheetPL.addRow([t.pl.infra_exp]);
    const plCogs = sheetPL.lastRow!;
    const cogsRate = input.cogsRate || 0.10;
    for (let i = 1; i <= 12; i++) {
        const rAddr = plRev.getCell(i + 1).address;
        plCogs.getCell(i + 1).value = { formula: `${rAddr}*${cogsRate}` };
        plCogs.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // General & Admin (input.fixedExpenses)
    sheetPL.addRow([t.pl.gen_admin]);
    const plGen = sheetPL.lastRow!;
    const totalFixed = input.fixedExpenses.reduce((acc, e) => acc + e.amount, 0) || 15000;
    for (let i = 1; i <= 12; i++) {
        plGen.getCell(i + 1).value = totalFixed;
        plGen.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // EBITDA
    sheetPL.addRow([t.pl.ebitda]);
    const plEbitda = sheetPL.lastRow!;
    plEbitda.font = { bold: true };
    plEbitda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };
    for (let i = 1; i <= 12; i++) {
        const col = i + 1;
        const r = plRev.getCell(col).address;
        const e1 = plMkt.getCell(col).address;
        const e2 = plHr.getCell(col).address;
        const e3 = plCogs.getCell(col).address;
        const e4 = plGen.getCell(col).address;
        plEbitda.getCell(col).value = { formula: `${r}-(${e1}+${e2}+${e3}+${e4})` };
        plEbitda.getCell(col).numFmt = currencyFmtFull;
    }

    // Tax
    sheetPL.addRow([t.pl.tax]);
    const plTax = sheetPL.lastRow!;
    const tRate = input.parameters?.taxRate || 0.25;
    for (let i = 1; i <= 12; i++) {
        const eb = plEbitda.getCell(i + 1).address;
        plTax.getCell(i + 1).value = { formula: `IF(${eb}>0, ${eb}*${tRate}, 0)` };
        plTax.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // Net Income
    sheetPL.addRow([t.pl.net_income]);
    const plNet = sheetPL.lastRow!;
    plNet.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    plNet.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } };
    for (let i = 1; i <= 12; i++) {
        const eb = plEbitda.getCell(i + 1).address;
        const tx = plTax.getCell(i + 1).address;
        plNet.getCell(i + 1).value = { formula: `${eb}-${tx}` };
        plNet.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // ==========================================
    // 6. UNIT ECONOMICS
    // ==========================================
    const sheetUnit = workbook.addWorksheet(t.sheets.unit, {
        properties: { tabColor: { argb: 'FFA855F7' } },
        views: [{ rightToLeft: isRTL, state: 'frozen', xSplit: 1, ySplit: 1 }]
    });

    sheetUnit.addRow([t.cols.metric, ...months]);
    sheetUnit.getRow(1).eachCell(c => Object.assign(c, headerStyle));

    // CAC
    sheetUnit.addRow([t.unit.cac]);
    const uCac = sheetUnit.lastRow!;
    for (let i = 1; i <= 12; i++) {
        uCac.getCell(i + 1).value = { formula: `\'${t.sheets.marketing}\'!${cacRow.getCell(i + 1).address}` };
        uCac.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // ARPU & LTV (Simplified for Excel)
    const arpu = input.pricing.amount || 2500;
    const ltvVal = arpu * (1 / (input.growth.churnRate || 0.05));

    sheetUnit.addRow([t.unit.ltv]);
    const uLtv = sheetUnit.lastRow!;
    for (let i = 1; i <= 12; i++) {
        uLtv.getCell(i + 1).value = Math.round(ltvVal);
        uLtv.getCell(i + 1).numFmt = currencyFmtFull;
    }

    // Ratio
    sheetUnit.addRow([t.unit.ratio]);
    const uRatio = sheetUnit.lastRow!;
    uRatio.font = { bold: true };
    for (let i = 1; i <= 12; i++) {
        const l = uLtv.getCell(i + 1).address;
        const c = uCac.getCell(i + 1).address;
        uRatio.getCell(i + 1).value = { formula: `IF(${c}>0, ${l}/${c}, 0)` };
        uRatio.getCell(i + 1).numFmt = '0.0"x"';
    }

    // ROI
    sheetUnit.addRow([t.unit.roi]);
    const uRoi = sheetUnit.lastRow!;
    for (let i = 1; i <= 12; i++) {
        const r = uRatio.getCell(i + 1).address;
        uRoi.getCell(i + 1).value = { formula: `${r}-1` };
        uRoi.getCell(i + 1).numFmt = percentFmtFull;
    }

    // ==========================================
    // 7. INVESTOR ANALYSIS
    // ==========================================
    const sheetInv = workbook.addWorksheet(t.sheets.investor, {
        properties: { tabColor: { argb: 'FF0F172A' } },
        views: [{ rightToLeft: isRTL }]
    });
    sheetInv.getColumn(1).width = 45;
    sheetInv.getColumn(2).width = 25;

    sheetInv.addRow([t.investor.title, '']);
    sheetInv.getRow(1).eachCell(c => Object.assign(c, headerStyle));

    sheetInv.addRow(['']);

    // ARR Calculation (12. Ay Revenue * 12)
    const lastRevAddr = plRev.getCell(13).address;
    sheetInv.addRow([t.investor.arr, { formula: `\'${t.sheets.pl}\'!${lastRevAddr}*12` }]);
    const arrCell = sheetInv.lastRow!.getCell(2);
    arrCell.numFmt = currencyFmtFull;

    const arrMultiple = 8; // Pre-Seed standard
    sheetInv.addRow([t.investor.valuation, { formula: `${arrCell.address}*${arrMultiple}` }]);
    const entryValCell = sheetInv.lastRow!.getCell(2);
    entryValCell.numFmt = currencyFmtFull;
    entryValCell.font = { bold: true };

    sheetInv.addRow(['']);

    // Investment Ask
    sheetInv.addRow([t.investor.investment_ask, input.startingCapital]);
    const askCell = sheetInv.lastRow!.getCell(2);
    askCell.numFmt = currencyFmtFull;

    // Equity Share
    sheetInv.addRow([t.investor.investor_share, { formula: `${askCell.address}/(${entryValCell.address}+${askCell.address})` }]);
    const shareCell = sheetInv.lastRow!.getCell(2);
    shareCell.numFmt = percentFmtFull;

    sheetInv.addRow(['']);

    // Exit Analysis
    sheetInv.addRow([t.investor.exit_title]);
    sheetInv.lastRow!.eachCell(c => Object.assign(c, subHeaderStyle));

    // Year 5 Revenue (Conservative 5x Year 1 ARR)
    sheetInv.addRow([t.investor.year5_revenue, { formula: `${arrCell.address}*5` }]);
    const y5RevCell = sheetInv.lastRow!.getCell(2);
    y5RevCell.numFmt = currencyFmtFull;

    // Exit Valuation (5x Year 5 Revenue)
    sheetInv.addRow([t.investor.exit_valuation, { formula: `${y5RevCell.address}*5` }]);
    const exitValCell = sheetInv.lastRow!.getCell(2);
    exitValCell.numFmt = currencyFmtFull;

    // Investor Return
    sheetInv.addRow([t.investor.investor_return, { formula: `${exitValCell.address}*${shareCell.address}` }]);
    const returnCell = sheetInv.lastRow!.getCell(2);
    returnCell.numFmt = currencyFmtFull;
    returnCell.font = { bold: true, color: { argb: successColor.slice(2) } };

    // MOIC & IRR
    sheetInv.addRow([t.investor.moic, { formula: `${returnCell.address}/${askCell.address}` }]);
    sheetInv.lastRow!.getCell(2).numFmt = '0.0"x"';

    sheetInv.addRow([t.investor.irr, { formula: `(${returnCell.address}/${askCell.address})^(1/5)-1` }]);
    const irrCell = sheetInv.lastRow!.getCell(2);
    irrCell.numFmt = percentFmtFull;

    sheetInv.addRow(['']);
    sheetInv.addRow([t.investor.vc_check, { formula: `IF(${irrCell.address}>0.3, "YES ✅", "LOW ⚠️")` }]);
    sheetInv.lastRow!.getCell(2).font = { bold: true };

    sheetInv.columns.forEach(c => c.width = 35);
    sheetInv.getColumn(1).width = 50;

    const buffer = await workbook.xlsx.writeBuffer();
    // @ts-ignore
    return Buffer.from(buffer);
}
