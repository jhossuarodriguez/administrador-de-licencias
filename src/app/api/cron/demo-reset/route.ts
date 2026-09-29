import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDemoMode } from '@/lib/demo';
import { resetDemoData } from '@/lib/demoData';

export const maxDuration = 60;

// Vercel Cron la llama una vez al día (vercel.json) con "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: Request) {
    if (!isDemoMode()) {
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        await resetDemoData(prisma);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al reiniciar el demo:', error);
        return NextResponse.json({ error: 'Error al reiniciar el demo' }, { status: 500 });
    }
}
