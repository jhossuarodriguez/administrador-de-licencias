import 'server-only';
import { prisma } from '@/lib/prisma';
import { serializeForClient } from './serialize';
import type { Department } from '@/types/department';

export async function getDepartments(activeOnly = false): Promise<Department[]> {
    const where = activeOnly ? { active: true } : {};
    const raw = await prisma.department.findMany({
        where,
        include: {
            _count: {
                select: { users: true, licenses: true },
            },
        },
        orderBy: { name: 'asc' },
    });
    return serializeForClient(raw) as Department[];
}
