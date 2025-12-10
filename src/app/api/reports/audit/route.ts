import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // 1. Historial de asignaciones
        const assignmentHistory = await prisma.assignment.findMany({
            where: {
                assignedAt: {
                    gte: startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                    lte: endDate ? new Date(endDate) : new Date()
                }
            },
            include: {
                user: true,
                license: true
            },
            orderBy: {
                assignedAt: 'desc'
            },
            take: 100
        });

        // 2. Actividad por usuario (últimos 30 días)
        const userActivity = await prisma.assignment.groupBy({
            by: ['userId'],
            where: {
                assignedAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        // Obtener información de usuarios para la actividad
        const userIds = userActivity.map(ua => ua.userId);
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            }
        });

        const userActivityWithDetails = userActivity.map(ua => {
            const user = users.find(u => u.id === ua.userId);
            return {
                ...ua,
                user
            };
        });

        // 3. Cambios en licencias (simulado - podrías implementar un log real)
        const licenseChanges = await prisma.license.findMany({
            where: {
                updatedAt: {
                    gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    lte: endDate ? new Date(endDate) : new Date()
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 50
        });

        // 4. Análisis de cumplimiento
        const overAllocatedLicenses = await prisma.$queryRaw<{ count: number }[]>`
            SELECT COUNT(*) as count FROM "License" 
            WHERE "usedLicense" > "totalLicense" AND "active" = true
        `;

        const underUtilizedLicenses = await prisma.$queryRaw<{ count: number }[]>`
            SELECT COUNT(*) as count FROM "License" 
            WHERE "usedLicense" < ("totalLicense" * 0.5) AND "totalLicense" > 0 AND "active" = true
        `;

        const complianceAnalysis = {
            overAllocated: Number(overAllocatedLicenses[0]?.count || 0),
            underUtilized: Number(underUtilizedLicenses[0]?.count || 0),
            expiredActive: await prisma.license.count({
                where: {
                    active: true,
                    expiration: {
                        lt: new Date()
                    }
                }
            }),
            totalActive: await prisma.license.count({
                where: {
                    active: true
                }
            })
        };

        // 5. Resumen de accesos por departamento
        const departmentAccessGrouped = await prisma.license.groupBy({
            by: ['departmentId'],
            where: {
                departmentId: {
                    not: null
                },
                Assignment: {
                    some: {
                        assignedAt: {
                            gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                }
            },
            _count: {
                id: true
            }
        });

        // Enriquecer con nombres de departamento
        const deptIds = departmentAccessGrouped.map(d => d.departmentId).filter(Boolean) as number[];
        const departments = await prisma.department.findMany({
            where: { id: { in: deptIds } },
            select: { id: true, name: true }
        });
        const deptMap = new Map(departments.map(d => [d.id, d.name]));

        const departmentAccess = departmentAccessGrouped.map(dept => ({
            departmentId: dept.departmentId,
            departmentName: dept.departmentId ? deptMap.get(dept.departmentId) || 'Sin nombre' : 'Sin departamento',
            _count: dept._count
        }));

        const response = {
            assignmentHistory,
            userActivity: userActivityWithDetails,
            licenseChanges,
            complianceAnalysis: {
                ...complianceAnalysis,
                complianceScore: complianceAnalysis.totalActive > 0
                    ? Math.round(((complianceAnalysis.totalActive - complianceAnalysis.overAllocated - complianceAnalysis.expiredActive) / complianceAnalysis.totalActive) * 100)
                    : 100
            },
            departmentAccess
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("Error al obtener reportes de auditoría:", error);
        return NextResponse.json(
            { error: "Error al obtener reportes de auditoría" },
            { status: 500 }
        );
    }
}