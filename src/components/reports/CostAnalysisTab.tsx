'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ComposedChart } from 'recharts';
import { AlertTriangle, Target, Calculator, PieChart as PieChartIcon } from 'lucide-react';
import { useSummary, chartConfig } from '@/hooks/useSummary';
import { CostCards } from './cards/CostTabCards';
import { ReportFilters } from '@/hooks/useReportTypes';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';
import { ProviderCost } from '@/types';

interface CostAnalysisProps {
    filters?: ReportFilters;
}

export default function CostAnalysis({ filters }: CostAnalysisProps) {
    const { data, isLoading, error } = useSummary(filters);
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-6 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center">
                <div className="text-center py-8 text-thirdary">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Error al cargar datos de costo</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return formatCurrencyUtil(value);
    };

    const formatPercentage = (value: number) => {
        return `${Math.round(value)}%`;
    };

    // Normalizar costos por proveedor para evitar NaN
    const providersData = (data?.licensesByProvider ?? []).map((p: ProviderCost) => ({
        provider: p?.provider ?? 'Desconocido',
        totalCost: Number(p?._sum?.unitCost ?? 0),
    }));

    return (
        <div className="space-y-6">
            {/* Métricas Principales de Costos */}
            <div className="w-full max-w-7xl mx-auto">
                <CostCards />
            </div>

            <div className="hidden md:flex flex-col md:flex-row space-x-6">
                {/* Distribución de Costos por Proveedor */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 " />
                            <span className="text-base font-bold ">Distribución de Costos por Proveedor</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {providersData && providersData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <BarChart width={800} height={224} data={providersData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="provider"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value, name) => [
                                            formatCurrency(Number(value || 0)),
                                            name === 'totalCost' ? ' Costo Total' : name
                                        ]}
                                    />
                                    <Bar dataKey="totalCost" fill="url(#barGradient)" />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-56 w-full flex flex-col items-center justify-center text-thirdary">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                Sin datos de proveedores
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Proyecciones de Costos y Ahorros */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Proyecciones de Costos y Ahorros Potenciales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data?.costProjections && data?.costProjections.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <ComposedChart width={800} height={224} data={data?.costProjections.map(date => ({ ...date, month: new Date(date.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) }))}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            try {
                                                return new Date(value).toLocaleDateString('es-ES', { month: 'short' });
                                            } catch {
                                                return value;
                                            }
                                        }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value, name) => [
                                            formatCurrency(Number(value)),
                                            name === 'current_cost' ? ' Costo Actual' :
                                                name === 'projected_cost' ? ' Costo Proyectado' :
                                                    name === 'savings_potential' ? ' Ahorros Potenciales' : name
                                        ]}
                                    />
                                    <Bar dataKey="current_cost" fill="url(#barGradient)" />
                                    <Line type="monotone" dataKey="projected_cost" stroke="url(#barGradient)" strokeDasharray="5 5" strokeWidth={2} />
                                    <Line type="monotone" dataKey="savings_potential" stroke="#10b981" strokeWidth={2} />
                                </ComposedChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-56 w-full flex flex-col items-center justify-center text-thirdary">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                Sin datos de proyecciones
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Licencias Subutilizadas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Licencias Subutilizadas - Oportunidades de Ahorro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {(data?.underutilizedLicenses && data?.underutilizedLicenses.length > 0) ? (
                            data.underutilizedLicenses.map((license, index) => {
                                const utilizationRate = (license.usedLicense / license.totalLicense) * 100;
                                const efficiency = utilizationRate >= 80 ? 'high' : utilizationRate >= 60 ? 'medium' : 'low';
                                return (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <h4 className="font-medium text-thirdary">{license.provider} - {license.model}</h4>
                                                    <p className="text-sm text-thirdary">
                                                        {license.usedLicense} de {license.totalLicense} licencias utilizadas
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={efficiency === 'high' ? 'default' : efficiency === 'medium' ? 'secondary' : 'destructive'}
                                                >
                                                    {formatPercentage(utilizationRate)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-thirdary">{formatCurrency(license.monthlyCost)}/mes</p>
                                            <p className="text-sm text-green-600 font-medium">
                                                Ahorro: {formatCurrency(license.potentialSavings)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-thirdary">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No se encontraron licencias subutilizadas</p>
                            </div>
                        )}
                    </div>
                    {data?.underutilizedLicenses && data?.underutilizedLicenses.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-green-800">
                                    Ahorro Total Potencial: {formatCurrency(data?.underutilizedLicenses.reduce((sum, l) => sum + l.potentialSavings, 0))} mensuales
                                </span>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                                Equivalente a {formatCurrency(data?.underutilizedLicenses.reduce((sum, l) => sum + l.potentialSavings, 0) * 12)} anuales
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}