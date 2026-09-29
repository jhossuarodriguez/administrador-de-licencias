'use client'

import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface DeleteUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function DeleteUserDialog({ open, onOpenChange, onConfirm }: DeleteUserDialogProps) {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Eliminar usuario"
            description="Esta acción no se puede deshacer"
            message="¿Estás seguro que deseas eliminar este usuario?"
            confirmLabel="Eliminar"
            variant="destructive"
            icon={Trash2}
            onConfirm={onConfirm}
        />
    )
}
