
import { NextRequest, NextResponse } from 'next/server';
import { analyzeBusinessIdea } from '@/lib/ai/analyzer';

export async function POST(req: NextRequest) {
    try {
        const { idea } = await req.json();

        if (!idea || idea.length < 5) {
            return NextResponse.json({ error: 'Lütfen daha detaylı bir iş fikri girin.' }, { status: 400 });
        }

        const analysis = await analyzeBusinessIdea(idea);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'AI servisi şu an kullanılamıyor.' }, { status: 500 });
    }
}
