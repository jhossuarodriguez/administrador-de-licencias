import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditLicenseDialog } from './EditLicenseDialog'
import type { License } from '@/types/license'
import type { Result } from '@/types/result'

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}))

import { toast } from 'sonner'

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

describe('EditLicenseDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra error y NO cierra el modal cuando guardar falla', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        const onEditLicense = vi.fn().mockResolvedValue({
            ok: false,
            error: 'Error del servidor',
        } as Result)

        render(
            <EditLicenseDialog
                license={mockLicense}
                onClose={onClose}
                onEditLicense={onEditLicense}
            />
        )

        await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Error del servidor')
        })
        expect(onClose).not.toHaveBeenCalled()
    })

    it('cierra el modal y muestra éxito cuando guarda bien', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        const onEditLicense = vi.fn().mockResolvedValue({
            ok: true,
            data: undefined,
        } as Result)

        render(
            <EditLicenseDialog
                license={mockLicense}
                onClose={onClose}
                onEditLicense={onEditLicense}
            />
        )

        await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Licencia actualizada')
        })
        expect(onClose).toHaveBeenCalled()
    })

    it('rendera los campos precargados con los datos de la licencia', () => {
        render(
            <EditLicenseDialog
                license={mockLicense}
                onClose={vi.fn()}
                onEditLicense={vi.fn()}
            />
        )

        expect(screen.getByDisplayValue('Microsoft')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Office 365')).toBeInTheDocument()
        expect(screen.getByDisplayValue('E3')).toBeInTheDocument()
    })
})
