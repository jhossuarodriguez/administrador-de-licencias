import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LicenseTableRow } from './LicenseTableRow'
import type { License } from '@/types/license'

const mockLicense: License = {
    id: 42,
    sede: 'Sede Central',
    provider: 'Microsoft',
    startDate: new Date('2024-01-15'),
    expiration: new Date('2024-12-31'),
    assigned: 'Juan Perez',
    departmentId: 1,
    department: { id: 1, name: 'TI', description: null },
    model: 'Office 365',
    plan: 'E3',
    active: true,
    unitCost: 12.50,
    installmentCost: 10,
    penaltyCost: 5,
    currency: 'USD',
    billingCycle: 'MONTHLY',
    totalLicense: 5,
    usedLicense: 2,
    quantity: 5,
}

describe('LicenseTableRow', () => {
    it('rendera los datos de la licencia', () => {
        render(
            <table>
                <tbody>
                    <LicenseTableRow license={mockLicense} isAdmin={true} onEdit={vi.fn()} onDelete={vi.fn()} />
                </tbody>
            </table>
        )
        expect(screen.getByText('Sede Central')).toBeInTheDocument()
        expect(screen.getByText('Microsoft')).toBeInTheDocument()
        expect(screen.getByText('Juan Perez')).toBeInTheDocument()
        expect(screen.getByText('TI')).toBeInTheDocument()
        expect(screen.getByText('Office 365')).toBeInTheDocument()
    })

    it('muestra botones Editar y Eliminar cuando isAdmin', () => {
        render(
            <table>
                <tbody>
                    <LicenseTableRow license={mockLicense} isAdmin={true} onEdit={vi.fn()} onDelete={vi.fn()} />
                </tbody>
            </table>
        )
        expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })

    it('oculta botones de acción cuando !isAdmin', () => {
        render(
            <table>
                <tbody>
                    <LicenseTableRow license={mockLicense} isAdmin={false} onEdit={vi.fn()} onDelete={vi.fn()} />
                </tbody>
            </table>
        )
        expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument()
    })

    it('llama onEdit con el id correcto al hacer clic en Editar', async () => {
        const user = userEvent.setup()
        const onEdit = vi.fn()
        render(
            <table>
                <tbody>
                    <LicenseTableRow license={mockLicense} isAdmin={true} onEdit={onEdit} onDelete={vi.fn()} />
                </tbody>
            </table>
        )
        await user.click(screen.getByRole('button', { name: /editar/i }))
        expect(onEdit).toHaveBeenCalledWith(42)
    })

    it('llama onDelete con el id correcto al hacer clic en Eliminar', async () => {
        const user = userEvent.setup()
        const onDelete = vi.fn()
        render(
            <table>
                <tbody>
                    <LicenseTableRow license={mockLicense} isAdmin={true} onEdit={vi.fn()} onDelete={onDelete} />
                </tbody>
            </table>
        )
        await user.click(screen.getByRole('button', { name: /eliminar/i }))
        expect(onDelete).toHaveBeenCalledWith(42)
    })
})
