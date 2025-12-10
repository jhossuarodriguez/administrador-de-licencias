/**
 * Tipos relacionados con reportes de auditoría
 */

// ==================== HISTORIAL DE ASIGNACIONES ====================

/**
 * Historial de asignación con usuario y licencia completos
 */
export interface AssignmentHistoryRecord {
    id: number;
    userId: number;
    licenseId: number;
    assignedAt: Date;
    user: {
        id: number;
        name: string;
        username: string;
        status: string;
        department: string | null;
    };
    license: {
        id: number;
        provider: string;
        model: string | null;
        active: boolean;
        expiration: Date | null;
    };
}

// ==================== ACTIVIDAD DE USUARIOS ====================

/**
 * Actividad de usuario con contador de asignaciones
 */
export interface UserActivityRecord {
    userId: number;
    _count: {
        id: number;
    };
    user?: {
        id: number;
        name: string;
        username: string;
        department: string | null;
    };
}

// ==================== ANÁLISIS DE CUMPLIMIENTO ====================

/**
 * Análisis de cumplimiento de licencias
 */
export interface ComplianceAnalysis {
    overAllocated: number;
    underUtilized: number;
    expiredActive: number;
    totalActive: number;
    complianceScore: number;
}

// ==================== CAMBIOS EN LICENCIAS ====================

/**
 * Cambio en licencia (para auditoría)
 */
export interface LicenseChange {
    id: number;
    provider: string;
    model: string | null;
    active: boolean;
    totalLicense: number;
    usedLicense: number;
    unitCost: number;
    expiration: Date | null;
    createdAt: Date;
    updatedAt: Date;
    departmentId: number | null;
    department?: {
        id: number;
        name: string;
    };
}

// ==================== ACCESO POR DEPARTAMENTO ====================

/**
 * Registro de acceso por departamento
 */
export interface DepartmentAccessRecord {
    assignedDept: string;
    _count: {
        id: number;
    };
}

// ==================== RESPUESTA COMPLETA DE AUDITORÍA ====================

/**
 * Respuesta completa del endpoint de auditoría
 */
export interface AuditResponse {
    assignmentHistory: AssignmentHistoryRecord[];
    userActivity: UserActivityRecord[];
    licenseChanges: LicenseChange[];
    complianceAnalysis: ComplianceAnalysis;
    departmentAccess: DepartmentAccessRecord[];
}

/**
 * Análisis de cumplimiento del sistema
 */
export interface ComplianceAnalysis {
    overAllocated: number;
    underUtilized: number;
    expiredActive: number;
    totalActive: number;
    complianceScore: number;
}

// ==================== ACCESO POR DEPARTAMENTO ====================

/**
 * Acceso por departamento
 */
export interface DepartmentAccessRecord {
    departmentId: number | null;
    departmentName: string;
    _count: {
        id: number;
    };
}

// ==================== INTERFACE PRINCIPAL ====================

/**
 * Respuesta completa del reporte de auditoría
 */
export interface AuditReports {
    assignmentHistory?: AssignmentHistoryRecord[];
    userActivity?: UserActivityRecord[];
    licenseChanges?: Array<{
        id: number;
        provider: string;
        model: string | null;
        active: boolean;
        updatedAt: Date;
    }>;
    complianceAnalysis?: ComplianceAnalysis;
    departmentAccess?: DepartmentAccessRecord[];
}
