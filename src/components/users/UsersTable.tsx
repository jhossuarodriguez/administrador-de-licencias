'use client'

import { AlertCircle, FileEdit, Trash2, Users, Info, CheckCircle, RefreshCw } from "lucide-react"
import { useUsers } from '@/hooks/useUsers';
import { useLicenses } from '@/hooks/useLicense';
import { useDepartments } from '@/hooks/useDepartments';
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function UsersTable() {
    const { users, isError, isLoading: usersLoading, handleDeleteUser, handleEditUser } = useUsers()
    const { license: licenses, isLoading: licensesLoading } = useLicenses()
    const { departments } = useDepartments(true) // Solo departamentos activos

    //Abrir Modal Edit + Estado
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<number | null>(null)

    // Estado para configuración del usuario
    const [userConfig, setUserConfig] = useState({
        name: "",
        username: "",
        departmentId: null as number | null,
        status: "active",
        role: "user",
        plan: ''
    });

    const [userLicensesConfig, setUserLicensesConfig] = useState({
        plan: '',
    });

    // Estado para guardar cambios
    const [saving, setSaving] = useState(false);


    //Open delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<number | null>(null)

    //Abrir Modal Eliminar
    const openDeleteModal = (userId: number) => {
        setUserToDelete(userId)
        setDeleteModalOpen(true)
    }

    //Cerrar Modal Eliminar
    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setUserToDelete(null)
    }

    //Confirmacion Eliminar
    const confirmDelete = () => {
        if (userToDelete !== null) {
            handleDeleteUser(userToDelete)
            closeDeleteModal()
        }
    }
    //Open edit modal
    const openEditModal = (userId: number) => {
        setEditModalOpen(true)
        setUserToEdit(userId)
    }
    //Close edit modal
    const closeEditModal = () => {
        setEditModalOpen(false)
        setUserToEdit(null)
    }

    if (usersLoading) {
        return (
            <div className='hidden overflow-x-auto bg-white sm:rounded-lg'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-2'>Cargando Usuarios...</span>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className='hidden overflow-x-auto bg-white shadow-md sm:rounded-lg md:block'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-5'>Error al cargar usuarios, por favor, intenta de nuevo.</span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-10 h-10 bg-gray-100">
                <Users className="size-6" />
            </div>
            {/* Vista Desktop - Tabla */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm text-center text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Departamento</th>
                            <th className="px-6 py-3">Licencia Asignada</th>
                            <th className="px-6 py-3">Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.slice(0, 10).map((user) => {
                            const assignedLicense = user.Assignment?.[0]; // Primera licencia asignada
                            return (
                                <tr key={user.id}
                                    className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                                >
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
                                    <td className="px-6 py-4 flex gap-3 justify-center items-center">
                                        <button className="cursor-pointer text-secondary hover:underline" onClick={() => openEditModal(user.id)}>
                                            Editar
                                        </button>
                                        |
                                        <button className="cursor-pointer text-red-500/60 hover:underline" onClick={() => openDeleteModal(user.id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Vista Mobile - Tarjetas */}
            <div className="md:hidden bg-white">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium text-gray-700 md:mx-0 mx-7">
                        {users?.length || 0} usuarios registrados
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {users?.slice(0, 10).map((user) => {
                        const assignedLicense = user.Assignment?.[0]; // Primera licencia asignada
                        return (
                            <div key={user.id} className="p-4">
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
                                <div className="flex flex-col space-y-2">
                                    <button
                                        className="w-full py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
                                        onClick={() => openEditModal(user.id)}
                                    >
                                        Editar Usuario
                                    </button>

                                    <button
                                        className="w-full py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
                                        onClick={() => openDeleteModal(user.id)}
                                    >
                                        Eliminar Usuario
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {users?.length === 0 && (
                <div className='py-8 text-center text-thirdary'>
                    No hay usuarios disponibles
                </div>
            )}

            {deleteModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
                    onClick={closeDeleteModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">Eliminar usuario</h3>
                                    <p className="text-sm text-thirdary">Esta acción no se puede deshacer</p>
                                </div>
                            </div>

                            <p className="text-sm text-thirdary">
                                ¿Estás seguro que deseas eliminar este usuario?
                            </p>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={closeDeleteModal}
                                    className="cursor-pointer"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={confirmDelete}
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editModalOpen && userToEdit && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
                    onClick={closeEditModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <FileEdit className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">Editar Usuario</h3>
                                    <p className="text-sm text-thirdary">Modifica la información del usuario</p>
                                </div>
                            </div>

                            {/* Campos de edición */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editUserName">Nombre Completo</Label>
                                        <Input
                                            id="editUserName"
                                            placeholder="Nombre Completo"
                                            value={userConfig.name || ''}
                                            onChange={(e) => setUserConfig(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="editUsername">Nombre de Usuario</Label>
                                        <Input
                                            id="editUsername"
                                            placeholder="Usuario"
                                            value={userConfig.username || ''}
                                            onChange={(e) => setUserConfig(prev => ({ ...prev, username: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editUserDepartment">Departamento</Label>
                                        <select
                                            id="editUserDepartment"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={userConfig.departmentId || ''}
                                            onChange={(e) => setUserConfig(prev => ({
                                                ...prev,
                                                departmentId: e.target.value ? Number(e.target.value) : null
                                            }))}
                                        >
                                            <option value="">Selecciona un departamento</option>
                                            {departments?.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="editUserStatus">Estado</Label>
                                        <select
                                            id="editUserStatus"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={userConfig.status || 'active'}
                                            onChange={(e) => setUserConfig(prev => ({ ...prev, status: e.target.value }))}
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
                                        <Label htmlFor="editUserRole">Rol</Label>
                                        <select
                                            id="editUserRole"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={userConfig.role || 'user'}
                                            onChange={(e) => setUserConfig(prev => ({ ...prev, role: e.target.value }))}
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>

                                    {/* Sección de licencias asignadas */}
                                    <div className="space-y-2">
                                        <Label htmlFor="editUserCurrentLicense">Licencias disponibles</Label>
                                        <select
                                            id="editUserCurrentLicense"
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
                                            Asegúrate de que todos los campos estén completos antes de guardar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        closeEditModal();
                                    }}
                                    className="cursor-pointer"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={async () => {
                                        if (userToEdit) {
                                            setSaving(true);
                                            await handleEditUser(userToEdit, userConfig);
                                            setSaving(false);
                                            closeEditModal();
                                        }
                                    }}
                                    className="cursor-pointer"
                                    disabled={saving || !userConfig.name?.trim() || !userConfig.username?.trim()}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Guardar Cambios
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