import 'server-only';
import { prisma } from '@/lib/prisma';
import type { Sede } from '@/types/sede';

export async function getSedes(activeOnly = false): Promise<Sede[]> {
    const where = activeOnly ? { active: true } : {};

    const [sedes, licenseCounts] = await Promise.all([
        prisma.sede.findMany({
            where,
            orderBy: { name: 'asc' },
        }),
        prisma.license.groupBy({
            by: ['sede'],
            where: { sede: { not: null } },
            _count: { _all: true },
        }),
    ]);

    const countByName = new Map(
        licenseCounts.flatMap(({ sede, _count }) =>
            sede ? [[sede, _count._all] as const] : [],
        ),
    );

    return sedes.map((sede) => ({
        ...sede,
        createdAt: sede.createdAt.toISOString(),
        updatedAt: sede.updatedAt.toISOString(),
        _count: { licenses: countByName.get(sede.name) ?? 0 },
    }));
}
