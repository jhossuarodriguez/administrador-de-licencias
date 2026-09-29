import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from "zod"
import { reportExportOptionsQuerySchema } from "@/lib/validations/report";
import { requireApiSession } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
    try {
        const { response } = await requireApiSession();
        if (response) return response;

        const { searchParams } = new URL(request.url);

        const validation = reportExportOptionsQuerySchema.safeParse({
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            provider: searchParams.get("provider") ?? undefined,
            department: searchParams.get("department"),
            status: searchParams.get("status") ?? undefined
        })

        if (!validation.success) {
            return NextResponse.json(
                { error: "Parametros invalidos", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400 }
            )
        }

        const {startDate, endDate, provider, department, status } = validation.data

        // Construir filtros dinámicos
        const where: Prisma.LicenseWhereInput = {};

        if (startDate && endDate) {
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        if (provider) {
            where.provider = provider;
        }

        if (department !== undefined) {
            where.departmentId = department;
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
                startDate: startDate?.toISOString() ?? null,
                endDate: endDate?.toISOString() ?? null,
                provider: provider ?? null,
                department: department ?? null,
                status: status ?? null
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
