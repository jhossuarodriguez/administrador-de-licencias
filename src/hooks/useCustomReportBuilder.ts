import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
    ReportConfig,
    SavedReport,
    UseCustomReportBuilderReturn
} from '@/types';
import {
    handleError,
    validateRequiredFields,
    sanitizeFilters,
    withRetry,
    throttle
} from '@/lib/hookUtils';

export function useCustomReportBuilder(
    onGenerateReport?: (config: ReportConfig) => void
): UseCustomReportBuilderReturn {
    const [reportConfig, setReportConfig] = useState<ReportConfig>({
        name: '',
        description: '',
        metrics: [],
        filters: {},
        groupBy: '',
        sortBy: '',
        chartType: 'bar',
        dateRange: '30'
    });

    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener reportes guardados
    const {
        data: savedReportsData,
        error: savedReportsError,
        isLoading: savedReportsLoading,
        mutate: mutateSavedReports
    } = useSWR<{ reports: SavedReport[] }>('/api/reports/saved', fetcher);

    const savedReports: SavedReport[] = savedReportsData?.reports || [];

    // Función throttled para autoguardado (limita la frecuencia de guardados)
    const throttledAutoSave = useMemo(
        () => throttle((config: unknown) => {
            const reportConfig = config as ReportConfig;
            console.log('Auto-guardando configuración...', reportConfig);
            if (typeof window !== 'undefined') {
                localStorage.setItem('draft-report-config', JSON.stringify(reportConfig));
            }
        }, 5000), // Máximo una vez cada 5 segundos
        []
    );

    // Efecto para auto-guardar cuando cambia la configuración
    useEffect(() => {
        if (reportConfig.name || reportConfig.metrics.length > 0) {
            throttledAutoSave(reportConfig);
        }
    }, [reportConfig, throttledAutoSave]);

    // Manejar toggle de métricas
    const handleMetricToggle = (metricId: string) => {
        setReportConfig(prev => ({
            ...prev,
            metrics: prev.metrics.includes(metricId)
                ? prev.metrics.filter(m => m !== metricId)
                : [...prev.metrics, metricId]
        }));
    };

    // Validar configuración usando validateRequiredFields
    const validateConfig = (): boolean => {
        const isValid = validateRequiredFields(reportConfig as unknown as Record<string, unknown>, ['name', 'metrics']);

        if (!isValid || !reportConfig.name.trim()) {
            setError('El nombre del reporte es requerido');
            return false;
        }
        if (reportConfig.metrics.length === 0) {
            setError('Debe seleccionar al menos una métrica');
            return false;
        }
        setError(null);
        return true;
    };

    // Guardar reporte con retry y manejo de errores mejorado
    const handleSaveReport = async (): Promise<void> => {
        if (!validateConfig()) return;

        setSaving(true);
        setError(null);

        try {
            // Sanitizar filtros antes de enviar
            const sanitizedConfig = {
                ...reportConfig,
                filters: sanitizeFilters(reportConfig.filters)
            };

            await withRetry(async () => {
                const response = await fetch('/api/reports/saved', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: sanitizedConfig.name,
                        description: sanitizedConfig.description,
                        config: sanitizedConfig
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al guardar el reporte');
                }

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de reportes guardados
            await mutateSavedReports();

            console.log('Reporte guardado exitosamente');

        } catch (err) {
            const errorMessage = handleError(err, 'guardar reporte');
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Cargar reporte
    const handleLoadReport = (report: SavedReport): void => {
        if (report.config) {
            setReportConfig(report.config);
            setError(null);

            // Actualizar fecha de último uso
            // En un entorno real, esto haría una llamada a la API
            console.log('Reporte cargado:', report.name);
        }
    };

    // Eliminar reporte con manejo de errores mejorado
    const handleDeleteReport = async (reportId: number): Promise<void> => {
        try {
            await withRetry(async () => {
                const response = await fetch(`/api/reports/saved?id=${reportId}`, {
                    method: 'DELETE',
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al eliminar el reporte');
                }

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de reportes guardados
            await mutateSavedReports();

            console.log('Reporte eliminado exitosamente');

        } catch (err) {
            const errorMessage = handleError(err, 'eliminar reporte');
            setError(errorMessage);
        }
    };

    // Editar reporte con manejo de errores mejorado
    const handleEditReport = async (reportId: number): Promise<void> => {
        if (!validateConfig()) return;

        setSaving(true);
        setError(null);

        try {
            // Sanitizar filtros antes de enviar
            const sanitizedConfig = {
                ...reportConfig,
                filters: sanitizeFilters(reportConfig.filters)
            };

            await withRetry(async () => {
                const response = await fetch(`/api/reports/saved?id=${reportId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: sanitizedConfig.name,
                        description: sanitizedConfig.description,
                        config: sanitizedConfig
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al actualizar el reporte');
                }

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de reportes guardados
            await mutateSavedReports();

            console.log('Reporte actualizado exitosamente');

        } catch (err) {
            const errorMessage = handleError(err, 'actualizar reporte');
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Generar reporte con manejo de errores mejorado
    const handleGenerateReport = (): void => {
        if (!validateConfig()) return;

        setGenerating(true);
        setError(null);

        try {
            if (onGenerateReport) {
                onGenerateReport(reportConfig);
            }
        } catch (err) {
            const errorMessage = handleError(err, 'generar reporte');
            setError(errorMessage);
        } finally {
            setGenerating(false);
        }
    };

    // Resetear configuración
    const resetReportConfig = (): void => {
        setReportConfig({
            name: '',
            description: '',
            metrics: [],
            filters: {},
            groupBy: '',
            sortBy: '',
            chartType: 'bar',
            dateRange: '30'
        });
        setError(null);
    };

    // Obtener resumen de la configuración (sin efectos secundarios)
    const getConfigSummary = () => {
        // Validación inline sin modificar el estado
        const hasValidName = !!reportConfig.name.trim();
        const hasMetrics = reportConfig.metrics.length > 0;
        const isValid = hasValidName && hasMetrics;

        return {
            hasName: hasValidName,
            hasDescription: !!reportConfig.description.trim(),
            metricsCount: reportConfig.metrics.length,
            hasGroupBy: !!reportConfig.groupBy,
            hasChartType: !!reportConfig.chartType,
            hasDateRange: !!reportConfig.dateRange,
            isValid: isValid
        };
    };

    // Limpiar errores automáticamente después de 5 segundos
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return {
        // Estado del reporte actual
        reportConfig,
        setReportConfig,

        // Reportes guardados
        savedReports,
        savedReportsLoading,
        savedReportsError: savedReportsError?.message || null,

        // Acciones
        handleMetricToggle,
        handleSaveReport,
        handleLoadReport,
        handleDeleteReport,
        handleEditReport,
        handleGenerateReport,

        // Estados
        saving,
        generating,
        error,

        // Funciones de utilidad
        resetReportConfig,
        validateConfig,
        getConfigSummary
    };
}