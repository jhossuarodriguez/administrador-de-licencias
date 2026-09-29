/**
 * Librería de Exportación de Reportes
 * 
 * Contiene toda la lógica para exportar reportes en formato CSV
 * tanto para reportes estándar como personalizados.
 */

import type { ExportFormat, CustomReportConfig } from '@/types';

// ==================== TIPOS LOCALES ====================

export interface ExportOptions {
    filename?: string;
    includeTimestamp?: boolean;
    autoDownload?: boolean;
}

// ==================== UTILIDADES ====================

/**
 * Genera un nombre de archivo con timestamp opcional
 */
export const generateFilename = (
    baseName: string,
    format: ExportFormat,
    includeTimestamp: boolean = true
): string => {
    const timestamp = includeTimestamp
        ? `_${new Date().toISOString().split('T')[0]}`
        : '';
    return `${baseName}${timestamp}.${format}`;
};

/**
 * Descarga un blob como archivo
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

/**
 * Convierte datos JSON a CSV
 */
export const jsonToCSV = (data: Record<string, unknown>[]): string => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Agregar encabezados
    csvRows.push(headers.join(','));

    // Agregar filas
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Escapar valores que contengan comas o comillas
            const escaped = ('' + value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

// ==================== EXPORTACIÓN ESTÁNDAR ====================

/**
 * Exporta un reporte estándar en el formato especificado
 */
export const exportStandardReport = async (
    format: ExportFormat,
    exportReportFn: (format: ExportFormat) => Promise<void>
): Promise<void> => {
    try {
        await exportReportFn(format);
        console.log(`Reporte exportado exitosamente en formato ${format}`);
    } catch (error) {
        console.error('Error al exportar reporte:', error);
        throw new Error(`Error al exportar reporte en formato ${format}`);
    }
};

// ==================== EXPORTACIÓN PERSONALIZADA ====================

/**
 * Genera un reporte personalizado
 */
export const generateCustomReport = async (
    config: CustomReportConfig,
    generateReportFn: (config: CustomReportConfig) => Promise<unknown>
): Promise<unknown> => {
    try {
        const data = await generateReportFn(config);
        console.log('Reporte personalizado generado:', data);
        return data;
    } catch (error) {
        console.error('Error al generar reporte personalizado:', error);
        throw new Error('Error al generar el reporte personalizado');
    }
};

/**
 * Exporta un reporte personalizado en formato CSV
 */
export const exportCustomReport = async (
    config: CustomReportConfig,
    format: ExportFormat = 'csv',
    options?: ExportOptions
): Promise<void> => {
    try {
        const response = await fetch('/api/reports/custom-export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                config,
                format
            }),
        });

        if (!response.ok) {
            throw new Error('Error al exportar reporte personalizado');
        }

        // Descargar archivo CSV
        const blob = await response.blob();
        const filename = generateFilename(
            config.name || 'reporte_personalizado',
            format,
            options?.includeTimestamp ?? true
        );

        if (options?.autoDownload !== false) {
            downloadBlob(blob, filename);
        }

        console.log(`Reporte personalizado exportado exitosamente: ${filename}`);
    } catch (error) {
        console.error('Error al exportar reporte personalizado:', error);
        throw new Error('Error al exportar el reporte personalizado');
    }
};

// ==================== EXPORTACIÓN POR TIPO ====================

/**
 * Exporta datos como CSV
 */
export const exportAsCSV = (data: Record<string, unknown>[], filename: string): void => {
    const csvString = jsonToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
};

// ==================== HANDLERS ====================

/**
 * Handler para exportación estándar
 */
export const createExportHandler = (
    exportReportFn: (format: ExportFormat) => Promise<void>
) => {
    return async (format: ExportFormat) => {
        await exportStandardReport(format, exportReportFn);
    };
};

/**
 * Handler para generación de reporte personalizado
 */
export const createCustomReportHandler = (
    generateReportFn: (config: CustomReportConfig) => Promise<unknown>
) => {
    return async (config: CustomReportConfig) => {
        try {
            const data = await generateCustomReport(config, generateReportFn);
            alert('Reporte personalizado generado exitosamente');
            return data;
        } catch (error) {
            alert('Error al generar reporte personalizado');
            throw error;
        }
    };
};

/**
 * Handler para exportación de reporte personalizado
 */
export const createCustomExportHandler = () => {
    return async (
        config: CustomReportConfig,
        format: ExportFormat,
        options?: ExportOptions
    ) => {
        await exportCustomReport(config, format, options);
    };
};
