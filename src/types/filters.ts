/**
 * Tipos relacionados con filtros
 */

export interface ReportFilters {
    startDate?: string;
    endDate?: string;
    provider?: string;
    department?: string;
    status?: string;
}

export interface TemporalFilters extends ReportFilters {
    months?: number;
}

export interface FilterOptions {
    providers: string[];
    departments: { id: number; name: string; }[];
    statusOptions: {
        value: string;
        label: string;
        count: number;
    }[];
}

export interface UseFilterOptionsReturn {
    options: FilterOptions | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}
