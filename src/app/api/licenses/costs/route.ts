import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const licenses = await prisma.license.findMany({
            select: {
                id: true,
                provider: true,
                unitCost: true,
                installmentCost: true,
                penaltyCost: true,
                billingCycle: true
            },
            orderBy: { createdAt: 'desc' }

        })
        return NextResponse.json(licenses)
    } catch (err) {
        console.error("Error al obtener los costos", err)
        return NextResponse.json(
            { error: 'Error al obtener costos' },
            { status: 500 }
        )
    }
}