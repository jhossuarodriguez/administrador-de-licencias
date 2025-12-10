import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { generateCacheKey } from '@/lib/hookUtils';
import {
    ExportOptions,
    UseExportOptionsProps,
    UseExportOptionsReturn
} from '@/types';

export function useExportOptions({ filters, refreshTrigger = 0 }: UseExportOptionsProps = {}): UseExportOptionsReturn {
    const url = generateCacheKey('/api/reports/export-options', {
        ...filters,
        trigger: refreshTrigger
    });

    const { data, error, isLoading, mutate } = useSWR<ExportOptions>(
        url,
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