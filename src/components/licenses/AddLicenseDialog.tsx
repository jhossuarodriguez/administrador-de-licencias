'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLicenses } from '@/hooks/useLicense'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { toast } from 'sonner'
import { CheckCircle, Info, Key, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { Department } from '@/types/department'
import type { Sede } from '@/types/sede'
import type { User } from '@/types/user'

const INITIAL_CONFIG = {
    sede: '',
    provider: '',
    startDate: '',
    expiration: '',
    assigned: '',
    departmentId: null as number | null,
    model: '',
    plan: '',
    currency: 'USD',
    unitCost: '',
    installmentCost: '',
    billingCycle: '',
    totalLicense: '',
    active: true,
}

export function AddLicenseDialog({ departments, users, sedes }: { departments: Department[]; users: User[]; sedes: Sede[] }) {
    const { handleAddLicense } = useLicenses()
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
        setSaving(true)
        try {
            const formattedConfig = {
                sede: config.sede,
                provider: config.provider,
                startDate: config.startDate ? new Date(config.startDate) : null,
                expiration: config.expiration ? new Date(config.expiration) : null,
                assigned: config.assigned,
                departmentId: config.departmentId,
                model: config.model,
                plan: config.plan,
                currency: config.currency,
                unitCost: parseFloat(config.unitCost) || 0,
                installmentCost: parseFloat(config.installmentCost) || 0,
                billingCycle: config.billingCycle,
                totalLicense: parseInt(config.totalLicense) || 0,
                active: config.active,
            }

            const result = await handleAddLicense(formattedConfig)
            if (!result.ok) {
                toast.error(result.error)
                return
            }
            closeModal()
            toast.success('Licencia agregada')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <Button className="cursor-pointer" onClick={openModal}>
                Agregar licencia
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
                                    <Key className="h-6 w-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">
                                        Agregar Licencia
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sede">Sede</Label>
                                    <select
                                        id="sede"
                                        name="sede"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.sede || ''}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, sede: e.target.value }))}
                                    >
                                        <option value="">Selecciona una sede</option>
                                        {sedes.map((sede) => (
                                            <option key={sede.id} value={sede.name}>
                                                {sede.description ? `${sede.name} - ${sede.description}` : sede.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="provider">Proveedor</Label>
                                    <Input
                                        id="provider"
                                        name="provider"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.provider}
                                        placeholder="Ej. Microsoft, Adobe, Google"
                                        onChange={(e) => setConfig((prev) => ({ ...prev, provider: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.startDate || ''}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiration">Fecha de Expiración</Label>
                                    <Input
                                        id="expiration"
                                        name="expiration"
                                        type="date"
                                        disabled={config.billingCycle !== 'YEARLY'}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                        value={config.expiration || ''}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, expiration: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned">Asignado</Label>
                                    <select
                                        id="assigned"
                                        name="assigned"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.assigned || ''}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, assigned: e.target.value }))}
                                    >
                                        <option value="">Seleccionar asignación</option>
                                        <option value="Unassigned" disabled>
                                            -------Por Departamento-------
                                        </option>
                                        {departments.map((item) => (
                                            <option key={item.name} value={item.name}>
                                                {item.name}
                                            </option>
                                        ))}
                                        <option value="Unassigned" disabled>
                                            -------Por Colaborador-------
                                        </option>
                                        {users.map((user) => (
                                            <option key={user.name} value={user.name}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="departmentId">Departamento Asignado</Label>
                                    <select
                                        id="departmentId"
                                        name="departmentId"
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
                                    <Label htmlFor="model">Modelo</Label>
                                    <Input
                                        id="model"
                                        name="model"
                                        placeholder="Ej. Microsoft 365 E3"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.model || ''}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan">Plan (opcional)</Label>
                                    <Input
                                        id="plan"
                                        name="plan"
                                        type="text"
                                        placeholder="Ej. Business"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.plan}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, plan: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Moneda</Label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.currency}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, currency: e.target.value }))}
                                    >
                                        <option value="USD">USD - Dólar estadounidense</option>
                                        <option value="DOP">DOP - Peso dominicano</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unitCost">Costo unitario ({config.currency})</Label>
                                    <Input
                                        id="unitCost"
                                        name="unitCost"
                                        type="number"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        placeholder={`0.00 ${config.currency}`}
                                        value={config.unitCost || ''}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, unitCost: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="installmentCost">Costo x Instalación ({config.currency})</Label>
                                    <Input
                                        id="installmentCost"
                                        name="installmentCost"
                                        type="number"
                                        placeholder={`0.00 ${config.currency}`}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.installmentCost}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, installmentCost: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billingCycle">Ciclo de Facturación</Label>
                                    <select
                                        id="billingCycle"
                                        name="billingCycle"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.billingCycle || ''}
                                        onChange={(e) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                billingCycle: e.target.value,
                                                expiration: e.target.value === 'YEARLY' ? prev.expiration : '',
                                            }))
                                        }
                                    >
                                        <option value="">Seleccionar ciclo</option>
                                        <option value="MONTHLY">Mensual</option>
                                        <option value="YEARLY">Anual</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="totalLicense">Total de Licencias</Label>
                                    <Input
                                        id="totalLicense"
                                        name="totalLicense"
                                        type="number"
                                        placeholder="Total de Licencias"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={config.totalLicense}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, totalLicense: e.target.value }))}
                                    />
                                </div>

                                <div className="md:col-span-2 flex items-center h-12 px-1">
                                    <Input
                                        id="active"
                                        name="active"
                                        type="checkbox"
                                        checked={config.active}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, active: e.target.checked }))}
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
                                    <Info className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium text-secondary mb-1">
                                            Información del Usuario
                                        </p>
                                        <p className="text-xs text-secondary">
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
                                    disabled={saving || !config.provider.trim()}
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
