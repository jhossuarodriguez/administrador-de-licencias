import 'server-only';
import { prisma } from '@/lib/prisma';
import { serializeForClient } from './serialize';
import type { License, LicenseCost } from '@/types/license';

export async function getLicenses(): Promise<License[]> {
    const raw = await prisma.license.findMany({
        include: {
            department: {
                select: { id: true, name: true, description: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return serializeForClient(raw) as License[];
}

export async function getLicenseCosts(): Promise<LicenseCost[]> {
    const raw = await prisma.license.findMany({
        select: {
            id: true,
            provider: true,
            unitCost: true,
            installmentCost: true,
            penaltyCost: true,
            currency: true,
            billingCycle: true,
            model: true,
            totalLicense: true
        },
        orderBy: { createdAt: 'desc' },
    });
    return serializeForClient(raw) as LicenseCost[];
}
