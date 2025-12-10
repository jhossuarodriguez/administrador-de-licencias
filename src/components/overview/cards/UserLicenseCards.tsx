'use client'

import { useStats } from "@/hooks/useStats"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Users, Key, CircleCheckBig, CircleAlert, Minus } from "lucide-react"

export function UserLicenseCards() {
    const { stats, isLoading, error } = useStats()

    // Función helper para formatear tendencias
    const formatTrend = (change: number) => {
        return change === 0
            ? {
                icon: Minus,
                colorClass: "text-gray-500",
                text: "0%",
                message: "Sin cambios este mes"
            }
            : change > 0
                ? {
                    icon: ArrowUp,
                    colorClass: "text-[#73B060]",
                    text: `+${change}%`,
                    message: `Arriba ${change}% este mes`
                }
                : {
                    icon: ArrowDown,
                    colorClass: "text-red-500",
                    text: `${change}%`,
                    message: `Abajo ${Math.abs(change)}% este mes`
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
            <div className="p-4 bg-white border border-gray-200 rounded-xl lg:col-span-2 md:p-6">
                <div className="py-4 text-sm text-center text-red-500">
                    Error al cargar datos
                </div>
            </div>
        )
    }
    const expiringSoon = stats?.licenses.expiringSoon ?? 0
    const expired = stats?.licenses.expired ?? 0
    const activeUsers = stats?.licenses.activeUsers ?? 0
    const totalLicense = stats?.licenses.totalLicenses ?? 0
    const totalUsers = stats?.licenses.totalUsers ?? 0

    // Combinar licencias por expirar y ya expiradas
    const expiringAndExpired = expiringSoon + expired

    // Obtener tendencias
    const totalUsersTrend = formatTrend(stats?.trends?.totalUsersChange ?? 0)
    const totalLicensesTrend = formatTrend(stats?.trends?.totalLicensesChange ?? 0)
    // Usar totalUsersChange como aproximación para activeUsersChange
    const activeUsersTrend = formatTrend(stats?.trends?.totalUsersChange ?? 0)
    // No hay datos de expiringChange en la API, usar 0 por defecto
    const expiringTrend = formatTrend(0)

    return (

        <div className="grid grid-cols-2 gap-4 mb-10 md:flex md:flex-row md:justify-between md:items-center">

            {/* Total de usuarios */}
            <Card className="relative flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4 overflow-hidden animate-fade-in animate-delay-150">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-success/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-0 md:mb-3 relative z-10">
                    <Users
                        className="rounded-xl p-2.5 size-9 md:size-11 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(68,173,226,0.85)]"
                    />
                </CardHeader>

                <CardContent className="pt-2 md:pt-3 px-4 flex-1 flex flex-col justify-between relative z-10">
                    <p className="text-lg md:text-xl leading-tight text-gray-500">Total Usuarios</p>
                    <span className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">{totalUsers.toLocaleString()}</span>
                    <div
                        className={`text-xs md:text-sm flex items-center justify-between leading-tight mt-2 ${totalUsersTrend.colorClass}`}
                    >
                        <div className="hidden md:flex flex-row items-center">
                            <totalUsersTrend.icon className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span>{totalUsersTrend.message}</span>
                        </div>


                        <div
                            className={`rounded-xl py-1 px-2.5 bg-gray-300/10 flex items-center justify-center text-xs whitespace-nowrap ${totalUsersTrend.colorClass}`}
                        >
                            <totalUsersTrend.icon className="mr-1 size-5" />
                            {totalUsersTrend.text}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total de licencias */}
            <Card className="relative flex flex-col w-full h-[175px] md:h-56 rounded-xl  transition-shadow duration-150 gap-0 py-4 overflow-hidden animate-fade-in animate-delay-250">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-success/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-0 md:mb-3 relative z-10">
                    <Key className="rounded-xl p-2.5 size-9 md:size-11 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(68,173,226,0.85)]" />
                </CardHeader>

                <CardContent className="pt-2 md:pt-3 px-4 flex-1 flex flex-col justify-between relative z-10">
                    <p className="text-lg md:text-xl leading-tight text-gray-500">Total Licencias</p>
                    <div className="text-2xl md:text-4xl font-bold text-secondary">{totalLicense}</div>
                    <div className={`text-xs md:text-sm flex items-center justify-between leading-tight mt-2 ${totalLicensesTrend.colorClass}`}>

                        <div className="hidden md:flex flex-row items-center">
                            <totalLicensesTrend.icon className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span>{totalLicensesTrend.message}</span>
                        </div>

                        <div className={`rounded-full py-1 px-2.5 bg-gray-300/10 flex items-center text-xs  whitespace-nowrap ${totalLicensesTrend.colorClass}`}>
                            <totalLicensesTrend.icon className="mr-1 size-5" />
                            {totalLicensesTrend.text}
                        </div>
                    </div>
                </CardContent>
            </Card >

            {/* Usuarios que estan activos */}
            < Card className="relative flex flex-col w-full h-[175px] md:h-56 rounded-xl  transition-shadow duration-150 gap-0 py-4 overflow-hidden animate-fade-in animate-delay-300" >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-success/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-0 md:mb-3 relative z-10">
                    <CircleCheckBig className="rounded-xl p-2.5 size-9 md:size-11 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(68,173,226,0.85)]" />
                </CardHeader>

                <CardContent className="pt-2 md:pt-3 px-4 flex-1 flex flex-col justify-between relative z-10">
                    <p className="text-lg md:text-xl leading-tight text-gray-500"><span className="hidden md:block">Usuarios Activos</span></p>
                    <span className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">{activeUsers.toLocaleString()}</span>
                    <div className={`text-xs md:text-sm flex items-center justify-between leading-tight mt-2 ${activeUsersTrend.colorClass}`}>

                        <div className="hidden md:flex flex-row items-center">
                            <activeUsersTrend.icon className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span>{activeUsersTrend.message}</span>
                        </div>

                        <div className={`rounded-full py-1 px-2.5 bg-gray-300/10 flex items-center text-xs  whitespace-nowrap ${activeUsersTrend.colorClass}`}>
                            <activeUsersTrend.icon className="mr-1 size-5" />
                            {activeUsersTrend.text}
                        </div>
                    </div>
                </CardContent>
            </Card >

            {/* Licencias que expiran pronto y ya expiradas */}
            < Card className="relative flex flex-col w-full h-[175px] md:h-56 rounded-xl  transition-shadow duration-150 gap-0 py-4 overflow-hidden animate-fade-in animate-delay-400" >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-success/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-0 md:mb-3 relative z-10">
                    <CircleAlert className="rounded-xl p-2.5 size-9 md:size-11 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(68,173,226,0.85)]" />
                </CardHeader>

                <CardContent className="pt-2 md:pt-3 px-4 flex-1 flex flex-col justify-between overflow-hidden relative z-10">
                    <p className="text-lg md:text-xl leading-tight text-gray-500 md:block hidden">Por expirar y expiradas</p>
                    <div className="flex flex-col">
                        <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">{expiringAndExpired.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-3">
                            Por expirar: {expiringSoon} | Expiradas: {expired}
                        </div>
                    </div>
                    <div className={`hidden md:flex text-xs md:text-sm items-center justify-between leading-tight  ${activeUsersTrend.colorClass}`}>
                        <div className="flex flex-row items-center">
                            <activeUsersTrend.icon className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span>{activeUsersTrend.message}</span>
                        </div>

                        <div className={`rounded-full py-1 px-2.5 bg-gray-300/10 flex items-center text-xs  whitespace-nowrap ${expiringTrend.colorClass}`}>
                            <expiringTrend.icon className="mr-1 size-5" />
                            {expiringTrend.text}
                        </div>
                    </div>
                </CardContent>
            </Card >
        </div >
    )
}