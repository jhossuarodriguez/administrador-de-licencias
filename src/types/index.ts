/**
 * Archivo de re-exportación para tipos
 * Permite importar todos los tipos desde un solo lugar
 */

// Tipos de usuario
export type { User } from './user';

// Tipos de licencias
export type { License, LicenseCost, LicensesByProvider } from './license';

// Tipos de departamentos
export type { Department, DepartmentConfig, useDepartmentsReturn } from './department';

// Tipos de dashboard
export type { DashboardStats, DashboardApiResponse } from './dashboard';

// Tipos de auditoría
export type {
    AuditReports,
    AssignmentHistoryRecord,
    UserActivityRecord,
    ComplianceAnalysis,
    DepartmentAccessRecord,
    LicenseChange,
    AuditResponse
} from './audit';

// Tipos de exportación
export type {
    ExportFormat,
    ExportFormatOption,
    ExportStatistics,
    ExportOptions,
    UseExportOptionsProps,
    UseExportOptionsReturn
} from './export';

// Tipos de filtros
export type {
    ReportFilters,
    TemporalFilters,
    FilterOptions,
    UseFilterOptionsReturn
} from './filters';

// Tipos de constructor de reportes
export type {
    ReportConfig,
    SavedReport,
    Metric,
    GroupByOption,
    ChartType,
    DateRangeOption,
    ReportBuilderOptions,
    UseCustomReportBuilderReturn
} from './reportBuilder';

// Tipos de reportes
export type {
    NotificationPriority,
    NotificationType,
    Primitive,
    Filters,
    SummarySection,
    SummaryResponse,
    TemporalAnalysis,
    TemporalResponse,
    LicenseCreationTrend,
    UtilizationTrend,
    Projection,
    SeasonalAnalysis,
    YearOverYear,
    ExpirationTrend,
    TemporalSummary,
    ReportNotification,
    CostMetricsData,
    UseReportsOptions,
    CustomReportConfig,
    ReportExportOptions,
    CustomReportWhere,
    CustomReportData,
    GroupedByProvider,
    GroupedByDepartment,
    GroupedByBillingCycle,
    UtilizationQueryResult,
    MonthlyTrendQueryResult,
    MonthlyAveragesResult,
    ProviderCost,
    DepartmentCost,
    MonthlyTrend
} from './reports';

// Tipos de sidebar
export type { SidebarContextType } from './sidebar';
