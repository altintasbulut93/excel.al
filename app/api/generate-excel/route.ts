
import { NextRequest, NextResponse } from 'next/server';
import { createExcelFile } from '@/lib/excel-generator';
import { FinancialInput } from '@/lib/engine/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const input: FinancialInput = body; // Validate with Zod ideally

        const buffer = await createExcelFile(input);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="finansal-model-${Date.now()}.xlsx"`,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Excel generation failed' }, { status: 500 });
    }
}
