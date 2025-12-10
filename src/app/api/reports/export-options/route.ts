import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const provider = searchParams.get('provider');
        const department = searchParams.get('department');
        const status = searchParams.get('status');

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

        if (status) {
            switch (status) {
                case 'active':
                    where.active = true;
                    break;
                case 'inactive':
                    where.active = false;
                    break;
                case 'expiring':
                    const now = new Date();
                    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                    where.active = true;
                    where.expiration = {
                        lte: thirtyDaysFromNow,
                        gte: now
                    };
                    break;
            }
        }

        // Obtener estadísticas para mostrar en las opciones
        const [totalRecords, activeRecords, expiringRecords] = await Promise.all([
            prisma.license.count({ where }),
            prisma.license.count({ where: { ...where, active: true } }),
            prisma.license.count({
                where: {
                    ...where,
                    active: true,
                    expiration: {
                        lte: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
                        gte: new Date()
                    }
                }
            })
        ]);

        // Calcular información adicional
        const totalCost = await prisma.license.aggregate({
            where: { ...where, active: true },
            _sum: { unitCost: true }
        });

        const utilizationData = await prisma.license.aggregate({
            where: { ...where, active: true },
            _sum: {
                totalLicense: true,
                usedLicense: true
            }
        });

        const utilizationRate = (utilizationData._sum.totalLicense && utilizationData._sum.totalLicense > 0)
            ? Math.round((Number(utilizationData._sum.usedLicense) / Number(utilizationData._sum.totalLicense)) * 100)
            : 0;

        // Definir formatos de exportación disponibles
        const exportFormats = [
            {
                format: 'csv',
                label: 'Exportar CSV',
                description: 'Datos en formato tabla para Excel',
                icon: 'Table',
                enabled: totalRecords > 0,
                recordCount: totalRecords,
                fileSize: Math.round(totalRecords * 0.5), // Estimación en KB
                features: ['Tabla completa', 'Compatible con Excel', 'Filtros aplicados']
            },
            {
                format: 'json',
                label: 'Exportar JSON',
                description: 'Datos completos con metadata',
                icon: 'FileText',
                enabled: totalRecords > 0,
                recordCount: totalRecords,
                fileSize: Math.round(totalRecords * 2), // Estimación en KB
                features: ['Datos completos', 'Metadata incluida', 'Análisis detallado']
            },
            {
                format: 'pdf',
                label: 'Exportar PDF',
                description: 'Reporte visual completo',
                icon: 'BarChart3',
                enabled: totalRecords > 0,
                recordCount: totalRecords,
                fileSize: Math.round(totalRecords * 0.8), // Estimación en KB
                features: ['Gráficos incluidos', 'Formato profesional', 'Listo para presentar']
            }
        ];

        return NextResponse.json({
            formats: exportFormats,
            statistics: {
                totalRecords,
                activeRecords,
                expiringRecords,
                totalCost: totalCost._sum.unitCost ? Number(totalCost._sum.unitCost) : 0,
                utilizationRate,
                totalLicense: utilizationData._sum.totalLicense ? Number(utilizationData._sum.totalLicense) : 0,
                usedLicense: utilizationData._sum.usedLicense ? Number(utilizationData._sum.usedLicense) : 0
            },
            filters: {
                startDate,
                endDate,
                provider,
                department,
                status
            },
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error al obtener opciones de exportación:', error);
        return NextResponse.json(
            { error: 'Error al obtener opciones de exportación' },
            { status: 500 }
        );
    }
}
