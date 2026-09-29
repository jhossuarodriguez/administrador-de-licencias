'use client'

import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface DeleteLicenseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function DeleteLicenseDialog({ open, onOpenChange, onConfirm }: DeleteLicenseDialogProps) {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Eliminar licencia"
            description="Esta acción no se puede deshacer"
            message="¿Estás seguro que deseas eliminar esta licencia?"
            confirmLabel="Eliminar"
            variant="destructive"
            icon={Trash2}
            onConfirm={onConfirm}
        />
    )
}
