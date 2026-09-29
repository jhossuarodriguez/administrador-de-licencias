'use client'

import { useStats } from "@/hooks/useStats"
import { parseDateFromAPI } from "@/lib/hookUtils"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import { useTableControls } from "@/hooks/useTableControls"
import type { SearchableValue } from "@/lib/tableUtils"
import { TablePagination } from "../shared/TablePagination"
import type { ExpiringSoonLicenseSummary } from "@/types/dashboard"

const LICENSE_SEARCH_FIELDS = (item: ExpiringSoonLicenseSummary): SearchableValue[] => [
    item.name,
    item.startDate,
    item.expiration,
]

const formatDate = (date: Date | string | null | undefined) =>
    date ? parseDateFromAPI(date.toString()).toLocaleDateString() : 'No asignado'

export function AboutToExpiredTable() {
    const { stats, isLoading, error } = useStats()

    const {
        filterText, setFilterText,
        currentPage, totalPages, goToPage, pageItems,
        totalItems, filteredCount, hasFilter,
        visibleStart, visibleEnd, visiblePageNumbers,
    } = useTableControls(stats?.expiringSoonNames ?? [], LICENSE_SEARCH_FIELDS)

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
        <div className='overflow-x-auto bg-white shadow-md sm:rounded-lg'>
            <div className="flex flex-col gap-3 border-b bg-white px-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        aria-label="Filtrar licencias"
                        className="pl-9"
                        placeholder="Filtrar por nombre o fecha..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <p className="text-xs text-gray-500">
                    Mostrando <span className="font-medium text-gray-700">{visibleStart}-{visibleEnd}</span> de{' '}
                    <span className="font-medium text-gray-700">{filteredCount}</span>
                </p>
            </div>

            <table className='w-full text-left text-gray-500 table-fixed'>
                <thead className='text-gray-700 uppercase bg-gray-50 text-xs'>
                    <tr>
                        <th className='px-3 py-2 w-2/5 truncate'>Nombre</th>
                        <th className='px-3 py-2'>Inicio</th>
                        <th className='px-3 py-2'>Expira</th>
                        <th className='px-3 py-2'>Días restantes</th>
                    </tr>
                </thead>
                <tbody>
                    {pageItems.length > 0 ? (
                        pageItems.map((license) => (
                            <tr key={license.id} className="border-b border-gray-200 odd:bg-white even:bg-gray-50">
                                <td className="px-3 py-2 truncate" title={license.name}>{license.name}</td>
                                <td className="px-3 py-2">{formatDate(license.startDate)}</td>
                                <td className="px-3 py-2">{formatDate(license.expiration)}</td>
                                <td className="px-3 py-2">{license.daysLeft}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="py-8 md:py-20 text-center text-gray-400">
                                <p className="text-sm">No hay licencias próximas a expirar</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>


            <div className="md:hidden bg-white">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium text-gray-700 md:mx-0 mx-7">
                        {hasFilter ? `${filteredCount} de ${totalItems}` : totalItems} licencias registradas
                    </h3>
                </div>
            </div>

            {filteredCount === 0 && (
                <div className='py-8 text-center text-thirdary'>
                    {hasFilter ? 'No se encontraron licencias con ese filtro' : 'No hay Licencias disponibles'}
                </div>
            )}

            {filteredCount > 0 && (
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    visiblePageNumbers={visiblePageNumbers}
                    onPageChange={goToPage}
                />
            )}
        </div>
    )
}
