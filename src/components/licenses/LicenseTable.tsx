'use client'

import { AlertCircle, CheckCircle, FileEdit, Info, KeyRound, RefreshCw, Trash2 } from 'lucide-react';
import { useLicenses } from '@/hooks/useLicense';
import { useDepartments } from '@/hooks/useDepartments';
import { parseDateFromAPI } from '@/lib/hookUtils';
import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function LicenseTable() {
    const { license, isError, isLoading, handleDeleteLicense, handleEditLicense } = useLicenses()
    const { departments } = useDepartments(true) // Solo departamentos activos

    //Abrir Modal Edit + Estado
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [licenseToEdit, setLicenseToEdit] = useState<number | null>(null)

    // Estado para configuración del usuario
    const [licenseConfig, setLicenseConfig] = useState({
        sede: '',
        provider: '',
        model: '',
        billingCycle: '',
        startDate: '',
        expiration: '',
        assigned: '',
        departmentId: null as number | null,
        unitCost: '',
        totalLicense: '',
        plan: '',
        installmentCost: '',
        active: false,
    });

    // Estado para guardar cambios
    const [saving, setSaving] = useState(false);

    //Open delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [licenseToDelete, setLicenseToDelete] = useState<number | null>(null)

    //Open edit modal
    const openEditModal = (licenseId: number) => {
        setEditModalOpen(true)
        setLicenseToEdit(licenseId)
    }

    //Close edit modal
    const closeEditModal = () => {
        setEditModalOpen(false)
        setLicenseToEdit(null)
    }

    //Open delete modal
    const openDeleteModal = (licenseId: number) => {
        setLicenseToDelete(licenseId)
        setDeleteModalOpen(true)
    }

    //Close delete modal
    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setLicenseToDelete(null)
    }

    //Delete confirmation
    const confirmDelete = () => {
        if (licenseToDelete !== null) {
            handleDeleteLicense(licenseToDelete)
            closeDeleteModal()
        }
    }

    if (isLoading) {
        return (
            <div className='hidden overflow-x-auto bg-white sm:rounded-lg'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-2'>Cargando Licencias...</span>
                </div>
            </div>
        )
    }

    if (isError) {
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
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
            <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-10 h-10 bg-gray-100">
                <KeyRound className="size-6" />
            </div>
            {/* Vista Desktop - Tabla */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm text-center text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3"></th>
                            <th className="px-6 py-3">Sede</th>
                            <th className="px-6 py-3">Producto</th>
                            <th className="px-6 py-3">Inicio</th>
                            <th className="px-6 py-3">Término</th>
                            <th className="px-6 py-3">Asignado</th>
                            <th className="px-6 py-3">Responsable</th>
                            <th className="px-6 py-3">Modelo</th>
                            <th className="px-6 py-3">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {license?.slice(0, 10).map((license) => (
                            <tr key={license.id}
                                className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                            >
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4">{license.sede}</td>
                                <td className="px-6 py-4">{license.provider}</td>
                                <td className="px-6 py-4">{parseDateFromAPI(license.startDate.toString()).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{parseDateFromAPI(license.expiration.toString()).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{license.assigned}</td>
                                <td className="px-6 py-4">{license.department?.name || 'No asignado'}</td>
                                <td className="px-6 py-4">{license.model}</td>
                                <td className="px-6 py-4 flex gap-2 justify-center">
                                    <button className="cursor-pointer text-secondary hover:underline" onClick={() => openEditModal(license.id)}>
                                        Editar
                                    </button>
                                    |
                                    <button className="cursor-pointer text-red-500/60 hover:underline" onClick={() => openDeleteModal(license.id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vista Mobile - Tarjetas */}
            <div className="md:hidden bg-white">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium text-gray-700 md:mx-0 mx-7">
                        {license?.length || 0} licencias registradas
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {license?.slice(0, 10).map((license) => (
                        <div key={license.id} className="p-4">
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
                                    <span className="text-gray-900">{parseDateFromAPI(license.startDate.toString()).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Término:</span>
                                    <span className="text-gray-900">{parseDateFromAPI(license.expiration.toString()).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Asignado:</span>
                                    <span className="text-gray-900">{license.assigned}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Responsable:</span>
                                    <span className="text-gray-900">{license.department?.name || 'No asignado'}</span>
                                </div>
                            </div>

                            <button
                                className="w-full py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
                                onClick={() => openEditModal(license.id)}
                            >
                                Editar Licencia
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {license.length === 0 && (
                <div className='py-8 text-center text-thirdary'>
                    No hay Licencias disponibles
                </div>
            )}

            {editModalOpen && (
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
                                    <h3 className="text-lg font-semibold text-thirdary">Editar Licencia</h3>
                                    <p className="text-sm text-thirdary">Modifica la información de la licencia</p>
                                </div>
                            </div>

                            {/* Campos de edición */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editProvider">Proveedor</Label>
                                        <Input
                                            id="editProvider"
                                            placeholder="Proveedor"
                                            value={licenseConfig.provider || ''}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, provider: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="editSede">Sede</Label>
                                        <select
                                            id="editSede"
                                            name="sede"
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, sede: e.target.value }))}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            required
                                        >
                                            <option defaultValue="Selecciona una sede">Selecciona una sede</option>
                                            <option value="SDO">Santo Domingo Oeste (SDO)</option>
                                            <option value="SCL">Santiago de los Caballeros (SCL)</option>
                                            <option value="SJM">San Juan de la Maguana (SJM)</option>
                                            <option value="SDE">Santo Domingo Este (SDE)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editModel">Modelo</Label>
                                        <Input
                                            id="editModel"
                                            placeholder="Modelo"
                                            value={licenseConfig.model || ''}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, model: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billingCycle">Ciclo de Facturación</Label>
                                        <select
                                            id="billingCycle"
                                            name="billingCycle"
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, billingCycle: e.target.value }))}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            required
                                        >
                                            <option value="MONTHLY">Mensual</option>
                                            <option value="YEARLY">Anual</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="space-y-2">
                                        <Label htmlFor="editStartDate">Fecha de Inicio</Label>
                                        <Input
                                            id="editStartDate"
                                            type='date'
                                            value={licenseConfig.startDate}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, startDate: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    {/* Sección de licencias asignadas */}
                                    <div className="space-y-2">
                                        <Label htmlFor="editExpiration">Fecha de Expiracion</Label>
                                        <Input
                                            id="editExpiration"
                                            type='date'
                                            value={licenseConfig.expiration}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, expiration: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="space-y-2">
                                        <Label htmlFor="editAssigned">Asignado</Label>
                                        <Input
                                            id="editAssigned"
                                            placeholder='Asignado'
                                            value={licenseConfig.assigned}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, assigned: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    {/* Sección de departamento */}
                                    <div className="space-y-2">
                                        <Label htmlFor="editDepartment">Departamento</Label>
                                        <select
                                            id="editDepartment"
                                            value={licenseConfig.departmentId || ''}
                                            onChange={(e) => setLicenseConfig(prev => ({
                                                ...prev,
                                                departmentId: e.target.value ? Number(e.target.value) : null
                                            }))}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        >
                                            <option value="">Selecciona un departamento</option>
                                            {departments?.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editUnitCost">Costo Unitario</Label>
                                        <Input
                                            id="editUnitCost"
                                            placeholder='Costo unitario'
                                            value={licenseConfig.unitCost}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, unitCost: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="editAssigned">Total de Licencias</Label>
                                        <Input
                                            id="editTotalLicense"
                                            placeholder='Total de Licencias'
                                            value={licenseConfig.totalLicense}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, totalLicense: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editUnitCost">Plan</Label>
                                        <Input
                                            id="editPlan"
                                            placeholder='Plan'
                                            value={licenseConfig.plan}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, plan: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="editInstallmentCost">Costos de Instalacion</Label>
                                        <Input
                                            id="editInstallmentCost"
                                            placeholder='Total de Licencias'
                                            value={licenseConfig.installmentCost}
                                            onChange={(e) => setLicenseConfig(prev => ({ ...prev, installmentCost: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Checkbox con altura igual a la fila */}
                                <div className="flex items-center h-12 px-3 mt-auto">
                                    <input
                                        id="active"
                                        name="active"
                                        type="checkbox"
                                        checked={licenseConfig.active || false}
                                        onChange={(e) => setLicenseConfig(prev => ({ ...prev, active: e.target.checked }))}
                                        className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2"
                                    />
                                    <label htmlFor="active" className="ml-3 text-base text-gray-700 cursor-pointer select-none">
                                        Licencia activa
                                    </label>
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
                                        if (licenseToEdit) {
                                            setSaving(true);
                                            // Convertir strings a tipos correctos
                                            const configToSend: any = {
                                                ...licenseConfig,
                                                startDate: licenseConfig.startDate ? new Date(licenseConfig.startDate) : null,
                                                expiration: licenseConfig.expiration ? new Date(licenseConfig.expiration) : null,
                                                unitCost: parseFloat(licenseConfig.unitCost) || 0,
                                                totalLicense: parseInt(licenseConfig.totalLicense) || 0,
                                                installmentCost: parseFloat(licenseConfig.installmentCost) || 0,
                                            };
                                            await handleEditLicense(licenseToEdit, configToSend);
                                            setSaving(false);
                                            closeEditModal();
                                        }
                                    }}
                                    className="cursor-pointer"
                                    disabled={saving || !licenseConfig.plan?.trim() || !licenseConfig.plan?.trim()}
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
            )
            }

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
                                    <h3 className="text-lg font-semibold text-thirdary">Eliminar licencia</h3>
                                    <p className="text-sm text-thirdary">Esta acción no se puede deshacer</p>
                                </div>
                            </div>

                            <p className="text-sm text-thirdary">
                                ¿Estás seguro que deseas eliminar esta licencia?
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
        </div >
    )
}