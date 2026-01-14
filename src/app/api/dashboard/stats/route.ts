import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [totalLicenses, totalUsers, activeLicenses] = await Promise.all([
            prisma.license.count(),
            // Excluir usuarios que tienen cuentas o sesiones (administradores/operadores autenticados)
            prisma.user.count({
                where: {
                    AND: [
                        { accounts: { none: {} } },
                        { sessions: { none: {} } }
                    ]
                }
            }),
            prisma.license.count({ where: { active: true } })
        ])

        const chartData = await generateChartData()
        const trends = await calculateTrends()

        const mostUsed = await prisma.license.groupBy({
            by: ['provider'],
            _count: { provider: true },
            orderBy: { _count: { provider: 'desc' } },
            take: 5
        })

        const mostUsedFormatted = mostUsed.map(item => ({
            name: item.provider,
            usage: item._count.provider,
            percentage: Math.round((item._count.provider / totalLicenses) * 100)
        }))

        return NextResponse.json({
            licenses: {
                totalUsers,
                totalLicenses,
                activeUsers: activeLicenses,
                expiringSoon: await getExpiringSoonCount(),
                expired: await getExpiredCount(),
            },
            trends,
            chartData,
            mostUsed: mostUsedFormatted,
            expiringSoonNames: await getExpiringSoonNames()
        })

    } catch (err) {
        console.error('Error al obtener datos del dashboard', err)
        return NextResponse.json(
            { error: 'Error al obtener datos del dashboard' },
            { status: 500 }
        )
    }
}

async function generateChartData() {
    const chartData = []
    const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const currentYear = new Date().getFullYear()

    for (let month = 0; month < 12; month++) {
        const startOfMonth = new Date(currentYear, month, 1)
        const endOfMonth = new Date(currentYear, month + 1, 0, 23, 59, 59)

        const activeThisMonth = await prisma.license.aggregate({
            where: {
                startDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                active: true,
            },
            _sum: {
                usedLicense: true
            }
        })

        chartData.push({
            month: monthNames[month],
            usage: activeThisMonth?._sum.usedLicense || 0 // Nuevas licencias
        })
    }

    return chartData
}

async function getExpiringSoonCount() {
    const DaysFromNow = new Date()
    DaysFromNow.setDate(DaysFromNow.getDate() + 30)

    return await prisma.license.count({
        where: {
            active: true,
            expiration: {
                gte: new Date(),
                lte: DaysFromNow
            }
        }
    })
}

async function calculateTrends() {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Datos del mes actual
    const [currentUsers, currentLicenses, currentActive, currentExpiring] = await Promise.all([
        prisma.user.count({
            where: {
                createdAt: { gte: thisMonth },
                AND: [
                    { accounts: { none: {} } },
                    { sessions: { none: {} } }
                ]
            }
        }),
        prisma.license.count({
            where: { createdAt: { gte: thisMonth } }
        }),
        prisma.license.count({
            where: {
                active: true,
                createdAt: { gte: thisMonth }
            }
        }),
        getExpiringSoonCountForMonth(thisMonth)
    ])

    // Datos del mes pasado
    const [previousUsers, previousLicenses, previousActive, previousExpiring] = await Promise.all([
        prisma.user.count({
            where: {
                createdAt: {
                    gte: lastMonth,
                    lt: thisMonth
                },
                AND: [
                    { accounts: { none: {} } },
                    { sessions: { none: {} } }
                ]
            }
        }),
        prisma.license.count({
            where: {
                createdAt: {
                    gte: lastMonth,
                    lt: thisMonth
                }
            }
        }),
        prisma.license.count({
            where: {
                active: true,
                createdAt: {
                    gte: lastMonth,
                    lt: thisMonth
                }
            }
        }),
        getExpiringSoonCountForMonth(lastMonth)
    ])

    // Calcular cambios porcentuales
    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    return {
        totalUsersChange: calculateChange(currentUsers, previousUsers),
        totalLicensesChange: calculateChange(currentLicenses, previousLicenses),
        activeUsersChange: calculateChange(currentActive, previousActive),
        expiringChange: calculateChange(currentExpiring, previousExpiring)
    }
}

async function getExpiringSoonCountForMonth(fromDate: Date) {
    const thirtyDaysFromDate = new Date(fromDate)
    thirtyDaysFromDate.setDate(thirtyDaysFromDate.getDate() + 30)

    return await prisma.license.count({
        where: {
            active: true,
            expiration: {
                gte: fromDate,
                lte: thirtyDaysFromDate
            }
        }
    })
}

async function getExpiredCount() {
    const now = new Date()

    return await prisma.license.count({
        where: {
            expiration: {
                lt: now // Licencias con fecha de expiración menor a ahora
            }
        }
    })
}

async function getExpiringSoonNames() {
    const now = new Date()
    const DaysFromNow = new Date()
    DaysFromNow.setDate(DaysFromNow.getDate() + 30)

    const licenses = await prisma.license.findMany({
        where: {
            active: true,
            expiration: {
                gte: now,
                lte: DaysFromNow
            }
        },
        select: {
            provider: true,
            plan: true,
            expiration: true
        },
        orderBy: {
            expiration: 'asc' // Ordenar por fecha de expiración más cercana primero
        }
    })

    return licenses.map(license => {
        const expiration = license.expiration || new Date()
        const daysLeft = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return {
            name: `${license.provider} ${license.plan}`,
            daysLeft: daysLeft > 0 ? daysLeft : 0
        }
    })
}