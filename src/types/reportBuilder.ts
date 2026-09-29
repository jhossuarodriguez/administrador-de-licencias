/**
 * Tipos relacionados con el constructor de reportes personalizados
 */

// Importar el tipo Filters desde reports.ts
import type { Filters } from './reports';

export interface ReportConfig {
    name: string;
    description: string;
    metrics: string[];
    filters: Filters;
    groupBy: string;
    sortBy: string;
    chartType: string;
    dateRange: string;
}

export interface SavedReport {
    id: number;
    name: string;
    description: string;
    lastUsed: string;
    config: ReportConfig;
    createdAt?: string;
}

export interface Metric {
    id: string;
    label: string;
    category: string;
    currentValue: number;
    unit: string;
    compatibleCharts: string[];
    description: string;
}

export interface GroupByOption {
    id: string;
    label: string;
    values: string[];
    compatibleMetrics: string[];
    description: string;
}

export interface ChartType {
    id: string;
    label: string;
    description: string;
    compatibleMetrics: string[];
    icon: string;
}

export interface DateRangeOption {
    id: string;
    label: string;
    description: string;
    compatibleMetrics: string[];
}

export interface ReportBuilderOptions {
    metrics: Metric[];
    groupByOptions: GroupByOption[];
    chartTypes: ChartType[];
    dateRangeOptions: DateRangeOption[];
    statistics: {
        totalMetrics: number;
        totalGroupOptions: number;
        lastUpdated: string;
    };
}

export interface UseCustomReportBuilderReturn {
    // Estado del reporte actual
    reportConfig: ReportConfig;
    setReportConfig: React.Dispatch<React.SetStateAction<ReportConfig>>;

    // Reportes guardados
    savedReports: SavedReport[];
    savedReportsLoading: boolean;
    savedReportsError: string | null;

    // Acciones
    handleMetricToggle: (metricId: string) => void;
    handleSaveReport: () => Promise<void>;
    handleLoadReport: (report: SavedReport) => void;
    handleDeleteReport: (reportId: number) => Promise<void>;
    handleEditReport: (reportId: number) => Promise<void>;
    handleGenerateReport: () => void;

    // Estados
    saving: boolean;
    generating: boolean;
    error: string | null;

    // Funciones de utilidad
    resetReportConfig: () => void;
    validateConfig: () => boolean;
    getConfigSummary: () => void;
}
