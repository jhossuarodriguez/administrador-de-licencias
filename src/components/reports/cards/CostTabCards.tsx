'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calculator, Circle, DollarSign, Target, TrendingDown, TrendingUp } from "lucide-react";
import { useSummary } from "@/hooks/useSummary";
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';


const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value);
};
const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
};


const getCostEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
};
const getCostTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <div className="h-4 w-4" />;
};


export function CostCards() {
    const { data, isLoading, error } = useSummary()

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
            <div className="p-4 bg-white border border-gray-200 rounded-xl lg:col-span-2 md:p-6">
                <div className="py-4 text-sm text-center text-red-500">
                    Error al cargar datos
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Costo Mensual */}
            <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                    <DollarSign className="rounded-xl p-2.5 size-11 text-white bg-blue-500 shadow-[0_6px_18px_-6px_rgba(59,130,246,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(59,130,246,0.85)]" />
                </CardHeader>
                <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                    <p className="text-xl leading-tight text-gray-500">Costo Mensual</p>
                    <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary overflow-hidden">
                        {data?.summary ? formatCurrency(data?.summary.monthlyCost ?? 0) : formatCurrency(0)}
                    </div>
                    <div className="hidden md:flex text-xs md:text-sm text-thirdary items-center leading-tight mt-2">
                        {getCostTrendIcon(data?.summary?.monthlyTrend || 0)}
                        <span className="ml-2">
                            {data?.summary?.monthlyTrend ?
                                `${data.summary.monthlyTrend > 0 ? '+' : ''}${data.summary.monthlyTrend.toFixed(1)}% vs mes anterior` :
                                'Sin datos de tendencia'
                            }
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Basado en tendencias  */}
            <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                    <Circle className="rounded-xl p-2.5 size-11 text-white bg-purple-500 shadow-[0_6px_18px_-6px_rgba(168,85,247,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(168,85,247,0.85)]" />
                </CardHeader>
                <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                    <p className="text-xl leading-tight text-gray-500">Proyección Anual</p>
                    <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary overflow-hidden">
                        {data?.summary ? formatCurrency(data?.summary.annualProjection ?? 0) : formatCurrency(0)}
                    </div>
                    <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                        <span>Basado en tendencias</span>
                    </p>
                </CardContent>
            </Card>

            {/* Ahorros Potenciales */}
            <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                    <Calculator className="rounded-xl p-2.5 size-11 text-white bg-green-500 shadow-[0_6px_18px_-6px_rgba(34,197,94,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(34,197,94,0.85)]" />
                </CardHeader>
                <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                    <p className="text-xl leading-tight text-gray-500">Ahorros Potenciales</p>
                    <div className="text-2xl md:text-4xl font-bold mt-1.5 text-green-600 overflow-hidden">
                        {data?.summary ? formatCurrency(data?.summary.potentialSavings || 0) : formatCurrency(0)}
                    </div>
                    <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                        <span>Por optimización</span>
                    </p>
                </CardContent>
            </Card>

            {/* Eficiencia de Costo */}
            <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                    <Target className="rounded-xl p-2.5 size-11 text-white bg-orange-500 shadow-[0_6px_18px_-6px_rgba(249,115,22,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(249,115,22,0.85)]" />
                </CardHeader>
                <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                    <p className="text-xl leading-tight text-gray-500">Eficiencia de Costo</p>
                    <div className={`text-2xl md:text-4xl font-bold mt-1.5 overflow-hidden ${getCostEfficiencyColor(data?.summary?.utilizationRate || 0)}`}>
                        {data?.summary ? formatPercentage(data?.summary.utilizationRate ?? 0) : '0%'}
                    </div>
                    <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                        <span>Utilización promedio</span>
                    </p>
                </CardContent>
            </Card>
        </div>

    )
}