'use client'

import { parseDateFromAPI } from '@/lib/hookUtils'
import type { License } from '@/types/license'

interface LicenseTableRowProps {
    license: License
    isAdmin: boolean
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

const formatDate = (date: Date | string | null | undefined) =>
    date ? parseDateFromAPI(date.toString()).toLocaleDateString() : 'No asignado'

export function LicenseTableRow({ license, isAdmin, onEdit, onDelete }: LicenseTableRowProps) {
    return (
        <tr className="border-b border-gray-200 odd:bg-white even:bg-gray-50">
            <td className="px-6 py-4">{license.totalLicense}</td>
            <td className="px-6 py-4">{license.sede}</td>
            <td className="px-6 py-4">{license.provider}</td>
            <td className="px-6 py-4">{formatDate(license.startDate)}</td>
            <td className="px-6 py-4">{formatDate(license.expiration)}</td>
            <td className="px-6 py-4">{license.assigned || 'No asignado'}</td>
            <td className="px-6 py-4">{license.department?.name || 'No asignado'}</td>
            <td className="px-6 py-4">{license.plan ||'No asignado'}</td>
            <td className="px-6 py-4">{license.model}</td>
            {isAdmin && (
                <td className="px-6 py-4 flex gap-2 justify-center">
                    <button type="button" className="cursor-pointer text-secondary hover:underline" onClick={() => onEdit(license.id)}>
                        Editar
                    </button>
                    |
                    <button type="button" className="cursor-pointer text-red-500/60 hover:underline" onClick={() => onDelete(license.id)}>
                        Eliminar
                    </button>
                </td>
            )}
        </tr>
    )
}
