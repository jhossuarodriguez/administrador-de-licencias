/**
 * Tipos compartidos para reportes
 * Re-exporta desde @/types para mantener compatibilidad
 */

import type { ReportFilters, TemporalFilters } from '@/types';
export type { ReportFilters, TemporalFilters } from '@/types';

/**
 * Colores para gráficos
 */
export const CHART_COLORS = [
    '#0088FE', // Azul
    '#00C49F', // Verde agua
    '#FFBB28', // Amarillo
    '#FF8042', // Naranja
    '#8884D8', // Morado
    '#82CA9D', // Verde claro
    '#FFC658', // Amarillo dorado
    '#FF6B9D', // Rosa
    '#A4DE6C', // Verde lima
    '#8DD1E1', // Azul claro
] as const;

/**
 * Configuración de gráficos base
 */
export const BASE_CHART_CONFIG = {
    licenses: {
        label: "Licencias",
        color: "#44ADE2",
    },
    cost: {
        label: "Costo",
        color: "#44ADE2",
    },
    utilization: {
        label: "Utilización",
        color: "#44ADE2",
    },
    projection: {
        label: "Proyección",
        color: "#44ADE2",
    },
    savings: {
        label: "Ahorros",
        color: "#44ADE2",
    },
} as const;

/**
 * Helper para construir query strings desde filtros
 */
export function buildQueryString(filters?: ReportFilters | TemporalFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);

    // Para filtros temporales
    if ('months' in filters && filters.months) {
        params.append('months', filters.months.toString());
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Helper para formatear moneda
 */
export function formatCurrency(value: number): string {
    return value.toLocaleString('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0
    });
}
/**
 * Helper para formatear porcentaje
 */
export function formatPercentage(value: number, decimals: number = 0): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Helper para formatear fechas
 */
export function formatDate(date: Date | string, locale: string = 'es-ES', options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, options);
}
