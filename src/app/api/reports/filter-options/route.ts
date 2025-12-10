import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Obtener proveedores únicos de las licencias
        const providers = await prisma.license.findMany({
            select: {
                provider: true
            },
            distinct: ['provider'],
            orderBy: {
                provider: 'asc'
            }
        });

        // Obtener departamentos desde la tabla Department
        const departments = await prisma.department.findMany({
            where: {
                active: true
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Calcular estados dinámicos basados en las licencias
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

        const [activeCount, inactiveCount, expiringCount] = await Promise.all([
            prisma.license.count({
                where: {
                    active: true
                }
            }),
            prisma.license.count({
                where: {
                    active: false
                }
            }),
            prisma.license.count({
                where: {
                    active: true,
                    expiration: {
                        lte: thirtyDaysFromNow,
                        gte: now
                    }
                }
            })
        ]);

        return NextResponse.json({
            providers: providers.map(p => p.provider),
            departments: departments.map(d => ({ id: d.id, name: d.name })),
            statusOptions: [
                { value: 'active', label: 'Activas', count: activeCount },
                { value: 'inactive', label: 'Inactivas', count: inactiveCount },
                { value: 'expiring', label: 'Próximas a vencer', count: expiringCount }
            ]
        });

    } catch (error) {
        console.error('Error al obtener opciones de filtros:', error);
        return NextResponse.json(
            { error: 'Error al obtener opciones de filtros' },
            { status: 500 }
        );
    }
}