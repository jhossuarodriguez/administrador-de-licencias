import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { LicenseCost } from "@/types";
import {
    handleError,
    filterNullish,
    withRetry,
    isNetworkError
} from "@/lib/hookUtils";

// Fetcher tipado específicamente para costos
const fetchCostsWithRetry = async (url: string): Promise<LicenseCost[]> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 3, retryDelay: 1000 });
    return result as LicenseCost[];
};

export function useCosts() {
    const { data, error, isLoading, mutate } = useSWR<LicenseCost[]>(
        '/api/licenses/costs',
        fetchCostsWithRetry,
        {
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener costos');
                }
            }
        }
    );

    // Filtrar costos con datos incompletos
    const validCosts = data ? filterNullish(data) : [];

    return {
        costs: validCosts,
        isLoading,
        error,
        errorMessage: error ? handleError(error, 'cargar costos') : null,
        refetch: mutate
    };
}