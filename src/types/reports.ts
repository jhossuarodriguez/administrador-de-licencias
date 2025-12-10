/**
 * Tipos centralizados para el sistema de reportes
 * Interfaces compartidas entre componentes, hooks y APIs
 * 
 * Nota: Los tipos de auditoría están en src/types/audit.ts
 * y se exportan desde src/types/index.ts
 */

// ==================== TIPOS BÁSICOS ====================

export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationType = 'info' | 'warning' | 'error';
export type Primitive = string | number | boolean | null | undefined;
export type Filters = Record<string, Primitive | Primitive[]>;

// ==================== INTERFACES DE REPORTES DE RESUMEN ====================

export interface SummarySection {
    utilizationRate?: number;
    totalLicenses?: number;
    activeLicenses?: number;
    inactiveLicenses?: number;
    totalLicense?: number;
    usedLicense?: number;
    monthlyCost?: number;
    annualProjection?: number;
    monthlyTrend?: number;
    costEfficiency?: number;
    avgCostPerLicense?: number;
    potentialSavings?: number;
}

export interface SummaryResponse {
    summary?: SummarySection;
    expiringSoon?: ExpiringSoonLicense[];
    monthlyTrends?: MonthlyTrend[];
    licensesByProvider?: ProviderCost[];
    utilizationByDept?: DepartmentCost[];
    topUsers?: TopUser[];
    costProjections?: Array<{
        month: string;
        current_cost: number;
        projected_cost: number;
        savings_potential: number;
    }>;
    underutilizedLicenses?: Array<{
        provider: string;
        model: string;
        usedLicense: number;
        totalLicense: number;
        monthlyCost: number;
        potentialSavings: number;
    }>;
}

// ==================== INTERFACES DE ANÁLISIS TEMPORAL ====================

/**
 * Tendencia de creación de licencias por mes
 */
export interface LicenseCreationTrend {
    month: Date;
    licenses_created: number;
    total_seats_added: number;
    total_cost_added: number;
    providers: string;
}

/**
 * Tendencia de utilización por mes
 */
export interface UtilizationTrend {
    month: Date;
    total_seats: number;
    used_seats: number;
    utilization_percentage: number;
}

/**
 * Proyección futura
 */
export interface Projection {
    month: Date;
    projected_licenses: number;
    projected_cost: number;
    projected_seats: number;
    confidence: number;
}

/**
 * Análisis estacional por mes
 */
export interface SeasonalAnalysis {
    month_date: Date;
    month_number: number;
    total_licenses: number;
    avg_monthly_licenses: number;
    total_cost: number;
}

/**
 * Comparativa año a año
 */
export interface YearOverYear {
    year: number;
    total_licenses: number;
    total_seats: number;
    total_cost: number;
    unique_providers: number;
}

/**
 * Tendencias de vencimiento
 */
export interface ExpirationTrend {
    expiration_month: Date;
    expiring_licenses: number;
    expiring_cost: number;
    expiring_seats: number;
}

/**
 * Resumen del análisis temporal
 */
export interface TemporalSummary {
    totalMonthsAnalyzed: number;
    provider: string;
    generatedAt: Date;
    avgMonthlyGrowth: {
        avg_licenses_per_month: number;
        avg_cost_per_month: number;
        avg_seats_per_month: number;
    };
}

/**
 * Análisis temporal completo
 */
export interface TemporalAnalysis {
    licenseCreationTrends?: LicenseCreationTrend[];
    utilizationTrends?: UtilizationTrend[];
    projections?: Projection[];
    seasonalAnalysis?: SeasonalAnalysis[];
    yearOverYear?: YearOverYear[];
    expirationTrends?: ExpirationTrend[];
    summary?: TemporalSummary;
}

// ==================== NOTIFICACIONES ====================

export interface ReportNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
}

// ==================== MÉTRICAS DE COSTO ====================

/**
 * Tendencia mensual de licencias
 */
export interface MonthlyTrend {
    month: Date;
    licenses_created: number;
    total_seats: number;
    used_seats: number;
    total_cost: number;
}

/**
 * Costo agrupado por proveedor
 */
export interface ProviderCost {
    provider: string;
    _count: {
        id: number;
    };
    _sum: {
        totalLicense: number | null;
        usedLicense: number | null;
        unitCost: number | null;
    };
}

/**
 * Costo agrupado por departamento
 */
export interface DepartmentCost {
    departmentId: number | null;
    departmentName?: string;
    _count: {
        id: number;
    };
    _sum: {
        totalLicense: number | null;
        usedLicense: number | null;
        unitCost: number | null;
    };
    _avg: {
        usedLicense: number | null;
        totalLicense: number | null;
    };
}

