'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsers } from '@/hooks/useUsers'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { CheckCircle, UserPlus, Info, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { Department } from '@/types/department'
import type { License } from '@/types/license'

const INITIAL_CONFIG = {
    name: '',
    username: '',
    departmentId: null as number | null,
    status: 'active',
    role: 'user',
    plan: '',
}

export function AddUserDialog({ departments, licenses }: { departments: Department[]; licenses: License[] }) {
    const { handleAddUser } = useUsers()
    const [saving, setSaving] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState(INITIAL_CONFIG)

    useEscapeKey(isOpen, () => setIsOpen(false))

    const openModal = () => {
        setConfig(INITIAL_CONFIG)
        setIsOpen(true)
    }

    const closeModal = () => setIsOpen(false)

    const handleSubmit = async () => {
        try {
            setSaving(true)
            await handleAddUser(config)
            closeModal()
        } catch (error) {
            console.error('Error al agregar usuario:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <Button className="cursor-pointer" onClick={openModal}>
                Agregar usuario
            </Button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <UserPlus className="h-6 w-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">
                                        Agregar Usuario
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre Completo</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Nombre completo"
                                            value={config.name}
                                            onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Nombre de Usuario</Label>
                                        <Input
                                            id="username"
                                            name="username"
                                            placeholder="Nombre de usuario"
                                            value={config.username}
                                            onChange={(e) => setConfig((prev) => ({ ...prev, username: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Departamento</Label>
                                        <select
                                            id="department"
                                            name="department"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={config.departmentId || ''}
                                            onChange={(e) =>
                                                setConfig((prev) => ({
                                                    ...prev,
                                                    departmentId: e.target.value ? parseInt(e.target.value) : null,
                                                }))
                                            }
                                        >
                                            <option value="">Seleccionar departamento</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Estado</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={config.status}
                                            onChange={(e) => setConfig((prev) => ({ ...prev, status: e.target.value }))}
                                        >
                                            <option value="active">Activo</option>
                                            <option value="inactive">Inactivo</option>
                                            <option value="suspended">Suspendido</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Rol</Label>
                                        <select
                                            id="role"
                                            name="role"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={config.role}
                                            onChange={(e) => setConfig((prev) => ({ ...prev, role: e.target.value }))}
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="plan">Licencias disponibles</Label>
                                        <select
                                            id="plan"
                                            name="plan"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={config.plan || ''}
                                            onChange={(e) => setConfig((prev) => ({ ...prev, plan: e.target.value }))}
                                        >
                                            <option value="">Seleccionar licencia</option>
                                            {licenses
                                                .filter((license) => license.plan && license.active)
                                                .map((license) => (
                                                    <option key={license.id} value={license.plan ?? ''}>
                                                        {license.provider} - {license.plan} {license.model ? `(${license.model})` : ''}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium text-secondary mb-1">
                                            Información del Usuario
                                        </p>
                                        <p className="text-xs text-secondary">
                                            Asegúrate de que todos los campos estén completos antes de agregar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={closeModal}
                                    className="cursor-pointer"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="cursor-pointer"
                                    disabled={saving || !config.name.trim() || !config.username.trim()}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Agregando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Agregar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
