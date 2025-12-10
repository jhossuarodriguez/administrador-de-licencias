'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UsersTable } from "@/components/users/UsersTable"
import { useLicenses } from "@/hooks/useLicense"
import { useUsers } from "@/hooks/useUsers"
import { useDepartments } from "@/hooks/useDepartments"
import { CheckCircle, UserPlus, Info, RefreshCw } from "lucide-react"
import { useState } from "react"

export default function UsersPage() {
    const { users, isLoading: usersLoading, handleAddUser } = useUsers()
    const { license: licenses, isLoading: licensesLoading } = useLicenses()
    const { departments, isLoading: depsLoading } = useDepartments(true)

    const [saving, setSaving] = useState(false)

    const [userLicensesConfig, setUserLicensesConfig] = useState({
        plan: '',
    });

    const [userConfig, setUserConfig] = useState({
        name: "",
        username: "",
        departmentId: null as number | null,
        status: "active",
        role: "user",
        plan: ''
    })

    // Modal
    const [addModalOpen, setAddModalOpen] = useState(false)

    const addOpenModal = () => {
        setAddModalOpen(true)
        setUserConfig({
            name: "",
            username: "",
            departmentId: null,
            status: "active",
            role: "user",
            plan: ''
        })
    }

    const closeAddModal = () => {
        setAddModalOpen(false)
    }

    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6 mb-5 md:mb-10 animate-fade-in animate-delay-100">
            <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
                <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                    <header className="text-2xl font-bold">Total de usuarios</header>
                    <p className="mt-1 text-gray-600 hidden md:block">
                        Administra los usuarios registrados en el sistema desde esta sección.
                    </p>
                </div>

                <Button className="cursor-pointer" onClick={addOpenModal}>
                    Agregar usuario
                </Button>
            </div>

            <UsersTable />

            {addModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
                    onClick={closeAddModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <UserPlus className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">
                                        Agregar Usuario
                                    </h3>
                                </div>
                            </div>

                            {/* Campos */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre Completo</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Ej: Juan Pérez"
                                            value={userConfig.name}
                                            onChange={(e) =>
                                                setUserConfig((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Nombre de Usuario</Label>
                                        <Input
                                            id="username"
                                            name="username"
                                            placeholder="Ej: juanperez"
                                            value={userConfig.username}
                                            onChange={(e) =>
                                                setUserConfig((prev) => ({
                                                    ...prev,
                                                    username: e.target.value,
                                                }))
                                            }
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
                                            value={userConfig.departmentId || ''}
                                            onChange={(e) =>
                                                setUserConfig((prev) => ({
                                                    ...prev,
                                                    departmentId: e.target.value ? parseInt(e.target.value) : null,
                                                }))
                                            }
                                            disabled={depsLoading}
                                        >
                                            <option value="">Seleccionar departamento</option>
                                            {depsLoading ? (
                                                <option disabled>Cargando opciones...</option>
                                            ) : (
                                                departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Estado</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={userConfig.status}
                                            onChange={(e) =>
                                                setUserConfig((prev) => ({
                                                    ...prev,
                                                    status: e.target.value,
                                                }))
                                            }
                                            disabled={usersLoading}
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
                                            value={userConfig.role}
                                            onChange={(e) =>
                                                setUserConfig((prev) => ({
                                                    ...prev,
                                                    role: e.target.value,
                                                }))
                                            }
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
                                            value={userLicensesConfig.plan || ''}
                                            onChange={(e) => setUserLicensesConfig(prev => ({ ...prev, plan: e.target.value }))}
                                            disabled={licensesLoading}
                                        >
                                            <option value="">Seleccionar licencia</option>
                                            {licensesLoading ? (
                                                <option disabled>Cargando licencias...</option>
                                            ) : (
                                                licenses
                                                    ?.filter(license => license.plan && license.active) // Solo licencias activas con plan
                                                    ?.map(license => (
                                                        <option key={license.id} value={license.plan}>
                                                            {license.provider} - {license.plan} {license.model ? `(${license.model})` : ''}
                                                        </option>
                                                    ))
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium text-blue-800 mb-1">
                                            Información del Usuario
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Asegúrate de que todos los campos estén completos antes de agregar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={closeAddModal}
                                    className="cursor-pointer"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    type="submit"
                                    onClick={async () => {
                                        console.log("👉 userConfig al hacer click:", userConfig)
                                        try {
                                            setSaving(true)
                                            await handleAddUser(userConfig)
                                            closeAddModal()
                                        } catch (error) {
                                            console.error('Error al agregar usuario:', error)
                                        } finally {
                                            setSaving(false)
                                        }
                                    }}
                                    className="cursor-pointer"
                                    disabled={
                                        saving ||
                                        !userConfig.name.trim() ||
                                        !userConfig.username.trim()
                                    }
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
        </div>
    )
}
