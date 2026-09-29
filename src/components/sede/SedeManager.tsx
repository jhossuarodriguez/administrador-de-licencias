'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Building2, LoaderCircle, Pencil, Plus, Power, PowerOff, Save, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSedes } from '@/hooks/useSedes'
import type { Sede, SedeConfig } from '@/types/sede'

const EMPTY_FORM: SedeConfig = {
    name: '',
    description: '',
}

interface SedeManagerProps {
    initialData: Sede[]
    isAdmin: boolean
}

export function SedeManager({ initialData, isAdmin }: SedeManagerProps) {
    const { sedes, isLoading, isError, createSede, updateSede, deleteSede } = useSedes(false, {
        fallbackData: initialData,
    })
    const [editorOpen, setEditorOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<SedeConfig>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [busyId, setBusyId] = useState<number | null>(null)

    const openAddEditor = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setEditorOpen(true)
    }

    const openEditEditor = (sede: Sede) => {
        setEditingId(sede.id)
        setForm({ name: sede.name, description: sede.description ?? '' })
        setEditorOpen(true)
    }

    const closeEditor = () => {
        if (saving) return
        setEditorOpen(false)
        setEditingId(null)
        setForm(EMPTY_FORM)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSaving(true)

        const result = editingId === null
            ? await createSede(form)
            : await updateSede(editingId, form)

        setSaving(false)
        if (!result.ok) {
            toast.error(result.error)
            return
        }

        toast.success(editingId === null ? 'Sede agregada' : 'Sede actualizada')
        closeEditor()
    }

    const handleToggle = async (sede: Sede) => {
        setBusyId(sede.id)
        const result = await updateSede(sede.id, { active: !sede.active })
        setBusyId(null)

        if (!result.ok) {
            toast.error(result.error)
            return
        }

        toast.success(sede.active ? 'Sede desactivada' : 'Sede activada')
    }

    const handleDelete = async (sede: Sede) => {
        if (!window.confirm(`¿Estás seguro de eliminar la sede "${sede.name}"?`)) return

        setBusyId(sede.id)
        const result = await deleteSede(sede.id)
        setBusyId(null)

        if (!result.ok) {
            toast.error(result.error)
            return
        }

        toast.success('Sede eliminada')
    }

    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center gap-2">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                <span>Cargando sedes...</span>
            </div>
        )
    }

    return (
        <div className="mx-4 mb-10 mt-4 flex flex-col gap-6 md:mx-7 md:mt-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-3xl font-bold">
                        <Building2 className="size-8 text-primary" />
                        Sedes
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Administra las sedes disponibles para las licencias
                    </p>
                </div>

                {isAdmin && (
                    <Button onClick={openAddEditor} className="cursor-pointer gap-2 shadow-md">
                        <Plus className="size-4" />
                        Agregar sede
                    </Button>
                )}
            </div>

            {isError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                    No se pudieron cargar las sedes. Intenta nuevamente.
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-4 text-left font-medium">Nombre</th>
                                    <th className="p-4 text-left font-medium">Descripción</th>
                                    <th className="p-4 text-center font-medium">Licencias</th>
                                    <th className="p-4 text-center font-medium">Estado</th>
                                    {isAdmin && <th className="p-4 text-center font-medium">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {sedes.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 5 : 4} className="p-8 text-center text-muted-foreground">
                                            No hay sedes registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    sedes.map((sede) => (
                                        <tr key={sede.id} className="border-t transition-colors hover:bg-muted/20">
                                            <td className="p-4 font-medium">
                                                <span className="flex items-center gap-2">
                                                    <Building2 className="size-4 text-muted-foreground" />
                                                    {sede.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {sede.description || <span className="italic">Sin descripción</span>}
                                            </td>
                                            <td className="p-4 text-center">{sede._count.licenses}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    sede.active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {sede.active ? <Power className="size-3" /> : <PowerOff className="size-3" />}
                                                    {sede.active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="cursor-pointer gap-1"
                                                            disabled={busyId !== null}
                                                            onClick={() => openEditEditor(sede)}
                                                        >
                                                            <Pencil className="size-3" />
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="cursor-pointer gap-1"
                                                            disabled={busyId !== null}
                                                            onClick={() => handleToggle(sede)}
                                                        >
                                                            {busyId === sede.id ? (
                                                                <LoaderCircle className="size-3 animate-spin" />
                                                            ) : sede.active ? (
                                                                <PowerOff className="size-3" />
                                                            ) : (
                                                                <Power className="size-3" />
                                                            )}
                                                            {sede.active ? 'Desactivar' : 'Activar'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            className="cursor-pointer gap-1"
                                                            disabled={busyId !== null || sede._count.licenses > 0}
                                                            title={sede._count.licenses > 0 ? 'La sede tiene licencias asociadas' : undefined}
                                                            onClick={() => handleDelete(sede)}
                                                        >
                                                            <Trash2 className="size-3" />
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Dialog.Root open={editorOpen} onOpenChange={(open) => { if (!open) closeEditor() }}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between border-b p-6">
                            <div>
                                <Dialog.Title className="text-xl font-bold text-gray-900">
                                    {editingId === null ? 'Agregar sede' : 'Editar sede'}
                                </Dialog.Title>
                                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                                    {editingId === null
                                        ? 'Registra una sede para usarla al crear licencias.'
                                        : 'El nuevo nombre también se aplicará a sus licencias.'}
                                </Dialog.Description>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                aria-label="Cerrar"
                                disabled={saving}
                                onClick={closeEditor}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="sede-name">
                                    Nombre <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="sede-name"
                                    name="name"
                                    value={form.name}
                                    maxLength={100}
                                    placeholder="Ej: Sede Central"
                                    required
                                    autoFocus
                                    disabled={saving}
                                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sede-description">Descripción</Label>
                                <textarea
                                    id="sede-description"
                                    name="description"
                                    value={form.description ?? ''}
                                    maxLength={500}
                                    rows={4}
                                    placeholder="Ubicación o nombre completo de la sede"
                                    disabled={saving}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="cursor-pointer"
                                    disabled={saving}
                                    onClick={closeEditor}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="cursor-pointer gap-2" disabled={saving}>
                                    {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    {saving ? 'Guardando...' : 'Guardar sede'}
                                </Button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}
