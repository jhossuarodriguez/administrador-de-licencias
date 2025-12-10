'use client'

import { useCosts } from '@/hooks/useCosts';
import { formatCurrency } from '@/lib/utils';

export function CostosTable() {
    const { costs, error, isLoading } = useCosts()

    if (isLoading) {
        return (
            <div className='hidden overflow-x-auto bg-white sm:rounded-lg'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-2'>Cargando Costos...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='hidden overflow-x-auto bg-white shadow-md sm:rounded-lg md:block'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-5'>Error al cargar costos, por favor, intenta de nuevo.</span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {/* Vista Desktop - Tabla */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm text-center text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Costo Unitario</th>
                            <th className="px-6 py-3">Costo x Instalacion</th>
                            <th className="px-6 py-3">Costo x Penalidad</th>
                            <th className="px-6 py-3">Ciclo de Facturacion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {costs?.slice(0, 10).map((license) => (
                            <tr key={license.id}
                                className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                            >
                                <td className="px-6 py-4">{formatCurrency(license.unitCost)}</td>
                                <td className="px-6 py-4">{formatCurrency(license.installmentCost)}</td>
                                <td className="px-6 py-4">{formatCurrency(license.penaltyCost)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-10 py-1 rounded-full text-xs ${license.billingCycle === 'MONTHLY'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {license.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}
                                    </span>
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
                        Costos de Licencias ({costs?.length || 0})
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {costs?.slice(0, 10).map((license) => (
                        <div key={license.id} className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-900 text-sm">
                                    Licencia #{license.id}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs ${license.billingCycle === 'MONTHLY'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {license.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Costo Unitario:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(license.unitCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Costo x Instalación:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(license.installmentCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Costo x Penalidad:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(license.penaltyCost)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {costs?.length === 0 && (
                <div className='py-8 text-center text-thirdary'>
                    No hay costos disponibles
                </div>
            )}
        </div>

    )
}
