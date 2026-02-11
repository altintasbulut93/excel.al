import { NextRequest, NextResponse } from 'next/server';
import { createPDFReport } from '@/lib/pdf-generator';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const pdf = createPDFReport(data);
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="finansal-model-${data.businessName.replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('PDF generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
