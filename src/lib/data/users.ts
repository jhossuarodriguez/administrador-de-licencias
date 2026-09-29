import 'server-only';
import { prisma } from '@/lib/prisma';
import { serializeForClient } from './serialize';
import type { User } from '@/types/user';

export async function getUsers(): Promise<User[]> {
    const raw = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            username: true,
            status: true,
            departmentId: true,
            department: {
                select: { id: true, name: true, description: true },
            },
            Assignment: {
                select: {
                    id: true,
                    license: {
                        select: { id: true, provider: true, model: true },
                    },
                },
            },
        },
    });
    return serializeForClient(raw) as User[];
}
