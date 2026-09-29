import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        title: 'Confirmar acción',
        message: '¿Estás seguro?',
        onConfirm: vi.fn(),
    }

    it('rendera el título y el mensaje', () => {
        render(<ConfirmDialog {...defaultProps} />)
        expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
        expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    })

    it('rendera la descripción cuando se provee', () => {
        render(<ConfirmDialog {...defaultProps} description="No se puede deshacer" />)
        expect(screen.getByText('No se puede deshacer')).toBeInTheDocument()
    })

    it('llama onConfirm al hacer clic en el botón de confirmación', async () => {
        const user = userEvent.setup()
        const onConfirm = vi.fn()
        render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} confirmLabel="Sí, eliminar" />)

        await user.click(screen.getByRole('button', { name: /sí, eliminar/i }))
        expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('llama onOpenChange(false) al hacer clic en Cancelar', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} cancelLabel="Cancelar" />)

        await user.click(screen.getByRole('button', { name: /cancelar/i }))
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('no rendera cuando open es false', () => {
        render(<ConfirmDialog {...defaultProps} open={false} />)
        expect(screen.queryByText('Confirmar acción')).not.toBeInTheDocument()
    })
})
