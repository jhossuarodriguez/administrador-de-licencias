export const TABLE_ITEMS_PER_PAGE = 5;
export const TABLE_PAGE_BUTTON_LIMIT = 5;

export type SearchableValue = string | number | boolean | Date | null | undefined;

export function matchesTableFilter(
    values: readonly SearchableValue[],
    filter: string,
): boolean {
    const normalizedFilter = normalizeTableFilter(filter);

    if (!normalizedFilter) {
        return true;
    }

    return values.some((value) => normalizeTableValue(value).includes(normalizedFilter));
}

export function getVisiblePageNumbers(
    currentPage: number,
    totalPages: number,
    pageButtonLimit: number = TABLE_PAGE_BUTTON_LIMIT,
): number[] {
    const safeTotalPages = Math.max(totalPages, 1);
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
    const safeButtonLimit = Math.max(pageButtonLimit, 1);
    const visibleCount = Math.min(safeButtonLimit, safeTotalPages);
    const halfWindow = Math.floor(visibleCount / 2);
    const firstPage = Math.min(
        Math.max(safeCurrentPage - halfWindow, 1),
        Math.max(safeTotalPages - visibleCount + 1, 1),
    );

    return Array.from({ length: visibleCount }, (_, index) => firstPage + index);
}

function normalizeTableFilter(value: string): string {
    return value.trim().toLocaleLowerCase("es-DO");
}

function normalizeTableValue(value: SearchableValue): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (value instanceof Date) {
        return value.toLocaleDateString("es-DO").toLocaleLowerCase("es-DO");
    }

    return String(value).toLocaleLowerCase("es-DO");
}
