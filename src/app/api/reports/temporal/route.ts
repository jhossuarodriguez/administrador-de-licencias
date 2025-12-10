import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
    LicenseCreationTrend,
    UtilizationTrend,
    SeasonalAnalysis,
    YearOverYear,
    ExpirationTrend,
    MonthlyAveragesResult
} from '@/types';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const months = parseInt(searchParams.get('months') || '12');
        const provider = searchParams.get('provider');

        // 1. Tendencias de creación de licencias por mes
        const licenseCreationTrends = await prisma.$queryRaw<LicenseCreationTrend[]>`
            SELECT 
                DATE_TRUNC('month', "createdAt") as month,
                COUNT(*)::int as licenses_created,
                COALESCE(SUM("totalLicense"), 0)::int as total_seats_added,
                COALESCE(SUM("unitCost"), 0)::float as total_cost_added,
                STRING_AGG(DISTINCT "provider", ', ') as providers
            FROM "License"
            WHERE "createdAt" >= NOW() - INTERVAL '${Prisma.raw(months.toString())} months'
            ${provider ? Prisma.sql`AND "provider" = ${provider}` : Prisma.empty}
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY month DESC
        `;

        // 2. Evolución de utilización por mes
        const utilizationTrends = await prisma.$queryRaw<UtilizationTrend[]>`
            SELECT 
                DATE_TRUNC('month', "createdAt") as month,
                COALESCE(SUM("totalLicense"), 0)::int as total_seats,
                COALESCE(SUM("usedLicense"), 0)::int as used_seats,
                CASE 
                    WHEN SUM("totalLicense") > 0 
                    THEN ROUND((SUM("usedLicense")::decimal / SUM("totalLicense")::decimal) * 100, 2)
                    ELSE 0 
                END as utilization_percentage
            FROM "License"
            WHERE "createdAt" >= NOW() - INTERVAL '${Prisma.raw(months.toString())} months'
            ${provider ? Prisma.sql`AND "provider" = ${provider}` : Prisma.empty}
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY month DESC
        `;

        // 3. Proyecciones futuras basadas en tendencias
        const currentMonth = new Date();
        currentMonth.setDate(1); // Primer día del mes actual

        const lastThreeMonths = await prisma.$queryRaw<MonthlyAveragesResult[]>`
            SELECT 
                AVG(monthly_licenses) as avg_licenses_per_month,
                AVG(monthly_cost) as avg_cost_per_month,
                AVG(monthly_seats) as avg_seats_per_month
            FROM (
                SELECT 
                    DATE_TRUNC('month', "createdAt") as month,
                    COUNT(*) as monthly_licenses,
                    SUM("unitCost") as monthly_cost,
                    SUM("totalLicense") as monthly_seats
                FROM "License"
                WHERE "createdAt" >= NOW() - INTERVAL '3 months'
                ${provider ? Prisma.sql`AND "provider" = ${provider}` : Prisma.empty}
                GROUP BY DATE_TRUNC('month', "createdAt")
            ) as monthly_stats
        `;

        // Calcular proyecciones para los próximos 6 meses
        const projections = [];
        const avgGrowth = lastThreeMonths[0] || { avg_licenses_per_month: 0, avg_cost_per_month: 0, avg_seats_per_month: 0 };

        for (let i = 1; i <= 6; i++) {
            const futureDate = new Date(currentMonth);
            futureDate.setMonth(futureDate.getMonth() + i);

            projections.push({
                month: futureDate,
                projected_licenses: Math.round(Number(avgGrowth.avg_licenses_per_month) || 0),
                projected_cost: Math.round(Number(avgGrowth.avg_cost_per_month) || 0),
                projected_seats: Math.round(Number(avgGrowth.avg_seats_per_month) || 0),
                confidence: Math.max(60 - (i * 5), 30) // Confianza decrece con el tiempo
            });
        }

        // 4. Análisis estacional
        const seasonalAnalysis = await prisma.$queryRaw<SeasonalAnalysis[]>`
            SELECT 
                DATE_TRUNC('month', "createdAt") as month_date,
                EXTRACT(MONTH FROM "createdAt")::int as month_number,
                COUNT(*)::int as total_licenses,
                AVG(COUNT(*)) OVER()::int as avg_monthly_licenses,
                COALESCE(SUM("unitCost"), 0)::float as total_cost
            FROM "License"
            WHERE "createdAt" >= NOW() - INTERVAL '24 months'
            ${provider ? Prisma.sql`AND "provider" = ${provider}` : Prisma.empty}
            GROUP BY DATE_TRUNC('month', "createdAt"), EXTRACT(MONTH FROM "createdAt")
            ORDER BY month_date
        `;

        // 5. Comparativa año a año
        const yearOverYear = await prisma.$queryRaw<YearOverYear[]>`
            SELECT 
                EXTRACT(YEAR FROM "createdAt")::int as year,
                COUNT(*)::int as total_licenses,
                COALESCE(SUM("totalLicense"), 0)::int as total_seats,
                COALESCE(SUM("unitCost"), 0)::float as total_cost,
                COUNT(DISTINCT "provider")::int as unique_providers
            FROM "License"
            WHERE "createdAt" >= NOW() - INTERVAL '36 months'
            ${provider ? Prisma.sql`AND "provider" = ${provider}` : Prisma.empty}
            GROUP BY EXTRACT(YEAR FROM "createdAt")
            ORDER BY year DESC
        `;

        // 6. Tendencias de vencimiento
        const expirationTrends = await prisma.$queryRaw<ExpirationTrend[]>`
            SELECT 
                DATE_TRUNC('month', "expiration") as expiration_month,
                COUNT(*)::int as expiring_licenses,
                COALESCE(SUM("unitCost"), 0)::float as expiring_cost,
                COALESCE(SUM("totalLicense"), 0)::int as expiring_seats
            FROM "License"
            WHERE "expiration" IS NOT NULL 
                AND "expiration" >= NOW()
                AND "expiration" <= NOW() + INTERVAL '12 months'
                AND "active" = true
            ${provider ? Prisma.sql`AND "provider" = ${provider}` : Prisma.empty}
            GROUP BY DATE_TRUNC('month', "expiration")
            ORDER BY expiration_month
        `;

        const response = {
            licenseCreationTrends,
            utilizationTrends,
            projections,
            seasonalAnalysis,
            yearOverYear,
            expirationTrends,
            summary: {
                totalMonthsAnalyzed: months,
                provider: provider || 'Todos',
                generatedAt: new Date(),
                avgMonthlyGrowth: avgGrowth
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("Error al obtener análisis temporal:", error);
        return NextResponse.json(
            { error: "Error al obtener análisis temporal" },
            { status: 500 }
        );
    }
}