/**
 * Tipos relacionados con licencias
 */

export interface License {
    id: number;
    sede: string;
    provider: string;
    startDate: Date;
    expiration: Date;
    assigned: string;
    departmentId?: number | null;
    department?: {
        id: number;
        name: string;
        description?: string | null;
    } | null;
    model: string;
    plan: string;
    active: boolean;
    unitCost: number;
    installmentCost: number;
    penaltyCost: number;
    billingCycle: string;
    totalLicense: number;
    usedLicense: number;
}

export interface LicenseCost {
    id: number;
    provider: string;
    unitCost: number;
    installmentCost: number;
    penaltyCost: number;
    billingCycle: string;
}

export interface LicensesByProvider {
    provider: string;
    _sum: {
        unitCost: number;
    };
}

export interface LicenseConfig {
    sede: string,
    provider: string,
    startDate: Date | null,
    model: string,
    billingCycle: string,
    expiration: Date | null,
    assigned: string,
    departmentId?: number | null,
    unitCost: number,
    totalLicense: number,
    plan: string,
    installmentCost: number,
    active: boolean,
}

export interface useLicenseReturn {
    license: License[];
    isLoading: boolean;
    isError: Error | null;

    // Operaciones principales
    handleDeleteLicense: (licenseId: number) => Promise<void>;
    handleEditLicense: (licenseId: number, licenseConfig: LicenseConfig) => Promise<void>;
    handleAddLicense: (licenseConfig: LicenseConfig) => Promise<void>

    // Funciones de utilidad
    refetch: () => Promise<License[] | undefined>;
}