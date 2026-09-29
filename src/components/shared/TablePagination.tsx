'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

interface TablePaginationProps {
    currentPage: number
    totalPages: number
    visiblePageNumbers: number[]
    onPageChange: (page: number) => void
}

export function TablePagination({
    currentPage,
    totalPages,
    visiblePageNumbers,
    onPageChange,
}: TablePaginationProps) {
    return (
        <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="flex flex-wrap items-center justify-center gap-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft data-icon="inline-start" />
                    Anterior
                </Button>
                {visiblePageNumbers.map((pageNumber) => (
                    <Button
                        key={pageNumber}
                        type="button"
                        variant={pageNumber === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className={cn('min-w-8 px-3', pageNumber === currentPage && 'shadow-sm')}
                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </Button>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Siguiente
                    <ChevronRight data-icon="inline-end" />
                </Button>
            </div>
        </div>
    )
}
