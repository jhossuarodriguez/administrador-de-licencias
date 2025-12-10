/**
 * Tipos relacionados con el dashboard
 */

export interface DashboardStats {
    licenses: {
        totalLicenses: number;
        totalUsers: number;
        activeUsers: number;
        expiringSoon: number;
        expired: number;
    };
    trends: {
        totalUsersChange: number;
        totalLicensesChange: number;
        utilizationRate: number;
        monthlyCost: number;
    };
    chartData: Array<{
        month: string;
        usage: number;
    }>;
    mostUsed: Array<{
        name: string;
        usage: number;
        percentage: number;
    }>;
    expiringSoonNames: Array<{
        name: string;
        daysLeft: number;
    }>;
}

/**
 * Datos de API sin procesar para el dashboard
 */
export interface DashboardApiResponse {
    licenses?: {
        totalLicenses: number;
        totalUsers: number;
        activeUsers: number;
        expiringSoon: number;
        expired: number;
    };
    trends?: {
        totalUsersChange: number;
        totalLicensesChange: number;
        activeUsersChange: number;
        expiringChange: number;
    };
    chartData?: Array<{
        month: string;
        users: number;
    }>;
    mostUsed?: Array<{
        name: string;
        usage: number;
        percentage: number;
    }>;
    expiringSoonNames?: Array<{
        name: string;
        daysLeft: number;
    }>;
}
