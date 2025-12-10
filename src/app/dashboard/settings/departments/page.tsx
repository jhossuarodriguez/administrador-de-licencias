'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDepartments } from "@/hooks/useDepartments"
import { DepartmentConfig } from "@/types/department"
import { Building2, Plus, Pencil, Trash2, Power, PowerOff, Save, X, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function DepartmentsPage() {
    const { departments, isLoading, handleAddSubmit, handleEditSubmit, handleDelete, handleToggle } = useDepartments()

    // Estado para guardar cambios
    const [saving, setSaving] = useState(false)

    // Modal Agregar
    const [addModalOpen, setAddModalOpen] = useState(false)

    // Modal Editar
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [departmentToEdit, setDepartmentToEdit] = useState<number | null>(null)

    // Modal Eliminar
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null)

    // Estado para configuración del departamento
    const [deptConfig, setDeptConfig] = useState<DepartmentConfig>({
        name: "",
        description: "",
    })

    // Open add modal
    const openAddModal = () => {
        setAddModalOpen(true)
        setDeptConfig({ name: "", description: "" })
    }

    // Close add modal
    const closeAddModal = () => {
        setAddModalOpen(false)
        setDeptConfig({ name: "", description: "" })
    }

    // Open edit modal
    const openEditModal = (deptId: number) => {
        const dept = departments.find(d => d.id === deptId);
        if (dept) {
            setDepartmentToEdit(deptId);
            setDeptConfig({
                id: dept.id,
                name: dept.name,
                description: dept.description || ''
            });
            setEditModalOpen(true);
        }
    }

    // Close edit modal
    const closeEditModal = () => {
        setEditModalOpen(false)
        setDepartmentToEdit(null)
    }

    // Open delete modal
    const openDeleteModal = (deptId: number) => {
        setDepartmentToDelete(deptId)
        setDeleteModalOpen(true)
    }

    // Close delete modal
    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setDepartmentToDelete(null)
    }

    // Delete confirmation
    const confirmDelete = () => {
        if (departmentToDelete !== null) {
            const dept = departments.find(d => d.id === departmentToDelete);
            if (dept) {
                handleDelete(departmentToDelete, dept.name);
            }
            closeDeleteModal();
        }
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-32 mt-10'>
                <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                <span className='ml-2'>Cargando Departamentos...</span>
            </div>
        )
    }


    return (
        <div className="flex flex-col mx-4 mt-4 md:mt-10 md:mx-7 mb-5 md:mb-10 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        Departamentos
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Administra los departamentos de tu organización
                    </p>
                </div>
                <Button onClick={openAddModal} className="gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Agregar Departamento
                </Button>
            </div>

            {/* Tabla de Departamentos */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-medium">Nombre</th>
                                <th className="text-left p-4 font-medium">Descripción</th>
                                <th className="text-center p-4 font-medium">Usuarios</th>
                                <th className="text-center p-4 font-medium">Licencias</th>
                                <th className="text-center p-4 font-medium">Estado</th>
                                <th className="text-center p-4 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                                        Cargando departamentos...
                                    </td>
                                </tr>
                            ) : departments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                                        No hay departamentos. Crea uno para comenzar.
                                    </td>
                                </tr>
                            ) : (
                                departments.map((dept) => (
                                    <tr key={dept.id} className="border-t hover:bg-muted/20">
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {dept.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {dept.description || <span className="italic">Sin descripción</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            {dept._count?.users || 0}
                                        </td>
                                        <td className="p-4 text-center">
                                            {dept._count?.licenses || 0}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${dept.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {dept.active ? (
                                                    <>
                                                        <Power className="h-3 w-3" />
                                                        Activo
                                                    </>
                                                ) : (
                                                    <>
                                                        <PowerOff className="h-3 w-3" />
                                                        Inactivo
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        openEditModal(dept.id);
                                                    }}
                                                    className="gap-1 cursor-pointer"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleToggle(dept.id, dept.active);
                                                    }}
                                                    className="gap-1 cursor-pointer"
                                                >
                                                    {dept.active ? (
                                                        <>
                                                            <PowerOff className="h-3 w-3" />
                                                            Desactivar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="h-3 w-3" />
                                                            Activar
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => openDeleteModal(dept.id)}
                                                    className="gap-1 cursor-pointer z-[999999px]"
                                                    disabled={dept._count && (dept._count.users > 0 || dept._count.licenses > 0)}
                                                >
                                                    Eliminar
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Agregar */}
            {addModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-background">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Agregar Departamento</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeAddModal}
                                    disabled={saving}
                                    className="cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <form onSubmit={(e) => handleAddSubmit(e, deptConfig, setSaving, closeAddModal)} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nombre del Departamento <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Ej: Tecnología de la Información"
                                    value={deptConfig.name}
                                    onChange={(e) =>
                                        setDeptConfig((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Descripción del departamento (opcional)"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={deptConfig.description || ''}
                                    onChange={(e) =>
                                        setDeptConfig((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1 gap-2 cursor-pointer" disabled={saving}>
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Guardando...' : 'Guardar Departamento'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeAddModal}
                                    disabled={saving}
                                    className="cursor-pointer"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-background">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Editar Departamento</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeEditModal}
                                    disabled={saving}
                                    className="cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <form onSubmit={(e) => handleEditSubmit(e, departmentToEdit, deptConfig, setSaving, closeEditModal)} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">
                                    Nombre del Departamento <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    placeholder="Ej: Tecnología de la Información"
                                    value={deptConfig.name}
                                    onChange={(e) =>
                                        setDeptConfig((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Descripción</Label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    placeholder="Descripción del departamento (opcional)"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={deptConfig.description || ''}
                                    onChange={(e) =>
                                        setDeptConfig((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1 gap-2 cursor-pointer" disabled={saving}>
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Actualizando...' : 'Actualizar Departamento'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEditModal}
                                    disabled={saving}
                                    className="cursor-pointer"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Eliminar*/}
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
                                    <h3 className="text-lg font-semibold text-thirdary">Eliminar departamento</h3>
                                    <p className="text-sm text-thirdary">Esta acción no se puede deshacer</p>
                                </div>
                            </div>

                            <p className="text-sm text-thirdary">
                                ¿Estás seguro que deseas eliminar este departamento?
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
        </div>
    )
}
