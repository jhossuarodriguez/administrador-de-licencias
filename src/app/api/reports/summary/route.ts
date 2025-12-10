import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { convertBigIntToNumber } from '@/lib/utils';
import { MonthlyTrendQueryResult } from '@/types';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const provider = searchParams.get('provider');
        const department = searchParams.get('department');

        // Construir filtros dinámicos
        const where: Prisma.LicenseWhereInput = {};

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (provider) {
            where.provider = provider;
        }

        if (department) {
            where.departmentId = parseInt(department);
        }

        // 1. Resumen de licencias por estado
        const licensesSummary = await prisma.license.groupBy({
            by: ['active'],
            where,
            _count: {
                id: true
            },
            _sum: {
                totalLicense: true,
                usedLicense: true,
                unitCost: true,
                installmentCost: true
            }
        });

        // 2. Licencias por proveedor
        const licensesByProvider = await prisma.license.groupBy({
            by: ['provider'],
            where,
            _count: {
                id: true
            },
            _sum: {
                totalLicense: true,
                usedLicense: true,
                unitCost: true
            }
        });

        // 3. Tendencias mensuales (últimos 12 meses)
        const monthlyTrends = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC('month', "createdAt") as month,
                COUNT(*) as licenses_created,
                SUM("totalLicense") as total_seats,
                SUM("usedLicense") as used_seats,
                SUM("unitCost") as total_cost
            FROM "License"
            WHERE "createdAt" >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY month DESC
        `;

        // 4. Licencias próximas a vencer (próximos 30 días)
        const expiringSoon = await prisma.license.findMany({
            where: {
                expiration: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                active: true
            },
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

        // 5. Utilización por departamento
        const utilizationByDept = await prisma.license.groupBy({
            by: ['departmentId'],
            where: {
                ...where,
                departmentId: {
                    not: null
                }
            },
            _count: {
                id: true
            },
            _sum: {
                totalLicense: true,
                usedLicense: true,
                unitCost: true
            },
            _avg: {
                usedLicense: true,
                totalLicense: true
            }
        });

        // Enriquecer con nombres de departamentos
        const deptIds = utilizationByDept.map(u => u.departmentId).filter(Boolean) as number[];
        const departments = await prisma.department.findMany({
            where: { id: { in: deptIds } },
            select: { id: true, name: true }
        });
        const deptMap = new Map(departments.map(d => [d.id, d.name]));

        const utilizationByDeptWithNames = utilizationByDept.map(u => ({
            ...u,
            departmentName: u.departmentId ? deptMap.get(u.departmentId) : 'Sin departamento'
        }));

        // 6. Costos anuales proyectados
        const annualProjection = await prisma.license.aggregate({
            where: {
                active: true
            },
            _sum: {
                unitCost: true,
                installmentCost: true
            }
        });

        // 7. Top usuarios con más asignaciones
        const topUsers = await prisma.user.findMany({
            include: {
                Assignment: {
                    include: {
                        license: true
                    }
                }
            },
            take: 10
        });

        // Calcular métricas adicionales
        const totalActiveSeats = licensesSummary
            .filter(l => l.active)
            .reduce((sum, l) => sum + Number(l._sum.totalLicense || 0), 0);

        const totalusedLicense = licensesSummary
            .filter(l => l.active)
            .reduce((sum, l) => sum + Number(l._sum.usedLicense || 0), 0);

        const utilizationRate = totalActiveSeats > 0 ? (totalusedLicense / totalActiveSeats) * 100 : 0;

        // Construir proyecciones de costo a partir de monthlyTrends
        const trendsArray: MonthlyTrendQueryResult[] = Array.isArray(monthlyTrends) ? monthlyTrends as MonthlyTrendQueryResult[] : [];
        const trendsWithNumbers = trendsArray.map((row) => ({
            month: row.month,
            totalCost: Number(row.total_cost ?? row.totalCost ?? 0)
        }));

        const costProjections = trendsWithNumbers.map((row, index) => {
            const currentCost = row.totalCost || 0;
            // Crecimiento respecto al mes siguiente en el arreglo (porque está DESC)
            const prevCost = trendsWithNumbers[index + 1]?.totalCost ?? null;
            const growthRate = prevCost && prevCost > 0 ? (currentCost - prevCost) / prevCost : 0;
            const projectedCost = currentCost * (1 + growthRate);
            const utilization = totalActiveSeats > 0 ? (totalusedLicense / totalActiveSeats) : 0;
            const savingsPotential = currentCost * (1 - utilization);
            return {
                month: row.month,
                current_cost: Math.max(0, currentCost),
                projected_cost: Math.max(0, projectedCost),
                savings_potential: Math.max(0, Math.round(savingsPotential))
            };
        });

        // Identificar licencias subutilizadas (heurística): utilización < 60% y costo mensual > 0
        const underutilizedLicenses = await prisma.license.findMany({
            where: {
                active: true,
                totalLicense: {
                    gt: 0
                }
            },
            select: {
                provider: true,
                model: true,
                usedLicense: true,
                totalLicense: true,
                unitCost: true
            }
        });

        const underutilizedTransformed = underutilizedLicenses
            .map(l => {
                const used = Number(l.usedLicense || 0);
                const total = Number(l.totalLicense || 0);
                const utilization = total > 0 ? used / total : 0;
                const monthlyCost = Number(l.unitCost || 0);
                const potentialSavings = Math.round(monthlyCost * (1 - utilization));
                return {
                    provider: l.provider,
                    model: l.model,
                    usedLicense: used,
                    totalLicense: total,
                    monthlyCost,
                    potentialSavings
                };
            })
            .filter(l => l.totalLicense > 0 && (l.usedLicense / l.totalLicense) < 0.6 && l.monthlyCost > 0)
            .sort((a, b) => b.potentialSavings - a.potentialSavings)
            .slice(0, 10);

        const response = {
            summary: {
                totalLicenses: licensesSummary.reduce((sum, l) => sum + Number(l._count.id), 0),
                activeLicenses: Number(licensesSummary.find(l => l.active)?._count.id || 0),
                inactiveLicenses: Number(licensesSummary.find(l => !l.active)?._count.id || 0),
                totalLicense: Number(totalActiveSeats),
                usedLicense: Number(totalusedLicense),
                utilizationRate: Math.round(utilizationRate * 100) / 100,
                monthlyCost: licensesSummary.reduce((sum, l) => sum + Number(l._sum.unitCost || 0), 0),
                annualProjection: Number(annualProjection._sum.unitCost || 0) * 12,
                // Nuevos campos calculados
                monthlyTrend: (() => {
                    try {
                        const trends = Array.isArray(monthlyTrends) ? monthlyTrends : [];
                        // monthlyTrends viene DESC; tomar actuales dos meses
                        const current = trends[0]?.total_cost ?? trends[0]?.totalCost ?? 0;
                        const previous = trends[1]?.total_cost ?? trends[1]?.totalCost ?? 0;
                        const currentNum = Number(current) || 0;
                        const previousNum = Number(previous) || 0;
                        if (previousNum <= 0) return 0;
                        return ((currentNum - previousNum) / previousNum) * 100;
                    } catch {
                        return 0;
                    }
                })(),
                potentialSavings: (() => {
                    // Heurística simple: ahorro potencial proporcional a licencias no utilizadas
                    // potentialSavings ≈ monthlyCost * (1 - utilizationRate)
                    const monthlyCost = licensesSummary.reduce((sum, l) => sum + Number(l._sum.unitCost || 0), 0);
                    const utilization = totalActiveSeats > 0 ? (totalusedLicense / totalActiveSeats) : 0;
                    const savings = monthlyCost * (1 - utilization);
                    return Math.max(0, Math.round(savings));
                })()
            },
            licensesByProvider: convertBigIntToNumber(licensesByProvider),
            monthlyTrends: convertBigIntToNumber(monthlyTrends),
            costProjections: convertBigIntToNumber(costProjections),
            expiringSoon: convertBigIntToNumber(expiringSoon),
            utilizationByDept: convertBigIntToNumber(utilizationByDeptWithNames),
            underutilizedLicenses: convertBigIntToNumber(underutilizedTransformed),
            topUsers: topUsers.map(user => ({
                ...(convertBigIntToNumber(user) as Record<string, unknown>),
                assignmentCount: Number(user.Assignment.length),
                totalCost: user.Assignment.reduce((sum, a) => sum + Number(a.license.unitCost), 0)
            })).sort((a, b) => b.assignmentCount - a.assignmentCount)
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("Error al obtener el resumen de reportes:", error);
        return NextResponse.json(
            { error: "Error al obtener el resumen de reportes" },
            { status: 500 }
        );
    }
}
