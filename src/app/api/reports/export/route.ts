import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const format = searchParams.get('format') || 'json'; // json, csv, excel

        const where: Prisma.LicenseWhereInput = {};

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (format === 'csv') {
            // Datos para exportar en CSV
            const licenses = await prisma.license.findMany({
                where,
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    Assignment: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            // Convertir a CSV
            const csvHeaders = [
                'ID', 'Proveedor', 'Modelo', 'Plan', 'Sede', 'Departamento',
                'Fecha Inicio', 'Fecha Vencimiento', 'Licencias Totales', 'Licencias Usadas',
                'Costo Unitario', 'Costo Cuota', 'Ciclo Facturación', 'Estado', 'Usuarios Asignados'
            ].join(',');

            const csvRows = licenses.map(license => [
                license.id,
                license.provider,
                license.model || '',
                license.plan || '',
                license.sede || '',
                license.department?.name || 'Sin departamento',
                license.startDate?.toISOString().split('T')[0] || '',
                license.expiration?.toISOString().split('T')[0] || '',
                license.totalLicense,
                license.usedLicense,
                license.unitCost,
                license.installmentCost,
                license.billingCycle,
                license.active ? 'Activa' : 'Inactiva',
                license.Assignment.map(a => a.user.name).join('; ')
            ].map(field => `"${field}"`).join(','));

            const csvContent = [csvHeaders, ...csvRows].join('\n');

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="licencias_reporte_${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        // Resumen completo para exportación
        const exportData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                dateRange: {
                    start: startDate,
                    end: endDate
                },
                totalRecords: await prisma.license.count({ where })
            },

            // Resumen ejecutivo
            executiveSummary: {
                totalLicenses: await prisma.license.count({ where }),
                activeLicenses: await prisma.license.count({ where: { ...where, active: true } }),
                totalCost: await prisma.license.aggregate({
                    where: { ...where, active: true },
                    _sum: { unitCost: true }
                }),
                utilizationRate: await prisma.$queryRaw`
                    SELECT 
                        CASE 
                            WHEN SUM("totalLicense") > 0 
                            THEN ROUND((SUM("usedLicense")::decimal / SUM("totalLicense")::decimal) * 100, 2)
                            ELSE 0 
                        END as utilization_rate
                    FROM "License" 
                    WHERE "active" = true
                `
            },

            // Licencias detalladas
            licenses: await prisma.license.findMany({
                where,
                include: {
                    Assignment: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    department: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),

            // Análisis por proveedor
            providerAnalysis: await prisma.license.groupBy({
                by: ['provider'],
                where,
                _count: { id: true },
                _sum: {
                    totalLicense: true,
                    usedLicense: true,
                    unitCost: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                }
            }),

            // Análisis por departamento
            departmentAnalysis: await prisma.license.groupBy({
                by: ['departmentId'],
                where: {
                    ...where,
                    departmentId: { not: null }
                },
                _count: { id: true },
                _sum: {
                    totalLicense: true,
                    usedLicense: true,
                    unitCost: true
                }
            }),

            // Usuarios más activos
            activeUsers: await prisma.user.findMany({
                include: {
                    Assignment: {
                        include: {
                            license: {
                                select: {
                                    id: true,
                                    provider: true,
                                    model: true,
                                    unitCost: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    Assignment: {
                        _count: 'desc'
                    }
                },
                take: 20
            }),

            // Próximos vencimientos
            upcomingExpirations: await prisma.license.findMany({
                where: {
                    expiration: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // próximos 90 días
                    },
                    active: true
                },
                include: {
                    Assignment: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: { expiration: 'asc' }
            })
        };

        return NextResponse.json(exportData);

    } catch (error) {
        console.error("Error al exportar reportes:", error);
        return NextResponse.json(
            { error: "Error al exportar reportes" },
            { status: 500 }
        );
    }
}