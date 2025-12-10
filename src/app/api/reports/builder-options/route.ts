import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Obtener métricas dinámicas basadas en datos reales de la base de datos
        const [
            totalLicenses,
            activeLicenses,
            totalCost,
            monthlyCost,
            utilizationData,
            expiringCount,
            userCount,
            providers,
            departments,
            statuses
        ] = await Promise.all([
            // Total de licencias
            prisma.license.count(),

            // Licencias activas
            prisma.license.count({ where: { active: true } }),

            // Costo total (suma de costos unitarios de licencias activas)
            prisma.license.aggregate({
                where: { active: true },
                _sum: { unitCost: true }
            }),

            // Costo mensual (suma de costos de cuota de licencias activas)
            prisma.license.aggregate({
                where: { active: true },
                _sum: { installmentCost: true }
            }),

            // Datos de utilización (licencias totales y usados)
            prisma.license.aggregate({
                where: { active: true },
                _sum: {
                    totalLicense: true,
                    usedLicense: true
                }
            }),

            // Licencias que expiran en los próximos 30 días
            prisma.license.count({
                where: {
                    active: true,
                    expiration: {
                        lte: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 días desde ahora
                        gte: new Date() // Desde hoy
                    }
                }
            }),

            // Total de usuarios
            prisma.user.count(),

            // Lista única de proveedores
            prisma.license.findMany({
                select: { provider: true },
                distinct: ['provider'],
                orderBy: { provider: 'asc' }
            }),

            // Lista única de departamentos desde tabla Department
            prisma.department.findMany({
                select: { id: true, name: true },
                where: { active: true },
                orderBy: { name: 'asc' }
            }),

            // Agrupación por estado
            prisma.license.groupBy({
                by: ['active'],
                _count: { id: true }
            })
        ]);

        // Calcular tasa de utilización
        const utilizationRate = (utilizationData._sum.totalLicense && utilizationData._sum.totalLicense > 0)
            ? Math.round((Number(utilizationData._sum.usedLicense) / Number(utilizationData._sum.totalLicense)) * 100)
            : 0;
        // Métricas dinámicas con valores reales de la base de datos
        const availableMetrics = [
            {
                id: 'totalLicenses',
                label: 'Total de Licencias',
                category: 'General',
                currentValue: totalLicenses,
                unit: 'licencias',
                compatibleCharts: ['bar', 'line', 'table'],
                description: 'Número total de licencias en el sistema'
            },
            {
                id: 'activeLicenses',
                label: 'Licencias Activas',
                category: 'General',
                currentValue: activeLicenses,
                unit: 'licencias',
                compatibleCharts: ['bar', 'line', 'pie', 'table'],
                description: 'Licencias actualmente activas'
            },
            {
                id: 'totalCost',
                label: 'Costo Total',
                category: 'Financiero',
                currentValue: totalCost._sum.unitCost ? Number(totalCost._sum.unitCost) : 0,
                unit: 'DOP',
                compatibleCharts: ['bar', 'line', 'area', 'table'],
                description: 'Costo total de todas las licencias activas'
            },
            {
                id: 'monthlyCost',
                label: 'Costo Mensual',
                category: 'Financiero',
                currentValue: monthlyCost._sum.installmentCost ? Number(monthlyCost._sum.installmentCost) : 0,
                unit: 'DOP/mes',
                compatibleCharts: ['bar', 'line', 'area', 'table'],
                description: 'Costo mensual de todas las licencias'
            },
            {
                id: 'utilizationRate',
                label: 'Tasa de Utilización',
                category: 'Uso',
                currentValue: utilizationRate,
                unit: '%',
                compatibleCharts: ['bar', 'line', 'pie', 'table'],
                description: 'Porcentaje de licencias utilizadas'
            },
            {
                id: 'totalLicense',
                label: 'licencias Totales',
                category: 'Uso',
                currentValue: utilizationData._sum.totalLicense ? Number(utilizationData._sum.totalLicense) : 0,
                unit: 'licencias',
                compatibleCharts: ['bar', 'line', 'table'],
                description: 'Número total de licencias disponibles'
            },
            {
                id: 'usedLicense',
                label: 'licencias Usadas',
                category: 'Uso',
                currentValue: utilizationData._sum.usedLicense ? Number(utilizationData._sum.usedLicense) : 0,
                unit: 'licencias',
                compatibleCharts: ['bar', 'line', 'table'],
                description: 'Número de licencias actualmente en uso'
            },
            {
                id: 'expiringSoon',
                label: 'Próximas a Vencer',
                category: 'Tiempo',
                currentValue: expiringCount,
                unit: 'licencias',
                compatibleCharts: ['bar', 'line', 'table'],
                description: 'Licencias que vencen en los próximos 30 días'
            },
            {
                id: 'userCount',
                label: 'Número de Usuarios',
                category: 'General',
                currentValue: userCount,
                unit: 'usuarios',
                compatibleCharts: ['bar', 'line', 'table'],
                description: 'Total de usuarios en el sistema'
            }
        ];

        // Opciones de agrupación dinámicas basadas en datos reales
        const groupByOptions = [
            {
                id: 'provider',
                label: 'Proveedor',
                values: providers.map(p => p.provider).filter(Boolean), // Filtrar valores nulos
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate', 'totalLicense', 'usedLicense'],
                description: 'Agrupar por proveedor de software'
            },
            {
                id: 'department',
                label: 'Departamento',
                values: departments.map(d => d.name),
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'utilizationRate'],
                description: 'Agrupar por departamento asignado'
            },
            {
                id: 'month',
                label: 'Mes',
                values: ['Últimos 12 meses'],
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate'],
                description: 'Agrupar por mes de creación'
            },
            {
                id: 'status',
                label: 'Estado',
                values: Array.from(new Set(statuses.map(s => s.active ? 'Activa' : 'Inactiva'))),
                compatibleMetrics: ['totalLicenses', 'totalCost', 'utilizationRate'],
                description: 'Agrupar por estado de la licencia'
            },
            {
                id: 'user',
                label: 'Usuario',
                values: ['Usuarios más activos'],
                compatibleMetrics: ['totalLicenses', 'totalCost'],
                description: 'Agrupar por usuario asignado'
            }
        ];

        // Tipos de gráficos con información de compatibilidad completa
        const chartTypes = [
            {
                id: 'bar',
                label: 'Gráfico de Barras',
                description: 'Ideal para comparar categorías',
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate', 'totalLicense', 'usedLicense', 'expiringSoon', 'userCount'],
                icon: 'BarChart3'
            },
            {
                id: 'line',
                label: 'Gráfico de Líneas',
                description: 'Perfecto para tendencias temporales',
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate', 'totalLicense', 'usedLicense'],
                icon: 'TrendingUp'
            },
            {
                id: 'pie',
                label: 'Gráfico Circular',
                description: 'Excelente para proporciones',
                compatibleMetrics: ['activeLicenses', 'utilizationRate', 'totalCost'],
                icon: 'PieChart'
            },
            {
                id: 'area',
                label: 'Gráfico de Área',
                description: 'Ideal para mostrar acumulados',
                compatibleMetrics: ['totalCost', 'monthlyCost', 'totalLicense', 'usedLicense'],
                icon: 'AreaChart'
            },
            {
                id: 'table',
                label: 'Tabla',
                description: 'Datos detallados y exportables',
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate', 'totalLicense', 'usedLicense', 'expiringSoon', 'userCount'],
                icon: 'Table'
            }
        ];

        // Rangos de fechas con contexto completo
        const dateRangeOptions = [
            {
                id: '7',
                label: 'Últimos 7 días',
                description: 'Tendencia semanal',
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'utilizationRate']
            },
            {
                id: '30',
                label: 'Últimos 30 días',
                description: 'Tendencia mensual',
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate', 'expiringSoon']
            },
            {
                id: '90',
                label: 'Últimos 90 días',
                description: 'Tendencia trimestral',
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate', 'totalLicense', 'usedLicense']
            },
            {
                id: '365',
                label: 'Último año',
                description: 'Análisis anual completo',
                compatibleMetrics: ['totalLicenses', 'activeLicenses', 'totalCost', 'monthlyCost', 'utilizationRate', 'totalLicense', 'usedLicense', 'expiringSoon', 'userCount']
            }
        ];

        return NextResponse.json({
            metrics: availableMetrics,
            groupByOptions,
            chartTypes,
            dateRangeOptions,
            statistics: {
                totalMetrics: availableMetrics.length,
                totalGroupOptions: groupByOptions.length,
                lastUpdated: new Date().toISOString(),
                dbConnected: true,
                dataSource: 'database',
                summary: {
                    totalLicenses,
                    activeLicenses,
                    inactiveLicenses: totalLicenses - activeLicenses,
                    utilizationRate: `${utilizationRate}%`,
                    totalProviders: providers.length,
                    totalDepartments: departments.length,
                    expiringSoon: expiringCount
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener opciones del constructor de reportes:', error);

        // En caso de error, devolver datos mínimos de fallback para que la interfaz funcione
        const fallbackMetrics = [
            {
                id: 'totalLicenses',
                label: 'Total de Licencias',
                category: 'General',
                currentValue: 0,
                unit: 'licencias',
                compatibleCharts: ['bar', 'line', 'table'],
                description: 'Número total de licencias en el sistema (datos no disponibles)'
            },
            {
                id: 'activeLicenses',
                label: 'Licencias Activas',
                category: 'General',
                currentValue: 0,
                unit: 'licencias',
                compatibleCharts: ['bar', 'line', 'pie', 'table'],
                description: 'Licencias actualmente activas (datos no disponibles)'
            }
        ];

        const fallbackChartTypes = [
            {
                id: 'table',
                label: 'Tabla',
                description: 'Datos detallados y exportables',
                compatibleMetrics: ['totalLicenses', 'activeLicenses'],
                icon: 'Table'
            }
        ];

        const fallbackDateRanges = [
            {
                id: '30',
                label: 'Últimos 30 días',
                description: 'Tendencia mensual',
                compatibleMetrics: ['totalLicenses', 'activeLicenses']
            }
        ];

        return NextResponse.json({
            metrics: fallbackMetrics,
            groupByOptions: [],
            chartTypes: fallbackChartTypes,
            dateRangeOptions: fallbackDateRanges,
            statistics: {
                totalMetrics: fallbackMetrics.length,
                totalGroupOptions: 0,
                lastUpdated: new Date().toISOString(),
                dbConnected: false,
                dataSource: 'fallback',
                error: error instanceof Error ? error.message : 'Error desconocido al conectar con la base de datos',
                summary: {
                    totalLicenses: 0,
                    activeLicenses: 0,
                    inactiveLicenses: 0,
                    utilizationRate: '0%',
                    totalProviders: 0,
                    totalDepartments: 0,
                    expiringSoon: 0
                }
            }
        }, { status: 200 }); // Devolvemos 200 para que el frontend pueda funcionar con datos de fallback
    }
}