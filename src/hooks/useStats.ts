import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { DashboardStats, DashboardApiResponse } from "@/types";
import {
    handleError,
    withRetry,
    isNetworkError
} from "@/lib/hookUtils";

export const chartConfig = {
    usage: {
        label: "Uso Mensual x Usuario",
        color: "#44ADE2",
    }
}

// Transformar datos de la API para asegurar formato correcto
const transformStatsData = (data: unknown): DashboardStats => {
    const rawData = data as DashboardApiResponse;
    return {
        licenses: rawData.licenses || {
            totalLicenses: 0,
            totalUsers: 0,
            activeUsers: 0,
            expiringSoon: 0,
            expired: 0
        },
        trends: rawData.trends ? {
            totalUsersChange: rawData.trends.totalUsersChange || 0,
            totalLicensesChange: rawData.trends.totalLicensesChange || 0,
            utilizationRate: 0, // Este se puede calcular o viene de otro lugar
            monthlyCost: 0 // Este se puede calcular o viene de otro lugar
        } : {
            totalUsersChange: 0,
            totalLicensesChange: 0,
            utilizationRate: 0,
            monthlyCost: 0
        },
        chartData: (rawData.chartData || []).map(item => ({
            month: item.month,
            usage: item.users // Convertir 'users' a 'usage'
        })),
        mostUsed: rawData.mostUsed || [],
        expiringSoonNames: rawData.expiringSoonNames || []
    };
};

// Fetcher con retry y transformación
const fetchStatsWithRetry = async (url: string) => {
    const rawData = await withRetry(() => fetcher(url), { maxRetries: 3, retryDelay: 1000 });
    return transformStatsData(rawData);
};

export function useStats() {
    const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
        '/api/dashboard/stats',
        fetchStatsWithRetry,
        {
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener estadísticas');
                }
            }
        }
    );

    return {
        stats: data,
        isLoading,
        error,
        errorMessage: error ? handleError(error, 'cargar estadísticas') : null,
        refetch: mutate
    };
}
