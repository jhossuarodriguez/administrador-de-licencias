'use client'

import type { User } from '@/types/user'

interface UserCardProps {
    user: User
    isAdmin: boolean
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}

export function UserCard({ user, isAdmin, onEdit, onDelete }: UserCardProps) {
    const assignedLicense = user.Assignment?.[0]

    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                        {user.name}
                    </h4>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            <div className="mb-3 space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Departamento:</span>
                    <span className="text-gray-900">{user.department?.name || 'No asignado'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Licencia:</span>
                    <span className="text-gray-900 text-right">
                        {assignedLicense
                            ? `${assignedLicense.license.provider} ${assignedLicense.license.model || ''}`
                            : 'Sin asignar'
                        }
                    </span>
                </div>
            </div>

            {isAdmin && (
                <div className="flex flex-col gap-2">
                    <button type="button"
                        className="w-full py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
                        onClick={() => onEdit(user.id)}
                    >
                        Editar Usuario
                    </button>
                    <button type="button"
                        className="w-full py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
                        onClick={() => onDelete(user.id)}
                    >
                        Eliminar Usuario
                    </button>
                </div>
            )}
        </div>
    )
}
