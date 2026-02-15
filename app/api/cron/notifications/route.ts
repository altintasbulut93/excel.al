
import { type NextRequest, NextResponse } from 'next/server';
import { NotificationEngine } from '@/lib/notifications/engine';

// This is a simplified protection. In prod, verify 'Authorization: Bearer <CRON_SECRET>'
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    // Allow if Header matches OR query param matches (easier for manual testing)
    const isAuthHeaderValid = authHeader === `Bearer ${CRON_SECRET}`;
    const { searchParams } = new URL(request.url);
    const isQueryParamValid = searchParams.get('key') === CRON_SECRET;

    if (!isAuthHeaderValid && !isQueryParamValid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const engine = new NotificationEngine();
        const result = await engine.processAll();

        return NextResponse.json(result);
    } catch (error) {
        console.error("Cron Job Failed:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
