import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LicenseCard } from './LicenseCard'
import type { License } from '@/types/license'

const license: License = {
    id: 42,
    sede: 'Sede Central',
    provider: 'Microsoft',
    startDate: new Date('2024-01-15'),
    expiration: null,
    assigned: 'Juan Perez',
    departmentId: 1,
    department: { id: 1, name: 'TI', description: null },
    model: 'Office 365',
    plan: 'E3',
    active: true,
    unitCost: 12.5,
    installmentCost: 10,
    penaltyCost: 5,
    currency: 'USD',
    billingCycle: 'MONTHLY',
    totalLicense: 5,
    usedLicense: 2,
    quantity: 5,
}

describe('LicenseCard', () => {
    it('muestra un valor alternativo cuando la fecha de termino es nula', () => {
        render(<LicenseCard license={license} isAdmin={false} onEdit={vi.fn()} />)

        expect(screen.getByText('No asignado')).toBeInTheDocument()
    })
})
