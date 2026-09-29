import useSWR from "swr";
import { BASE_CHART_CONFIG } from "./useReportTypes";
import { fetcher } from "@/lib/fetcher";
import { TemporalFilters, TemporalAnalysis } from "@/types";
import {
    generateCacheKey,
    handleError,
    sanitizeFilters,
    withRetry,
    isNetworkError
} from "@/lib/hookUtils";

export const chartConfig = BASE_CHART_CONFIG;

// Fetcher tipado específicamente para temporal
const fetchTemporalWithRetry = async (url: string): Promise<TemporalAnalysis> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 2, retryDelay: 1500 });
    return result as TemporalAnalysis;
};

export function useTemporal(filters?: TemporalFilters) {
    // Sanitizar filtros antes de generar la URL
    const cleanFilters = filters ? sanitizeFilters(filters as Record<string, unknown>) : undefined;
    const url = generateCacheKey('/api/reports/temporal', cleanFilters);

    const { data, isLoading, error, mutate } = useSWR<TemporalAnalysis>(
        url,
        fetchTemporalWithRetry,
        {
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener análisis temporal');
                }
            }
        }
    );

    return {
        data,
        isLoading,
        error,
        errorMessage: error ? handleError(error, 'cargar análisis temporal') : null,
        mutate
    };
}