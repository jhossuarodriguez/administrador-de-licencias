import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ReportFilters, AuditReports } from "@/types";
import {
    generateCacheKey,
    handleError,
    sanitizeFilters,
    withRetry,
    isNetworkError
} from "@/lib/hookUtils";

// Fetcher tipado específicamente para audit
const fetchAuditWithRetry = async (url: string): Promise<AuditReports> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 2, retryDelay: 1500 });
    return result as AuditReports;
};

export function useAudit(filters?: ReportFilters) {
    // Sanitizar filtros antes de generar la URL
    const cleanFilters = filters ? sanitizeFilters(filters as Record<string, unknown>) : undefined;
    const url = generateCacheKey('/api/reports/audit', cleanFilters);

    const { data, isLoading, error, mutate } = useSWR<AuditReports>(
        url,
        fetchAuditWithRetry,
        {
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener reportes de auditoría');
                }
            }
        }
    );

    return {
        data,
        isLoading,
        error,
        errorMessage: error ? handleError(error, 'cargar reporte de auditoría') : null,
        mutate
    };
}