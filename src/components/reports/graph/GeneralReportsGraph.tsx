'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useSummary, chartConfig } from "@/hooks/useSummary"
import { ReportFilters, CHART_COLORS } from "@/hooks/useReportTypes";
import { AlertTriangle, Building, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

interface GeneralReportsGraphProps {
    filters?: ReportFilters;
}

export function GeneralReportsGraph({ filters }: GeneralReportsGraphProps) {
    const { data, isLoading, error } = useSummary(filters)

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
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

    if (error || !data) {
        return <div>Error al cargar datos</div>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Distribución por Proveedor */}
            {
                data.licensesByProvider && data.licensesByProvider.length > 0 ? (
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-thirdary">
                                <Building className="h-5 w-5 text-secondary" />
                                Distribución por Proveedor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <PieChart width={400} height={224}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        data={data.licensesByProvider as { provider: string; _count: { id: number } }[]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="_count.id"
                                        nameKey="provider"
                                        label={({ provider, percent }: any) => `${provider}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.licensesByProvider.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value: any, name: any, props: any) => {
                                            return [
                                                `${value} ${Number(value) === 1 ? 'licencia' : 'licencias'}`,
                                                props.payload.provider
                                            ];
                                        }}
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-56 flex-col rounded-xl shadow-sm">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-thirdary">No hay datos de licencias por proveedor</p>
                    </Card>
                )
            }

            {/* Utilización por Departamento */}
            {
                data?.utilizationByDept && data.utilizationByDept.length > 0 ? (
                    <Card className="hidden md:block rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-thirdary">
                                <Users className="h-5 w-5 text-secondary" />
                                Utilización por Departamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-5">
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <BarChart width={800} height={224} data={data?.utilizationByDept}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="departmentName"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value, name) => {
                                            const numValue = Number(value);
                                            const label = numValue === 1 ? ' Licencia Utilizada' : ' Licencias Utilizadas';
                                            return [
                                                value,
                                                name === '_sum.usedLicense' ? label : name
                                            ];
                                        }}
                                    />
                                    <Bar dataKey="_sum.usedLicense" fill="url(#barGradient)" />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-56 flex-col rounded-xl shadow-sm">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-thirdary">No hay datos de licencias</p>
                    </Card>
                )
            }
        </div>
    )
}