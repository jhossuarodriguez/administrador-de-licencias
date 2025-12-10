'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { Calendar, Target, BarChart3, Clock, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

import { useTemporal, chartConfig } from "@/hooks/useTemporal"
import { TemporalFilters, formatCurrency } from '@/hooks/useReportTypes';

interface TemporalAnalysisGraphProps {
    filters?: TemporalFilters;
}

export function TemporalAnalysisGraph({ filters }: TemporalAnalysisGraphProps) {
    const { data, isLoading, error } = useTemporal(filters)

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 place-items-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <div> Error al cargar datos!</div>
                    </Card>
                ))
                }
            </div >
        );
    }
    return (
        <div className="space-y-6">
            <div className="grid-cols-1 lg:grid-cols-2 gap-6 hidden md:grid">
                {/* Evolución de Utilización */}
                {data?.utilizationTrends && data.utilizationTrends.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Evolución de Utilización
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <AreaChart width={800} height={224} data={data.utilizationTrends.map(date => ({ ...date, month: new Date(date.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) }))}>
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
                                        tickFormatter={month => new Date(month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value, name) => {
                                            const numValue = Number(value);
                                            return [
                                                name === 'utilization_percentage' ? `${value.toLocaleString()}%` : value,
                                                name === 'total_seats' ? (numValue === 1 ? ' Licencia Total' : ' Licencias Totales') :
                                                    name === 'used_seats' ? (numValue === 1 ? ' Licencia Usada' : ' Licencias Usadas') :
                                                        name === 'utilization_percentage' ? ' Utilización (%)' : name
                                            ];
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="utilization_percentage"
                                        stroke="url(#barGradient)"
                                        fill="url(#barGradient)"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-56 flex-col">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-gray-500">No hay datos de Evolución de Utilización</p>
                    </Card>
                )
                }


                {/* Proyecciones Futuras */}
                {data?.projections && data.projections.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Proyecciones (6 meses)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <LineChart width={800} height={224} data={data.projections.map(date => ({ ...date, month: new Date(date.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) }))}>
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
                                        tickFormatter={month => new Date(month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                    />
                                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value, name) => {
                                            const numValue = Number(value);
                                            return [
                                                name === 'projected_cost' ? formatCurrency(numValue) :
                                                    name === 'confidence' ? `${value}%` : value,
                                                name === 'projected_licenses' ? (numValue === 1 ? ' Licencia Proyectada' : ' Licencias Proyectadas') :
                                                    name === 'projected_cost' ? ' Costo Proyectado' :
                                                        name === 'confidence' ? ' Confianza' : name
                                            ];
                                        }}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="projected_licenses"
                                        stroke="url(#barGradient)"
                                        strokeDasharray="5 5"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="confidence"
                                        stroke="url(#barGradient)"
                                        strokeDasharray="3 3"
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-56 flex-col">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-thirdary">No hay datos de Evolución de Utilización</p>
                    </Card>
                )
                }


            </div>
            <div className="md:grid grid-cols-1 lg:grid-cols-2 gap-6 hidden">
                {/* Análisis Estacional */}
                {data?.seasonalAnalysis && data.seasonalAnalysis.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Análisis Estacional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <AreaChart width={800} height={224} data={data.seasonalAnalysis.map(item => ({
                                    ...item,
                                    month_name: new Date(item.month_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                                }))}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month_name"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value, name) => {
                                            const numValue = Number(value);
                                            return [
                                                name === 'total_cost' ? formatCurrency(numValue) : value,
                                                name === 'total_licenses' ? (numValue === 1 ? ' Licencia Total' : ' Licencias Totales') :
                                                    name === 'total_cost' ? 'Costo Total' : name
                                            ];
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total_licenses"
                                        stroke="url(#barGradient)"
                                        fill="url(#barGradient)"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-56 flex-col">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-thirdary">No hay datos de Analisis</p>
                    </Card>
                )
                }
                {/* Comparativa Año a Año */}
                {data?.yearOverYear && data.yearOverYear.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Comparativa Año a Año
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <ComposedChart width={800} height={224} data={data.yearOverYear}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="year"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value, name) => {
                                            const numValue = Number(value);
                                            return [
                                                name === 'total_cost' ? formatCurrency(numValue) : value,
                                                name === 'total_licenses' ? (numValue === 1 ? ' Licencia Total' : ' Licencias Totales') :
                                                    name === 'total_seats' ? (numValue === 1 ? ' Licencia Total' : ' Licencias Totales') :
                                                        name === 'total_cost' ? ' Costo Total' :
                                                            name === 'unique_providers' ? (numValue === 1 ? ' Proveedor Único' : ' Proveedores Únicos') : name
                                            ];
                                        }}
                                    />
                                    <Bar yAxisId="left" dataKey="total_licenses" fill="url(#barGradient)" />
                                    <Line yAxisId="right" type="monotone" dataKey="total_cost" stroke="url(#barGradient)" strokeWidth={2} />
                                </ComposedChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-56 flex-col">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-thirdary">No hay datos de Comparativa</p>
                    </Card>
                )}
            </div>
            {/* Tendencias de Vencimiento */}
            {data?.expirationTrends && data.expirationTrends.length > 0 ? (
                <Card className='hidden md:block'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Tendencias de Vencimiento (Próximos 12 meses)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-56 w-full">
                            <ComposedChart width={800} height={224} data={data.expirationTrends.map(date => ({ ...date, expiration_month: new Date(date.expiration_month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) }))}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="expiration_month"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={month => new Date(month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                <ChartTooltip
                                    content={<ChartTooltipContent />}
                                    formatter={(value, name) => {
                                        const numValue = Number(value);
                                        return [
                                            name === 'expiring_cost' ? formatCurrency(numValue) : value,
                                            name === 'expiring_licenses' ? (numValue === 1 ? ' Licencia que Vence' : ' Licencias que Vencen') :
                                                name === 'expiring_cost' ? ' Costo de Renovación' :
                                                    name === 'expiring_seats' ? (numValue === 1 ? ' Licencia que Vence' : ' Licencias que Vencen') : name
                                        ];
                                    }}
                                />
                                <Bar yAxisId="left" dataKey="expiring_licenses" fill="url(#barGradient)" />
                                <Line yAxisId="right" type="monotone" dataKey="expiring_cost" stroke="url(#barGradient)" strokeWidth={2} />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            ) : (
                <Card className="flex items-center justify-center h-56 flex-col">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-thirdary">No hay datos de vencimiento</p>
                </Card>
            )}
        </div>
    )
}


