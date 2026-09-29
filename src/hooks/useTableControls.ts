'use client'

import { useDeferredValue, useMemo, useState, startTransition } from 'react'
import { getVisiblePageNumbers, matchesTableFilter, type SearchableValue } from '@/lib/tableUtils'

export interface UseTableControlsReturn<T> {
    filterText: string
    setFilterText: (value: string) => void
    filteredItems: T[]
    pageItems: T[]
    currentPage: number
    totalPages: number
    goToPage: (page: number) => void
    totalItems: number
    filteredCount: number
    hasFilter: boolean
    visibleStart: number
    visibleEnd: number
    visiblePageNumbers: number[]
}

export function useTableControls<T>(
    items: T[],
    searchFields: (item: T) => SearchableValue[],
    perPage = 5,
): UseTableControlsReturn<T> {
    const [filterText, setFilterTextState] = useState('')
    const [page, setPage] = useState(1)
    const deferred = useDeferredValue(filterText).trim()

    const filtered = useMemo(
        () => (deferred ? items.filter((item) => matchesTableFilter(searchFields(item), deferred)) : items),
        [items, deferred, searchFields],
    )

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
    const currentPage = Math.min(page, totalPages)
    const pageStart = (currentPage - 1) * perPage
    const pageItems = filtered.slice(pageStart, pageStart + perPage)
    const visiblePageNumbers = getVisiblePageNumbers(currentPage, totalPages)

    return {
        filterText,
        setFilterText: (value: string) => {
            setFilterTextState(value)
            startTransition(() => setPage(1))
        },
        filteredItems: filtered,
        pageItems,
        currentPage,
        totalPages,
        goToPage: (next: number) => {
            const bounded = Math.min(Math.max(next, 1), totalPages)
            startTransition(() => setPage(bounded))
        },
        totalItems: items.length,
        filteredCount: filtered.length,
        hasFilter: deferred.length > 0,
        visibleStart: filtered.length === 0 ? 0 : pageStart + 1,
        visibleEnd: Math.min(pageStart + perPage, filtered.length),
        visiblePageNumbers,
    }
}
