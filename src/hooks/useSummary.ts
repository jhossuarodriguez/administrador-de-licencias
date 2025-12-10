import useSWR from "swr";
import { BASE_CHART_CONFIG } from "./useReportTypes";
import { fetcher } from "@/lib/fetcher";
import {
    ReportFilters,
    SummaryResponse
} from "@/types";
import {
    generateCacheKey,
    handleError,
    sanitizeFilters,
    withRetry,
    isNetworkError
} from "@/lib/hookUtils";

export const chartConfig = BASE_CHART_CONFIG;

// Fetcher tipado específicamente para summary
const fetchSummaryWithRetry = async (url: string): Promise<SummaryResponse> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 2, retryDelay: 1500 });
    return result as SummaryResponse;
};

export function useSummary(filters?: ReportFilters) {
    // Sanitizar filtros antes de generar la URL
    const cleanFilters = filters ? sanitizeFilters(filters as Record<string, unknown>) : undefined;
    const url = generateCacheKey('/api/reports/summary', cleanFilters);

    const { data, error, isLoading, mutate } = useSWR<SummaryResponse>(
        url,
        fetchSummaryWithRetry,
        {
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener resumen');
                }
            }
        }
    );

    return {
        data,
        error,
        errorMessage: error ? handleError(error, 'cargar resumen') : null,
        isLoading,
        mutate
    };
}