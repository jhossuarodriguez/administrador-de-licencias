/**
 * Tipos relacionados con exportación de reportes
 */

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportFormatOption {
    format: string;
    label: string;
    description: string;
    icon: string;
    enabled: boolean;
    recordCount: number;
    fileSize: number;
    features: string[];
}

export interface ExportStatistics {
    totalRecords: number;
    activeRecords: number;
    expiringRecords: number;
    totalCost: number;
    utilizationRate: number;
    totalLicense: number;
    usedLicense: number;
}

export interface ExportOptions {
    formats: ExportFormatOption[];
    statistics: ExportStatistics;
    filters: {
        startDate: string | null;
        endDate: string | null;
        provider: string | null;
        department: string | null;
        status: string | null;
    };
    lastUpdated: string;
}

export interface UseExportOptionsProps {
    filters?: {
        startDate?: string;
        endDate?: string;
        provider?: string;
        department?: string;
        status?: string;
    };
    refreshTrigger?: number;
}

export interface UseExportOptionsReturn {
    options: ExportOptions | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}