/**
 * Licencia próxima a vencer con asignaciones
 */
export interface ExpiringSoonLicense {
    id: number;
    provider: string;
    model: string;
    unitCost: number;
    totalLicense: number;
    usedLicense: number;
    expiration: Date;
    active: boolean;
    departmentId: number | null;
    department?: {
        id: number;
        name: string;
    };
    Assignment: {
        id: number;
        userId: number;
        licenseId: number;
        assignedAt: Date;
        user: {
            id: number;
            name: string;
            email: string;
            department: string | null;
        };
    }[];
}

/**
 * Usuario con información de asignaciones de licencias
 */
export interface TopUser {
    id: number;
    name: string;
    email: string;
    department: string | null;
    assignmentCount: number;
    totalCost: number;
    Assignment: {
        id: number;
        userId: number;
        licenseId: number;
        assignedAt: Date;
        license: {
            id: number;
            provider: string;
            model: string;
            unitCost: number;
        };
    }[];
}

/**
 * Métricas de costo extendidas basadas en SummaryResponse
 */
export interface CostMetricsData extends SummaryResponse {
    costEfficiency: number;
    monthlyTrend: MonthlyTrend[];
    providerCosts: ProviderCost[];
    departmentCosts: DepartmentCost[];
}

// ==================== CONFIGURACIÓN DE REPORTES ====================

export interface UseReportsOptions {
    filters?: Filters;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export interface CustomReportConfig {
    name?: string;
    metrics?: string[];
    groupBy?: string;
    chartType?: string;
    filters?: Filters;
    dateRange?: {
        startDate?: string;
        endDate?: string;
    };
    sortBy?: string;
    [key: string]: unknown;
}

// ==================== CUSTOM EXPORT TYPES ====================

/**
 * Condiciones de búsqueda para reportes personalizados
 */
export interface CustomReportWhere {
    active?: boolean;
    expiration?: {
        gte?: Date;
        lt?: Date;
    };
    provider?: string;
    departmentId?: number;
    billingCycle?: string;
}

/**
 * Datos del reporte personalizado
 */
export interface CustomReportData {
    totalLicenses?: number;
    activeLicenses?: number;
    expiredLicenses?: number;
    totalCost?: number;
    totalInstallmentCost?: number;
    monthlyCost?: number;
    utilizationRate?: number;
    availableSeats?: number;
    totalLicense?: number;
    usedLicense?: number;
}

/**
 * Datos agrupados por proveedor
 */
export interface GroupedByProvider {
    provider: string;
    _count: {
        id: number;
    };
    _sum: {
        unitCost: number | null;
        totalLicense: number | null;
        usedLicense: number | null;
    };
}

/**
 * Datos agrupados por departamento
 */
export interface GroupedByDepartment {
    departmentId: number | null;
    _count: {
        id: number;
    };
    _sum: {
        unitCost: number | null;
        totalLicense: number | null;
        usedLicense: number | null;
    };
}

/**
 * Datos agrupados por ciclo de facturación
 */
export interface GroupedByBillingCycle {
    billingCycle: string;
    _count: {
        id: number;
    };
    _sum: {
        unitCost: number | null;
        installmentCost: number | null;
    };
}

/**
 * Resultado de consulta de tasa de utilización
 */
export interface UtilizationQueryResult {
    utilization_rate: number;
}

/**
 * Resultado de consulta de tendencia mensual (SQL raw)
 */
export interface MonthlyTrendQueryResult {
    month: Date;
    licenses_created: number;
    total_seats: number;
    used_seats: number;
    total_cost: number;
    totalCost?: number; // Alias para compatibilidad
}

/**
 * Resultado de consulta para promedios de últimos meses
 */
export interface MonthlyAveragesResult {
    avg_licenses_per_month: number;
    avg_cost_per_month: number;
    avg_seats_per_month: number;
}

// Nota: ExportFormat y ExportOptions detalladas están en src/types/export.ts
// Esta interfaz es para uso interno de exportación en el sistema de reportes
export interface ReportExportOptions {
    format: 'csv' | 'json' | 'pdf';
    filename?: string;
    includeCharts?: boolean;
}

// ==================== RESPUESTA DE ANÁLISIS TEMPORAL ====================

/**
 * Respuesta completa del endpoint de análisis temporal
 */
export interface TemporalResponse {
    licenseCreationTrends: LicenseCreationTrend[];
    utilizationTrends: UtilizationTrend[];
    projections: Projection[];
    seasonalAnalysis: SeasonalAnalysis[];
    yearOverYear: YearOverYear[];
    expirationTrends: ExpirationTrend[];
    summary: TemporalSummary;
}
