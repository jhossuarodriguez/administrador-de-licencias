'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
    SummaryResponse,
    UseReportsOptions,
    CostMetricsData,
    ReportNotification,
    Filters,
    AuditResponse,
    TemporalResponse
} from '@/types';
import {
    generateCacheKey,
    combineLoadingStates,
    handleError,
    formatDateForAPI,
    invalidateCacheKeys
} from '@/lib/hookUtils';

export function useReports(options: UseReportsOptions = {}) {
    const { filters = {}, autoRefresh = false, refreshInterval = 30000 } = options;
    const [exportLoading, setExportLoading] = useState(false);

    // Memoizar filtros para evitar re-renders innecesarios
    const stableFilters = useMemo(() => filters, [filters]);

    const swrConfig = {
        refreshInterval: autoRefresh ? refreshInterval : 0,
        revalidateOnFocus: false
    };

    // Hook para resumen de reportes
    const {
        data: summaryData,
        error: summaryError,
        isLoading: summaryLoading,
        mutate: mutateSummary
    } = useSWR<SummaryResponse>(
        useMemo(() => generateCacheKey('/api/reports/summary', stableFilters), [stableFilters]),
        fetcher,
        swrConfig
    );

    // Hook para reportes de auditoría
    const {
        data: auditData,
        error: auditError,
        isLoading: auditLoading,
        mutate: mutateAudit
    } = useSWR<AuditResponse>(
        useMemo(() => generateCacheKey('/api/reports/audit', stableFilters), [stableFilters]),
        fetcher,
        swrConfig
    );

    // Hook para análisis temporal
    const {
        data: temporalData,
        error: temporalError,
        isLoading: temporalLoading,
        mutate: mutateTemporal
    } = useSWR<TemporalResponse>(
        useMemo(() => generateCacheKey('/api/reports/temporal', { ...stableFilters, months: 12 }), [stableFilters]),
        fetcher,
        swrConfig
    );

    // Función simplificada para exportar (solo CSV ahora) con formateo de fechas mejorado
    const exportReport = async (format: 'csv') => {
        setExportLoading(true);
        try {
            const url = generateCacheKey('/api/reports/export', { ...stableFilters, format });
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();

            const filename = `reporte_licencias_${formatDateForAPI(new Date())}.csv`;
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            const errorMessage = handleError(error, 'exportar reporte');
            alert(errorMessage);
        } finally {
            setExportLoading(false);
        }
    };

    // Función para generar reporte personalizado
    const generateCustomReport = async (config: Filters) => {
        try {
            const url = generateCacheKey('/api/reports/summary', config);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data as SummaryResponse;
        } catch (error) {
            console.error('Error al generar reporte personalizado:', error);
            throw error;
        }
    };

    // Función para refrescar todos los datos usando invalidateCacheKeys
    const refreshAll = async () => {
        const cacheKeys = [
            generateCacheKey('/api/reports/summary', stableFilters),
            generateCacheKey('/api/reports/audit', stableFilters),
            generateCacheKey('/api/reports/temporal', { ...stableFilters, months: 12 })
        ];

        // Invalidar múltiples cachés de forma eficiente
        await invalidateCacheKeys(
            (key: string) => {
                if (key.includes('summary')) return mutateSummary();
                if (key.includes('audit')) return mutateAudit();
                if (key.includes('temporal')) return mutateTemporal();
                return Promise.resolve();
            },
            cacheKeys
        );
    };

    return {
        // Datos
        summaryData,
        auditData,
        temporalData,

        // Estados de carga
        summaryLoading,
        auditLoading,
        temporalLoading,
        exportLoading,
        isLoading: combineLoadingStates(summaryLoading, auditLoading, temporalLoading),

        // Errores
        summaryError,
        auditError,
        temporalError,
        hasError: Boolean(summaryError || auditError || temporalError),

        // Funciones
        exportReport,
        generateCustomReport,
        refreshAll,

        // Funciones de mutación para refrescar datos específicos
        mutateSummary,
        mutateAudit,
        mutateTemporal
    };
}

// Hook específico para métricas de costo
export function useCostMetrics(filters: Filters = {}) {
    const [costData, setCostData] = useState<CostMetricsData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const fetchCostData = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams(
                    Object.entries(filters).reduce((acc, [key, value]) => {
                        if (value !== null && value !== undefined) {
                            acc[key] = String(value);
                        }
                        return acc;
                    }, {} as Record<string, string>)
                ).toString();
                const response = await fetch(`/api/reports/summary?${queryParams}`, {
                    signal: controller.signal
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: SummaryResponse = await response.json();

                // Procesar datos para análisis de costos
                const processedData: CostMetricsData = {
                    ...data,
                    costEfficiency: data.summary?.utilizationRate ?? 0,
                    monthlyTrend: data.monthlyTrends ?? [],
                    providerCosts: data.licensesByProvider ?? [],
                    departmentCosts: data.utilizationByDept ?? []
                };

                setCostData(processedData);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error al obtener métricas de costo:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCostData();
        return () => controller.abort();
    }, [filters]);

    return { costData, loading };
}

// Hook para notificaciones de reportes
export function useReportNotifications() {
    const [notifications, setNotifications] = useState<ReportNotification[]>([]);

    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const response = await fetch('/api/reports/summary');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: SummaryResponse = await response.json();

                const newNotifications: ReportNotification[] = [];

                // Verificar licencias próximas a vencer
                if (data.expiringSoon && data.expiringSoon.length > 0) {
                    newNotifications.push({
                        id: 'expiring',
                        type: 'warning',
                        title: 'Licencias Próximas a Vencer',
                        message: `${data.expiringSoon.length} licencias vencen en los próximos 30 días`,
                        priority: 'high'
                    });
                }

                // Verificar utilización baja
                if (data.summary && data.summary.utilizationRate !== undefined && data.summary.utilizationRate < 60) {
                    newNotifications.push({
                        id: 'low-utilization',
                        type: 'info',
                        title: 'Utilización Baja',
                        message: `La utilización actual es ${data.summary.utilizationRate.toFixed(1)}%`,
                        priority: 'medium'
                    });
                }

                setNotifications(newNotifications);
            } catch (error) {
                console.error('Error al generar notificaciones de reportes', error);
            }
        };

        checkNotifications();
        const interval: number = window.setInterval(checkNotifications, 300000); // Cada 5 minutos

        return () => window.clearInterval(interval);
    }, []);

    return { notifications, setNotifications };
}