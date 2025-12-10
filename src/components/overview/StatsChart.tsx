'use client'

import { useStats, chartConfig } from "@/hooks/useStats";

import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis
} from "recharts"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import {
    Card,
} from "@/components/ui/card"

export function StatsChart() {
    const { stats, isLoading, error } = useStats()

    if (isLoading) {
        return (
            <div className='hidden overflow-x-auto bg-white sm:rounded-lg'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-2'>Cargando estadisticas...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='hidden overflow-x-auto bg-white shadow-md sm:rounded-lg md:block'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-5 text-sm'>Error al cargar estadisticas, por favor, intenta de nuevo.</span>
                </div>
            </div>
        )
    }

    const usageValues = stats?.chartData?.map(d => d.usage).filter(val => !isNaN(val) && val > 0) || [0]
    const maxUso = usageValues.length > 0 ? Math.max(...usageValues) : 0
    const totalUso = stats?.chartData?.reduce((sum, d) => sum + (isNaN(d.usage) ? 0 : d.usage), 0) || 0

    return (
        <div className="relative p-4 bg-white rounded-xl lg:col-span-4 md:p-6 hidden md:block overflow-hidden animate-fade-in animate-delay-500">
            {/* decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className='flex flex-col items-start justify-center relative z-10'>
                <div className="flex items-center gap-3 mb-7 relative z-10">
                    <div className="w-1 h-7 rounded-full bg-secondary" />
                    <h3 className='font-semibold text-secondary flex items-center gap-2 text-2xl'>
                        Estadística de Uso de Licencias
                    </h3>
                </div>
                <ul className='flex flex-wrap gap-2 mb-4 text-xs text-gray-500 md:gap-4 lg:gap-4 md:text-sm'>
                    <li>Total Usuarios: {stats?.licenses.totalUsers || 0}</li>
                    <li>Total Licencias: {stats?.licenses.totalLicenses || 0}</li>
                    <span className="hidden md:block">|</span>
                    <li>Uso Total: {totalUso.toLocaleString()} usuarios</li>
                    <li>Pico Máximo: {maxUso.toLocaleString()} usuarios por mes</li>
                </ul>
                <Card className='w-full border-borderPrimary'>
                    <ChartContainer config={chartConfig} className="h-[150px] md:h-[200px] lg:h-[250px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={stats?.chartData || []}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                                tick={{ fontSize: 12 }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Line
                                dataKey="usage"
                                type="monotone"
                                stroke="url(#barGradient)"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </Card>
            </div>
        </div>
    )
}