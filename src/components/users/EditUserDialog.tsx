'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, FileEdit, Info, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useDepartments } from '@/hooks/useDepartments';
import { useLicenses } from '@/hooks/useLicense';
import {
    userFormSchema,
    type UserFormValues,
} from '@/lib/validations/users';
import type { Result } from '@/types/result';
import type { User } from '@/types/user';

interface EditUserDialogProps {
    user: User;
    onClose: () => void;
    onEditUser: (id: number, values: UserFormValues) => Promise<Result>;
}

function userToFormValues(user: User): UserFormValues {
    return {
        name: user.name ?? '',
        username: user.username ?? '',
        status: user.status ?? '',
        role: user.role ?? 'user',
        departmentId: user.departmentId != null ? String(user.departmentId) : '',
        plan: user.plan ?? '',
    };
}

export function EditUserDialog({ user, onClose, onEditUser }: EditUserDialogProps) {
    const { departments } = useDepartments(true);
    const { license: licenses, isLoading: licensesLoading } = useLicenses();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: userToFormValues(user),
    });

    const onSubmit = handleSubmit(async (values) => {
        const result = await onEditUser(user.id, values);
        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        toast.success('Usuario actualizado');
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
                                <Dialog.Title className="text-lg font-semibold text-thirdary">Editar Usuario</Dialog.Title>
                                <Dialog.Description className="text-sm text-thirdary">Modifica la información del usuario</Dialog.Description>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editUserName">Nombre Completo</Label>
                                    <Input id="editUserName" placeholder="Nombre Completo" {...register('name')} />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editUsername">Nombre de Usuario</Label>
                                    <Input id="editUsername" placeholder="Usuario" {...register('username')} />
                                    {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editUserDepartment">Departamento</Label>
                                    <select
                                        id="editUserDepartment"
                                        {...register('departmentId')}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                    >
                                        <option value="">Selecciona un departamento</option>
                                        {departments?.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editUserStatus">Estado</Label>
                                    <select
                                        id="editUserStatus"
                                        {...register('status')}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
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
                                        {...register('role')}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                    >
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editUserLicense">Licencias disponibles</Label>
                                    <select
                                        id="editUserLicense"
                                        {...register('plan')}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        disabled={licensesLoading}
                                    >
                                        <option value="">Seleccionar licencia</option>
                                        {licensesLoading ? (
                                            <option disabled>Cargando licencias...</option>
                                        ) : (
                                            licenses
                                                .filter((l) => l.plan && l.active)
                                                .map((l) => (
                                                    <option key={l.id} value={l.plan ?? ''}>
                                                        {l.provider} - {l.plan} {l.model ? `(${l.model})` : ''}
                                                    </option>
                                                ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="flex-1 text-sm">
                                    <p className="font-medium text-blue-800 mb-1">Información del Usuario</p>
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
