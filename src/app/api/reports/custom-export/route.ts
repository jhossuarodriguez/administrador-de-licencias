import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
    CustomReportData,
    GroupedByProvider,
    GroupedByDepartment,
    GroupedByBillingCycle,
    UtilizationQueryResult
} from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { config, format = 'csv' } = body;

        console.log('=== CUSTOM EXPORT DEBUG ===');
        console.log('Config recibido:', JSON.stringify(config, null, 2));
        console.log('Format:', format);

        if (!config) {
            return NextResponse.json(
                { error: 'Configuración del reporte es requerida' },
                { status: 400 }
            );
        }

        const { metrics, filters, groupBy, dateRange } = config;

        console.log('Metrics:', metrics);
        console.log('GroupBy:', groupBy);
        console.log('DateRange:', dateRange);

        // Construir el where basado en los filtros
        const where: Prisma.LicenseWhereInput = { active: true };

        // Aplicar rango de fechas
        if (dateRange && dateRange !== 'all') {
            const days = parseInt(dateRange);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Filtrar por fecha de vencimiento próxima
            where.expiration = {
                gte: startDate
            };
        }

        // Aplicar filtros si existen
        if (filters) {
            if (filters.provider) {
                where.provider = filters.provider;
            }
            if (filters.department) {
                where.departmentId = parseInt(filters.department);
            }
            if (filters.billingCycle) {
                where.billingCycle = filters.billingCycle;
            }
        }

        // Obtener datos basados en las métricas seleccionadas
        const reportData: CustomReportData = {};

        console.log('WHERE clause:', where);
        console.log('Métricas a calcular:', metrics);

        // Total de licencias
        if (metrics?.includes('totalLicenses')) {
            const count = await prisma.license.count({ where });
            reportData.totalLicenses = count;
            console.log('Total Licencias:', count);
        }

        // Licencias activas
        if (metrics?.includes('activeLicenses')) {
            const count = await prisma.license.count({
                where: { ...where, active: true }
            });
            reportData.activeLicenses = count;
            console.log('Licencias Activas:', count);
        }

        // Licencias expiradas
        if (metrics?.includes('expiredLicenses')) {
            const count = await prisma.license.count({
                where: {
                    ...where,
                    expiration: {
                        lt: new Date()
                    }
                }
            });
            reportData.expiredLicenses = count;
            console.log('Licencias Expiradas:', count);
        }

        // Costo total
        if (metrics?.includes('totalCost')) {
            const costData = await prisma.license.aggregate({
                where: { ...where, active: true },
                _sum: { unitCost: true, installmentCost: true }
            });
            reportData.totalCost = Number(costData._sum?.unitCost) || 0;
            reportData.totalInstallmentCost = Number(costData._sum?.installmentCost) || 0;
            console.log('Costo Total:', reportData.totalCost);
        }

        // Costo mensual
        if (metrics?.includes('monthlyCost')) {
            const licenses = await prisma.license.findMany({
                where: { ...where, active: true },
                select: {
                    billingCycle: true,
                    installmentCost: true
                }
            });

            let monthlyCost = 0;
            licenses.forEach(license => {
                const cost = Number(license.installmentCost);
                const cycle = String(license.billingCycle);

                switch (cycle) {
                    case 'MONTHLY':
                    case 'Mensual':
                        monthlyCost += cost;
                        break;
                    case 'Trimestral':
                        monthlyCost += cost / 3;
                        break;
                    case 'Semestral':
                        monthlyCost += cost / 6;
                        break;
                    case 'YEARLY':
                    case 'Anual':
                        monthlyCost += cost / 12;
                        break;
                }
            });
            reportData.monthlyCost = monthlyCost;
        }

        // Tasa de utilización
        if (metrics?.includes('utilizationRate')) {
            const utilizationData = await prisma.$queryRaw<UtilizationQueryResult[]>`
                SELECT 
                    CASE 
                        WHEN SUM("totalLicense") > 0 
                        THEN ROUND((SUM("usedLicense")::decimal / SUM("totalLicense")::decimal) * 100, 2)
                        ELSE 0 
                    END as utilization_rate
                FROM "License" 
                WHERE "active" = true
            `;
            reportData.utilizationRate = utilizationData[0]?.utilization_rate || 0;
            console.log('Tasa de Utilización:', reportData.utilizationRate);
        }

        // Licencias disponibles
        if (metrics?.includes('availableSeats')) {
            const seatsData = await prisma.license.aggregate({
                where: { ...where, active: true },
                _sum: { totalLicense: true, usedLicense: true }
            });
            reportData.availableSeats = Number(seatsData._sum?.totalLicense || 0) - Number(seatsData._sum?.usedLicense || 0);
            reportData.totalLicense = Number(seatsData._sum?.totalLicense) || 0;
            reportData.usedLicense = Number(seatsData._sum?.usedLicense) || 0;
        }

        // Obtener listado completo de licencias para el detalle
        const allLicenses = await prisma.license.findMany({
            where,
            orderBy: [
                { provider: 'asc' },
                { model: 'asc' }
            ]
        });

        console.log('Total licencias encontradas:', allLicenses.length);

        // Obtener datos detallados para agrupación
        let detailedData: (GroupedByProvider | GroupedByDepartment | GroupedByBillingCycle)[] = [];

        if (groupBy) {
            if (groupBy === 'provider') {
                // @ts-expect-error - Prisma groupBy tipo tiene conflicto con TypeScript en este contexto
                detailedData = await prisma.license.groupBy({
                    by: ['provider'],
                    where,
                    _count: { id: true },
                    _sum: { unitCost: true, totalLicense: true, usedLicense: true }
                });
            } else if (groupBy === 'department') {
                // @ts-expect-error - Prisma groupBy tipo tiene conflicto con TypeScript en este contexto
                detailedData = await prisma.license.groupBy({
                    by: ['departmentId'],
                    where,
                    _count: { id: true },
                    _sum: { unitCost: true, totalLicense: true, usedLicense: true }
                });
            } else if (groupBy === 'billingCycle') {
                // @ts-expect-error - Prisma groupBy tipo tiene conflicto con TypeScript en este contexto
                detailedData = await prisma.license.groupBy({
                    by: ['billingCycle'],
                    where,
                    _count: { id: true },
                    _sum: { unitCost: true, installmentCost: true }
                });
            }
        }

        console.log('Report Data generado:', reportData);
        console.log('Detailed Data generado:', detailedData);

        // Generar CSV
        let csvContent = '';

        // Agregar información del reporte al inicio si hay agrupación o rango de fechas
        if (groupBy || (dateRange && dateRange !== 'all')) {
            csvContent += 'CONFIGURACION DEL REPORTE\n';
            if (groupBy) {
                const groupByLabels: Record<string, string> = {
                    provider: 'Proveedor',
                    department: 'Departamento',
                    billingCycle: 'Ciclo de Facturacion'
                };
                csvContent += 'Agrupado por:,' + (groupByLabels[groupBy] || groupBy) + '\n';
            }
            if (dateRange && dateRange !== 'all') {
                csvContent += 'Rango de fechas:,Ultimos ' + dateRange + ' dias\n';
            }
            csvContent += '\n';
        }

        // Encabezados directamente arriba
        csvContent += 'Metrica,Valor,Unidad\n';

        console.log('Generando CSV con reportData:', Object.entries(reportData));

        for (const [key, value] of Object.entries(reportData)) {
            const metricInfo = {
                totalLicenses: { name: 'Total de Licencias', unit: '' },
                activeLicenses: { name: 'Licencias Activas', unit: '' },
                expiredLicenses: { name: 'Licencias Expiradas', unit: '' },
                totalCost: { name: 'Costo Total', unit: 'DOP' },
                totalInstallmentCost: { name: 'Costo de Cuotas', unit: 'DOP' },
                monthlyCost: { name: 'Costo Mensual', unit: 'DOP' },
                utilizationRate: { name: 'Tasa de Utilizacion', unit: '%' },
                availableSeats: { name: 'Licencias Disponibles', unit: '' },
                totalLicense: { name: 'Total de Licencias', unit: '' },
                usedLicense: { name: 'Licencias Usadas', unit: '' }
            }[key] || { name: key, unit: '' };

            const formattedValue = typeof value === 'number'
                ? value.toFixed(2)
                : value;

            csvContent += metricInfo.name + ',' + formattedValue + ',' + metricInfo.unit + '\n';
        }

        // Datos agrupados si existen
        if (detailedData.length > 0) {
            csvContent += '\n';
            csvContent += '\n';
            csvContent += 'ANALISIS DETALLADO - AGRUPADO POR ' + (groupBy?.toUpperCase() || '') + '\n';
            csvContent += '\n';

            if (groupBy === 'provider') {
                csvContent += 'Proveedor,Cant. Licencias,Costo Total (DOP),Total Licencias,Licencias Usadas,Utilizacion (%)\n';
                (detailedData as GroupedByProvider[]).forEach((row) => {
                    const utilizationPct = (row._sum.totalLicense || 0) > 0
                        ? (((row._sum.usedLicense || 0) / (row._sum.totalLicense || 0)) * 100).toFixed(2)
                        : '0.00';
                    csvContent += (row.provider || 'Sin proveedor') + ',' +
                        row._count.id + ',' +
                        Number(row._sum.unitCost || 0).toFixed(2) + ',' +
                        (row._sum.totalLicense || 0) + ',' +
                        (row._sum.usedLicense || 0) + ',' +
                        utilizationPct + '\n';
                });
            } else if (groupBy === 'department') {
                csvContent += 'Departamento,Cant. Licencias,Costo Total (DOP),Total Licencias,Licencias Usadas,Utilizacion (%)\n';
                // Enriquecer con nombres de departamentos
                const deptIds = (detailedData as GroupedByDepartment[]).map(d => d.departmentId).filter(Boolean) as number[];
                const depts = await prisma.department.findMany({
                    where: { id: { in: deptIds } },
                    select: { id: true, name: true }
                });
                const deptMap = new Map(depts.map(d => [d.id, d.name]));

                (detailedData as GroupedByDepartment[]).forEach((row) => {
                    const utilizationPct = (row._sum.totalLicense || 0) > 0
                        ? (((row._sum.usedLicense || 0) / (row._sum.totalLicense || 0)) * 100).toFixed(2)
                        : '0.00';
                    const deptName = row.departmentId ? deptMap.get(row.departmentId) || 'Sin departamento' : 'Sin departamento';
                    csvContent += deptName + ',' +
                        row._count.id + ',' +
                        Number(row._sum.unitCost || 0).toFixed(2) + ',' +
                        (row._sum.totalLicense || 0) + ',' +
                        (row._sum.usedLicense || 0) + ',' +
                        utilizationPct + '\n';
                });
            } else if (groupBy === 'billingCycle') {
                csvContent += 'Ciclo Facturacion,Cant. Licencias,Costo Unitario (DOP),Costo Cuota (DOP),Promedio (DOP)\n';
                (detailedData as GroupedByBillingCycle[]).forEach((row) => {
                    const avgCost = row._count.id > 0
                        ? (Number(row._sum.unitCost || 0) / row._count.id).toFixed(2)
                        : '0.00';
                    csvContent += row.billingCycle + ',' +
                        row._count.id + ',' +
                        Number(row._sum.unitCost || 0).toFixed(2) + ',' +
                        Number(row._sum.installmentCost || 0).toFixed(2) + ',' +
                        avgCost + '\n';
                });
            }

            // Agregar totales al final
            csvContent += '\n';
            csvContent += 'TOTALES\n';
            const totalLicenses = detailedData.reduce((sum: number, row) => sum + row._count.id, 0);
            const totalCost = detailedData.reduce((sum: number, row) => {
                const unitCost = 'unitCost' in row._sum ? row._sum.unitCost : 0;
                return sum + Number(unitCost || 0);
            }, 0);
            csvContent += 'Total de Licencias,' + totalLicenses + '\n';
            csvContent += 'Costo Total,' + totalCost.toFixed(2) + ',DOP\n';
        }

        // Pie de página simple
        csvContent += '\n';
        csvContent += '\n';
        csvContent += 'INFORMACION DEL REPORTE\n';
        csvContent += '\n';
        csvContent += 'Sistema:,License Administrator - CAID\n';
        csvContent += 'Fecha generacion:,' + new Date().toISOString().split('T')[0] + '\n';
        csvContent += 'Nombre reporte:,' + (config.name || 'Sin nombre') + '\n';
        if (config.description) {
            csvContent += 'Descripcion:,' + config.description + '\n';
        }
        csvContent += '\n';

        // Agregar BOM para que Excel interprete correctamente UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        return new NextResponse(csvWithBOM, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="reporte_personalizado_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error('Error al exportar reporte personalizado:', error);
        return NextResponse.json(
            {
                error: 'Error al exportar el reporte personalizado',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
}
