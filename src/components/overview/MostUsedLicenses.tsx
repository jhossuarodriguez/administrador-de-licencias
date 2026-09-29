'use client'

import { Progress } from "@/components/ui/progress"
import { useStats } from "@/hooks/useStats"
import { AlertTriangle } from "lucide-react"


export function MostUsedLicenses() {
    const { stats, isLoading, error } = useStats()

    if (isLoading) {
        return (
            <div className="p-4 bg-white border border-gray-200  rounded-xl lg:col-span-2 md:p-6">
                <div className="animate-pulse">
                    <div className="h-6 mb-4 bg-gray-200 rounded"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i}>
                                <div className="h-4 mb-2 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-white border border-gray-200 rounded-xl lg:col-span-2 md:p-6">
                <header className='mb-4 text-lg font-bold md:text-2xl text-secondary'>
                    Más Usadas
                </header>
                <div className="py-4 text-sm text-center text-red-500">
                    Error al cargar datos
                </div>
            </div>
        )
    }

    const licenses = stats?.mostUsed || []

    return (
        <div className="p-4 bg-white rounded-xl lg:col-span-2 md:p-6 animate-fade-in animate-delay-700">
            <div className='flex flex-col h-full'>
                <div className="flex items-center gap-3 mb-7 relative z-10 ">
                    <div className="w-1 h-7 rounded-full bg-secondary" />
                    <h3 className='font-semibold text-secondary flex items-center gap-2 text-2xl'>
                        Más Usadas
                    </h3>
                </div>
                <div className='flex-1'>
                    <ul className='flex flex-col space-y-3 text-sm text-gray-500 md:space-y-4 mt-5'>
                        {licenses?.map((license: { name: string; usage: number; percentage: number }) => (
                            <li key={license.name} className='flex flex-col gap-y-2'>
                                <div className="flex items-center justify-between">
                                    <span className='text-sm md:text-base'>{license.name}</span>
                                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-50 text-secondary border border-blue-200">
                                        {license.percentage}%
                                    </span>
                                </div>
                                <Progress
                                    value={license.percentage}
                                    className="w-full h-2 md:h-3"
                                />
                            </li>
                        ))}
                        {licenses.length === 0 && (
                            <div className="py-8 md:py-20 text-center text-gray-400">
                                <AlertTriangle className="size-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No hay licencias próximas a expirar</p>
                            </div>
                        )}
                    </ul>
                </div>
            </div >
        </div >
    )
}