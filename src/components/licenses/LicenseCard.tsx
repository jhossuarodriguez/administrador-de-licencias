'use client'

import { parseDateFromAPI } from '@/lib/hookUtils'
import type { License } from '@/types/license'

interface LicenseCardProps {
    license: License
    isAdmin: boolean
    onEdit: (id: number) => void
}

const formatDate = (date: Date | string | null | undefined) =>
    date ? parseDateFromAPI(date.toString()).toLocaleDateString() : 'No asignado'

export function LicenseCard({ license, isAdmin, onEdit }: LicenseCardProps) {
    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                        {license.provider}
                    </h4>
                    <p className="text-xs text-gray-500">{license.model}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {license.sede}
                </span>
            </div>

            <div className="mb-3 space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Inicio:</span>
                    <span className="text-gray-900">{formatDate(license.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expiración:</span>
                    <span className="text-gray-900">{formatDate(license.expiration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Asignado:</span>
                    <span className="text-gray-900">{license.assigned || 'No asignado'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Responsable:</span>
                    <span className="text-gray-900">{license.department?.name || 'No asignado'}</span>
                </div>
            </div>

            {isAdmin && (
                <button
                    className="w-full py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
                    onClick={() => onEdit(license.id)}
                >
                    Editar Licencia
                </button>
            )}
        </div>
    )
}
