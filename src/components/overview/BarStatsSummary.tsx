'use client'

import { useStats, chartConfig } from "@/hooks/useStats";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import {
    CartesianGrid,
    XAxis,
    Bar,
    BarChart
} from "recharts"

export function BarStatsSummary() {
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

    return (
        <div className="hidden md:block relative p-4 pb-2 bg-white rounded-xl lg:col-span-4 overflow-hidden animate-fade-in animate-delay-700">
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3 mb-7 relative z-10 mx-5 mt-5">
                <div className="w-1 h-7 rounded-full bg-secondary" />
                <h3 className='font-semibold text-secondary flex items-center gap-2 text-2xl'>
                    Uso Mensual
                </h3>
            </div>
            <ChartContainer config={chartConfig} className="h-[180px] md:h-[220px] lg:h-[280px] w-full !aspect-auto">
                <BarChart accessibilityLayer data={stats?.chartData}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#44ADE2" stopOpacity={1} />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.90} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeOpacity={0.05} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                        tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="usage" fill="url(#barGradient)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}