'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertCircle, type LucideIcon } from 'lucide-react'
import { Button } from '../ui/button'

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    variant?: 'destructive' | 'default'
    icon?: LucideIcon
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    variant = 'destructive',
    icon: Icon = AlertCircle,
}: ConfirmDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl mx-4 animate-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <Icon className={`h-6 w-6 ${variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <Dialog.Title className="text-lg font-semibold text-thirdary">
                                    {title}
                                </Dialog.Title>
                                {description && (
                                    <Dialog.Description className="text-sm text-thirdary">
                                        {description}
                                    </Dialog.Description>
                                )}
                            </div>
                        </div>

                        <Dialog.Description className="text-sm text-thirdary">
                            {message}
                        </Dialog.Description>

                        <div className="flex gap-3 justify-end pt-2">
                            <Dialog.Close asChild>
                                <Button variant="outline" size="sm" className="cursor-pointer">
                                    {cancelLabel}
                                </Button>
                            </Dialog.Close>
                            <Button
                                variant={variant}
                                size="sm"
                                className="cursor-pointer"
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
