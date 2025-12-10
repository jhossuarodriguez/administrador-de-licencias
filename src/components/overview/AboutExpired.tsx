'use client'

import { useStats } from "@/hooks/useStats";
import { Clock } from 'lucide-react';


export function AboutExpired() {
    const { stats, isLoading, error } = useStats()

    const getClockColor = (daysLeft: number) => {
        if (daysLeft < 10) {
            return 'bg-red-500/80 shadow-[0_6px_18px_-6px_rgba(239,68,68,0.7)] group-hover:shadow-[0_8px_22px_-6px_rgba(239,68,68,0.85)]'
        } else if (daysLeft < 30) {
            return 'bg-[#F3A453]/80 shadow-[0_6px_18px_-6px_rgba(243,164,83,0.7)] group-hover:shadow-[0_8px_22px_-6px_rgba(243,164,83,0.85)]'
        } else {
            return 'bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)] group-hover:shadow-[0_8px_22px_-6px_rgba(68,173,226,0.85)]'
        }
    }

    const getBadgeColor = (daysLeft: number) => {
        if (daysLeft < 10) {
            return 'bg-red-50 text-red-600 border border-red-200'
        } else if (daysLeft < 30) {
            return 'bg-orange-50 text-[#F3A453] border border-orange-200'
        } else {
            return 'bg-blue-50 text-secondary border border-blue-200'
        }
    }

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
    const expiringNames = stats?.expiringSoonNames || []

    return (
        <div className="p-4 bg-white rounded-xl lg:col-span-2 animate-fade-in animate-delay-800">
            <div className="flex items-center gap-3 mb-7 relative z-10">
                <div className="w-1 h-7 rounded-full bg-secondary" />
                <h3 className='font-semibold text-secondary flex items-center gap-2 text-2xl'>
                    Próximas a expirar
                </h3>
            </div>
            <div className="mt-4">
                {expiringNames?.length > 0 ? (
                    <div className="space-y-0">
                        {expiringNames.map((license, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 transition-colors px-2 rounded group"
                                >
                                    <span className="flex items-center gap-2 text-gray-700 text-sm md:text-base font-medium">
                                        <Clock className={`rounded-xl p-2.5 size-9 text-white transition-all duration-300 ${getClockColor(license.daysLeft)}`} />
                                        {license.name}
                                    </span>
                                    <span className={`text-sm w-20 md:w-auto px-3 py-1 rounded-full ${getBadgeColor(license.daysLeft)}`}>
                                        {license.daysLeft} {license.daysLeft === 1 ? 'día' : 'días'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 md:py-20 text-center text-gray-400">
                        <Clock className="size-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No hay licencias próximas a expirar</p>
                    </div>
                )}
            </div>
        </div>
    )
}