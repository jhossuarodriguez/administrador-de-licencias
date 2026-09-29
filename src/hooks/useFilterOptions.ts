import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { FilterOptions, UseFilterOptionsReturn } from '@/types';

export function useFilterOptions(options?: { refreshTrigger?: number }): UseFilterOptionsReturn {
    const { refreshTrigger = 0 } = options || {};

    const { data, error, isLoading, mutate } = useSWR<FilterOptions>(
        `/api/reports/filter-options?trigger=${refreshTrigger}`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000
        }
    );

    return {
        options: data || null,
        loading: isLoading,
        error: error?.message || null,
        refetch: mutate
    };
}