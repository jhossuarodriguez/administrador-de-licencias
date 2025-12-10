'use client'

import { CostosTable } from "@/components/licenses/CostosTable";
import { LicenseTable } from "@/components/licenses/LicenseTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Info, Key, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useLicenses } from "@/hooks/useLicense";
import { useDepartments } from "@/hooks/useDepartments";

export default function LicensesPage() {
    const [saving, setSaving] = useState(false)
    const [addModalOpen, setAddModalOpen] = useState(false);
    const { isLoading: licensesLoading, handleAddLicense } = useLicenses()
    const { departments, isLoading: depsLoading } = useDepartments(true)


    const [licenseConfig, setLicenseConfig] = useState({
        sede: '',
        provider: '',
        startDate: '',
        expiration: '',
        assigned: '',
        departmentId: null as number | null,
        model: '',
        plan: '',
        unitCost: '',
        installmentCost: '',
        billingCycle: 'MONTHLY',
        totalLicense: '',
        active: true
    })

    const addOpenModal = () => {
        setAddModalOpen(true)
        setLicenseConfig({
            sede: '',
            provider: '',
            startDate: '',
            expiration: '',
            assigned: '',
            departmentId: null,
            model: '',
            plan: '',
            unitCost: '',
            installmentCost: '',
            billingCycle: 'MONTHLY',
            totalLicense: '',
            active: true
        })
    }

    const closeAddModal = () => {
        setAddModalOpen(false)
    }

    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6 mb-5 md:mb-10 animate-fade-in animate-delay-100">
            <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
                <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                    <header className="text-2xl font-bold">Total de Licencias</header>
                    <p className="mt-1 text-gray-600 hidden md:block">
                        Administra las licencias registradas en el sistema desde esta sección.
                    </p>
                </div>

                <Button className="cursor-pointer" onClick={addOpenModal}>
                    Agregar licencia
                </Button>
            </div>

            <LicenseTable />

            <div className='mt-0 mb-10 md:mt-10'>
                <CostosTable />
            </div>

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
                                    <Key className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">
                                        Agregar Licencia
                                    </h3>
                                </div>
                            </div>

                            {/* Campos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Sede */}
                                <div className="space-y-2">
                                    <Label htmlFor="sede">Sede</Label>
                                    <select
                                        id="sede"
                                        name="sede"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.sede || ""}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({ ...prev, sede: e.target.value }))
                                        }
                                        disabled={licensesLoading}
                                    >
                                        <option value="">Selecciona una sede</option>
                                        <option value="SDO">Santo Domingo Oeste (SDO)</option>
                                        <option value="SCL">Santiago de los Caballeros (SCL)</option>
                                        <option value="SJM">San Juan de la Maguana (SJM)</option>
                                        <option value="SDE">Santo Domingo Este (SDE)</option>
                                    </select>
                                </div>

                                {/* Proveedor */}
                                <div className="space-y-2">
                                    <Label htmlFor="provider">Proveedor</Label>
                                    <Input
                                        id="provider"
                                        name="provider"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.provider}
                                        placeholder="Ej. Microsoft, Adobe, Google"
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                provider: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Fecha de inicio */}
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.startDate || ""}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                startDate: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Fecha de expiración */}
                                <div className="space-y-2">
                                    <Label htmlFor="expiration">Fecha de Expiración</Label>
                                    <Input
                                        id="expiration"
                                        name="expiration"
                                        type="date"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.expiration || ""}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                expiration: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Asignado */}
                                <div className="space-y-2">
                                    <Label htmlFor="assigned">Asignado</Label>
                                    <Input
                                        id="assigned"
                                        name="assigned"
                                        placeholder="Ej. Juan Perez"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.assigned || ""}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                assigned: e.target.value,
                                            }))
                                        }
                                        disabled={licensesLoading}
                                    />
                                </div>

                                {/* Departamento asignado */}
                                <div className="space-y-2">
                                    <Label htmlFor="departmentId">Departamento Asignado</Label>
                                    <select
                                        id="departmentId"
                                        name="departmentId"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.departmentId || ''}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
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

                                {/* Modelo */}
                                <div className="space-y-2">
                                    <Label htmlFor="model">Modelo</Label>
                                    <Input
                                        id="model"
                                        name="model"
                                        placeholder="Ej. Microsoft 365 E3"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.model || ""}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                model: e.target.value,
                                            }))
                                        }
                                        disabled={licensesLoading}
                                    />
                                </div>

                                {/* Plan */}
                                <div className="space-y-2">
                                    <Label htmlFor="plan">Plan</Label>
                                    <Input
                                        id="plan"
                                        name="plan"
                                        type="text"
                                        placeholder="Ej. Business"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.plan}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                plan: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Costo unitario */}
                                <div className="space-y-2">
                                    <Label htmlFor="unitCost">Costo unitario</Label>
                                    <Input
                                        id="unitCost"
                                        name="unitCost"
                                        type="number"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        placeholder="Costo unitario"
                                        value={licenseConfig.unitCost || ""}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                unitCost: e.target.value,
                                            }))
                                        }
                                        disabled={licensesLoading}
                                    />
                                </div>

                                {/* Costo x instalación */}
                                <div className="space-y-2">
                                    <Label htmlFor="installmentCost">Costo x Instalación</Label>
                                    <Input
                                        id="installmentCost"
                                        name="installmentCost"
                                        type="number"
                                        placeholder="Costo x Instalación"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.installmentCost}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                installmentCost: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Ciclo de facturación */}
                                <div className="space-y-2">
                                    <Label htmlFor="billingCycle">Ciclo de Facturación</Label>
                                    <select
                                        id="billingCycle"
                                        name="billingCycle"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.billingCycle || ""}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                billingCycle: e.target.value,
                                            }))
                                        }
                                        disabled={licensesLoading}
                                    >
                                        <option value="MONTHLY">Mensual</option>
                                        <option value="YEARLY">Anual</option>
                                    </select>
                                </div>

                                {/* Total licencias */}
                                <div className="space-y-2">
                                    <Label htmlFor="totalLicense">Total de Licencias</Label>
                                    <Input
                                        id="totalLicense"
                                        name="totalLicense"
                                        type="number"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={licenseConfig.totalLicense}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                totalLicense: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Licencia activa - fila completa */}
                                <div className="md:col-span-2 flex items-center h-12 px-1">
                                    <Input
                                        id="active"
                                        name="active"
                                        type="checkbox"
                                        checked={licenseConfig.active}
                                        onChange={(e) =>
                                            setLicenseConfig((prev) => ({
                                                ...prev,
                                                active: e.target.checked,
                                            }))
                                        }
                                        className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2"
                                    />
                                    <Label
                                        htmlFor="active"
                                        className="ml-3 text-base text-gray-700 cursor-pointer select-none"
                                    >
                                        Licencia activa
                                    </Label>
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
                                            Asegúrate de que todos los campos estén completos antes de
                                            agregar.
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
                                        try {
                                            setSaving(true);
                                            const formattedConfig = {
                                                sede: licenseConfig.sede,
                                                provider: licenseConfig.provider,
                                                startDate: licenseConfig.startDate ? new Date(licenseConfig.startDate) : null,
                                                expiration: licenseConfig.expiration ? new Date(licenseConfig.expiration) : null,
                                                assigned: licenseConfig.assigned,
                                                departmentId: licenseConfig.departmentId,
                                                model: licenseConfig.model,
                                                plan: licenseConfig.plan,
                                                unitCost: parseFloat(licenseConfig.unitCost) || 0,
                                                installmentCost: parseFloat(licenseConfig.installmentCost) || 0,
                                                billingCycle: licenseConfig.billingCycle,
                                                totalLicense: parseInt(licenseConfig.totalLicense) || 0,
                                                active: licenseConfig.active
                                            };
                                            await handleAddLicense(formattedConfig);
                                            closeAddModal();
                                        } catch (error) {
                                            console.error("Error al agregar usuario:", error);
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    className="cursor-pointer"
                                    disabled={
                                        saving ||
                                        !licenseConfig.plan.trim() ||
                                        !licenseConfig.provider.trim()
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

        </div >
    )
}

