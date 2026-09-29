import { useCallback } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
    ReportBuilderOptions,
    GroupByOption,
    ChartType,
    DateRangeOption
} from '@/types';

interface UseReportBuilderOptionsReturn {
    options: ReportBuilderOptions | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    getCompatibleCharts: (selectedMetrics: string[]) => ChartType[];
    getCompatibleGroupOptions: (selectedMetrics: string[]) => GroupByOption[];
    getCompatibleDateRanges: (selectedMetrics: string[]) => DateRangeOption[];
}

export function useReportBuilderOptions(): UseReportBuilderOptionsReturn {
    const { data, error, isLoading, mutate } = useSWR<ReportBuilderOptions>(
        '/api/reports/builder-options',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000 // Cache por 5 segundos
        }
    );

    const getCompatibleCharts = useCallback((selectedMetrics: string[]): ChartType[] => {
        if (!data || selectedMetrics.length === 0) return data?.chartTypes || [];

        return data.chartTypes.filter(chart =>
            selectedMetrics.some(metric =>
                chart.compatibleMetrics.includes(metric)
            )
        );
    }, [data]);

    const getCompatibleGroupOptions = useCallback((selectedMetrics: string[]): GroupByOption[] => {
        if (!data || selectedMetrics.length === 0) return data?.groupByOptions || [];

        return data.groupByOptions.filter(group =>
            selectedMetrics.some(metric =>
                group.compatibleMetrics.includes(metric)
            )
        );
    }, [data]);

    const getCompatibleDateRanges = useCallback((selectedMetrics: string[]): DateRangeOption[] => {
        if (!data || selectedMetrics.length === 0) return data?.dateRangeOptions || [];

        return data.dateRangeOptions.filter(range =>
            selectedMetrics.some(metric =>
                range.compatibleMetrics.includes(metric)
            )
        );
    }, [data]);

    return {
        options: data || null,
        loading: isLoading,
        error: error?.message || null,
        refetch: mutate,
        getCompatibleCharts,
        getCompatibleGroupOptions,
        getCompatibleDateRanges
    };
}