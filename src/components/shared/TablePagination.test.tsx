import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TablePagination } from './TablePagination'

describe('TablePagination', () => {
    const defaultProps = {
        currentPage: 2,
        totalPages: 5,
        visiblePageNumbers: [1, 2, 3, 4, 5],
        onPageChange: vi.fn(),
    }

    it('rendera los números de página visibles', () => {
        render(<TablePagination {...defaultProps} />)
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('muestra "Página X de Y"', () => {
        render(<TablePagination {...defaultProps} />)
        expect(screen.getByText(/Página 2 de 5/)).toBeInTheDocument()
    })

    it('deshabilita Anterior en la página 1', () => {
        render(<TablePagination {...defaultProps} currentPage={1} />)
        expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
    })

    it('deshabilita Siguiente en la última página', () => {
        render(<TablePagination {...defaultProps} currentPage={5} />)
        expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
    })

    it('marca la página actual con aria-current', () => {
        render(<TablePagination {...defaultProps} currentPage={3} />)
        const page3 = screen.getByRole('button', { name: '3' })
        expect(page3).toHaveAttribute('aria-current', 'page')
    })

    it('llama onPageChange al hacer clic en un número de página', async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn()
        render(<TablePagination {...defaultProps} onPageChange={onPageChange} />)

        await user.click(screen.getByRole('button', { name: '4' }))
        expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('llama onPageChange(al anterior) al hacer clic en Anterior', async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn()
        render(<TablePagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)

        await user.click(screen.getByRole('button', { name: /anterior/i }))
        expect(onPageChange).toHaveBeenCalledWith(2)
    })
})
