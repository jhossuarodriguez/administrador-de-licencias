'use client'

import type { User } from '@/types/user'

interface UserTableRowProps {
    user: User
    isAdmin: boolean
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

export function UserTableRow({ user, isAdmin, onEdit, onDelete }: UserTableRowProps) {
    const assignedLicense = user.Assignment?.[0]

    return (
        <tr className="border-b border-gray-200 odd:bg-white even:bg-gray-50">
            <td className="px-6 py-4">{user.name}</td>
            <td className="px-6 py-4">{user.username}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td className="px-6 py-4">{user.department?.name || 'No asignado'}</td>
            <td className="px-6 py-4">
                {assignedLicense
                    ? `${assignedLicense.license.provider} ${assignedLicense.license.model || ''}`
                    : 'Sin asignar'
                }
            </td>
            {isAdmin && (
                <td className="px-6 py-4 flex gap-3 justify-center">
                    <button type="button" className="cursor-pointer text-secondary hover:underline" onClick={() => onEdit(user.id)}>
                        Editar
                    </button>
                    |
                    <button type="button" className="cursor-pointer text-red-500/60 hover:underline" onClick={() => onDelete(user.id)}>
                        Eliminar
                    </button>
                </td>
            )}
        </tr>
    )
}
