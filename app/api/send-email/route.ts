
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createExcelFile } from '@/lib/excel-generator';
import { FinancialInput } from '@/lib/engine/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email, data } = await req.json();

        if (!email || !data) {
            return NextResponse.json({ error: 'Email and data required' }, { status: 400 });
        }

        // Generate the Excel file buffer
        const buffer = await createExcelFile(data as FinancialInput);

        const { data: emailData, error } = await resend.emails.send({
            from: 'Excel.al <onboarding@resend.dev>', // Free tier must use this or verified domain
            to: [email],
            subject: `Finansal Modeliniz Hazır: ${data.businessName}`,
            html: `
        <h1>Merhaba,</h1>
        <p><strong>${data.businessName}</strong> projesi için hazırladığınız finansal model ektedir.</p>
        <p>Bu dosya Excel.al yapay zeka motoru tarafından oluşturulmuştur.</p>
        <br/>
        <p>Saygılarımızla,<br/>Excel.al Ekibi</p>
      `,
            attachments: [
                {
                    filename: `finansal-model-${data.businessName.replace(/\s+/g, '_')}.xlsx`,
                    content: buffer,
                },
            ],
        });

        if (error) {
            console.error(error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: emailData?.id });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
