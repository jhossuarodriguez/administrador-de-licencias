'use client'

import { useCustomReportBuilder } from "@/hooks/useCustomReportBuilder"
import { FileText } from "lucide-react"

export default function SavedReports() {
    const { savedReports, savedReportsLoading, savedReportsError } = useCustomReportBuilder()

    if (savedReportsLoading) {
        return (
            <div className='flex flex-col mx-4 mt-0 md:mt-20 md:mx-7'>
                <div className='hidden overflow-x-auto bg-white sm:rounded-lg'>
                    <div className='flex items-center justify-center h-32 mt-5'>
                        <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                        <span className='ml-2'>Cargando reportes...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (savedReportsError) {
        return (
            <div className='flex flex-col mx-4 mt-0 md:mt-20 md:mx-7'>
                <div className='hidden overflow-x-auto bg-white shadow-md sm:rounded-lg md:block'>
                    <div className='flex items-center justify-center h-32 mt-5'>
                        <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                        <span className='ml-5'>Error al cargar reportes: {savedReportsError}</span>
                    </div>
                </div>
            </div>
        )
    }

    const handleViewReport = (reportId: number) => {
        console.log('Viewing report:', reportId)
        // Aquí puedes agregar navegación o lógica para ver el reporte
    }

    const handleEditReport = (reportId: number) => {
        console.log('Editing report:', reportId)
        // Aquí puedes agregar lógica para editar el reporte
    }

    return (
        <div className='flex flex-col mx-4 mt-0 md:mt-20 md:mx-7'>
            <header className="text-2xl font-bold mb-10 mt-10">Todos los Reportes</header>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-10 h-10 bg-gray-100">
                    <FileText className="size-6" />
                </div>
                {/* Vista Desktop - Tabla */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm text-center text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Descripción</th>
                                <th className="px-6 py-3">Métricas</th>
                                <th className="px-6 py-3">Gráfico</th>
                                <th className="px-6 py-3">Fecha Creación</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedReports?.map((report) => (
                                <tr key={report.id}
                                    className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">{report.name}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">
                                        {report.description || 'Sin descripción'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            {report.config.metrics.length} métricas
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                            {report.config.chartType || 'No definido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Sin fecha'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                className="cursor-pointer text-primary hover:underline"
                                                onClick={() => handleViewReport(report.id)}
                                            >
                                                Ver
                                            </button>
                                            <button
                                                className="cursor-pointer text-secondary hover:underline"
                                                onClick={() => handleEditReport(report.id)}
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Vista Mobile - Tarjetas */}
                <div className="md:hidden bg-white">
                    <div className="p-4 bg-gray-50 border-b">
                        <h3 className="text-sm font-medium text-gray-700">
                            {savedReports?.length || 0} reportes guardados
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {savedReports?.map((report) => (
                            <div key={report.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                        {report.name}
                                    </h4>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Sin fecha'}
                                    </span>
                                </div>

                                {report.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {report.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        {report.config.metrics.length} métricas
                                    </span>
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                        {report.config.chartType || 'No definido'}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 py-2 text-sm text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
                                        onClick={() => handleViewReport(report.id)}
                                    >
                                        Ver Reporte
                                    </button>
                                    <button
                                        className="flex-1 py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
                                        onClick={() => handleEditReport(report.id)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {savedReports?.length === 0 && (
                    <div className='py-8 text-center text-primary'>
                        No hay reportes guardados
                    </div>
                )}
            </div>
        </div>
    )
}