'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, FileEdit, Info, RefreshCw } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useDepartments } from '@/hooks/useDepartments';
import {
    licenseFormSchema,
    type LicenseFormValues,
} from '@/lib/validations/license';
import type { Result } from '@/types/result';
import type { License } from '@/types/license';
import type { Sede } from '@/types/sede';

interface EditLicenseDialogProps {
    license: License;
    sedes?: Sede[];
    onClose: () => void;
    onEditLicense: (id: number, values: LicenseFormValues) => Promise<Result>;
}

function licenseToFormValues(license: License): LicenseFormValues {
    return {
        provider: license.provider ?? '',
        sede: license.sede ?? '',
        model: license.model ?? '',
        currency: license.currency === 'DOP' ? 'DOP' : 'USD',
        billingCycle: license.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
        startDate: license.startDate
            ? new Date(license.startDate).toISOString().split('T')[0]
            : '',
        expiration: license.expiration
            ? new Date(license.expiration).toISOString().split('T')[0]
            : '',
        assigned: license.assigned ?? '',
        departmentId: license.departmentId != null ? String(license.departmentId) : '',
        unitCost: String(license.unitCost ?? ''),
        totalLicense: String(license.totalLicense ?? ''),
        plan: license.plan ?? '',
        installmentCost: String(license.installmentCost ?? ''),
        active: license.active,
    };
}

export function EditLicenseDialog({ license, sedes = [], onClose, onEditLicense }: EditLicenseDialogProps) {
    const { departments } = useDepartments(true);
    const sedeNames = sedes.map((sede) => sede.name);
    if (license.sede && !sedeNames.includes(license.sede)) sedeNames.push(license.sede);
    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LicenseFormValues>({
        resolver: zodResolver(licenseFormSchema),
        defaultValues: licenseToFormValues(license),
    });

    const isYearly = watch('billingCycle') === 'YEARLY';

    const onSubmit = handleSubmit(async (values) => {
        const result = await onEditLicense(license.id, values);
        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        toast.success('Licencia actualizada');
        onClose();
    });

    return (
        <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <FileEdit className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <Dialog.Title className="text-lg font-semibold text-thirdary">Editar Licencia</Dialog.Title>
                                <Dialog.Description className="text-sm text-thirdary">Modifica la información de la licencia</Dialog.Description>
                            </div>
                        </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editProvider">Proveedor</Label>
                                <Input id="editProvider" placeholder="Proveedor" {...register('provider')} />
                                {errors.provider && <p className="text-xs text-red-500">{errors.provider.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editSede">Sede</Label>
                                <select
                                    id="editSede"
                                    {...register('sede')}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors"
                                >
                                    <option value="">Selecciona una sede</option>
                                    {sedeNames.map((sede) => (
                                        <option key={sede} value={sede}>{sede}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editModel">Modelo</Label>
                                <Input id="editModel" placeholder="Modelo" {...register('model')} />
                                {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editBillingCycle">Ciclo de Facturación</Label>
                                <select
                                    id="editBillingCycle"
                                    {...register('billingCycle', {
                                        onChange: (e) => {
                                            if (e.target.value !== 'YEARLY') setValue('expiration', '');
                                        },
                                    })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                >
                                    <option value="MONTHLY">Mensual</option>
                                    <option value="YEARLY">Anual</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editStartDate">Fecha de Inicio</Label>
                                <Input id="editStartDate" type="date" {...register('startDate')} />
                                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editExpiration">Fecha de Expiración</Label>
                                <Input
                                    id="editExpiration"
                                    type="date"
                                    disabled={!isYearly}
                                    className="disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register('expiration')}
                                />
                                {errors.expiration && <p className="text-xs text-red-500">{errors.expiration.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editAssigned">Asignado</Label>
                                <Input id="editAssigned" placeholder="Asignado" {...register('assigned')} />
                                {errors.assigned && <p className="text-xs text-red-500">{errors.assigned.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editDepartment">Departamento</Label>
                                <select
                                    id="editDepartment"
                                    {...register('departmentId')}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors"
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editCurrency">Moneda</Label>
                                <select
                                    id="editCurrency"
                                    {...register('currency')}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                >
                                    <option value="USD">USD - Dólar estadounidense</option>
                                    <option value="DOP">DOP - Peso dominicano</option>
                                </select>
                                {errors.currency && <p className="text-xs text-red-500">{errors.currency.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editUnitCost">Costo Unitario</Label>
                                <Input id="editUnitCost" placeholder="0.00" {...register('unitCost')} />
                                {errors.unitCost && <p className="text-xs text-red-500">{errors.unitCost.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editTotalLicense">Total de Licencias</Label>
                                <Input id="editTotalLicense" placeholder="Total de Licencias" {...register('totalLicense')} />
                                {errors.totalLicense && <p className="text-xs text-red-500">{errors.totalLicense.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="editInstallmentCost">Costo de Instalación</Label>
                                <Input id="editInstallmentCost" placeholder="0.00" {...register('installmentCost')} />
                                {errors.installmentCost && <p className="text-xs text-red-500">{errors.installmentCost.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editPlan">Plan (opcional)</Label>
                                <Input id="editPlan" placeholder="Plan" {...register('plan')} />
                                {errors.plan && <p className="text-xs text-red-500">{errors.plan.message}</p>}
                            </div>
                           
                        </div>

                        <div className="flex items-center h-12 px-3 mt-auto">
                            <Controller
                                control={control}
                                name="active"
                                render={({ field }) => (
                                    <input
                                        id="editActive"
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2"
                                    />
                                )}
                            />
                            <label htmlFor="editActive" className="ml-3 text-base text-gray-700 cursor-pointer select-none">
                                Licencia activa
                            </label>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <div className="flex-1 text-sm">
                                <p className="font-medium text-blue-800 mb-1">Información de la Licencia</p>
                                <p className="text-xs text-blue-600">Asegúrate de que todos los campos estén completos antes de guardar.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <Dialog.Close asChild>
                            <Button type="button" variant="outline" size="sm" className="cursor-pointer" disabled={isSubmitting}>
                                Cancelar
                            </Button>
                        </Dialog.Close>
                        <Button type="submit" variant="default" size="sm" className="cursor-pointer" disabled={isSubmitting}>
                            {isSubmitting ? (
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
                </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
