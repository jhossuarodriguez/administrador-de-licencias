import type { Result } from './result';
import type { LicenseFormValues } from '@/lib/validations/license';

/**
 * Tipos relacionados con licencias
 */

export interface License {
    id: number;
    sede: string;
    provider: string;
    startDate: Date | string | null;
    expiration: Date | string | null;
    assigned?: string;
    departmentId?: number | null;
    department?: {
        id: number;
        name: string;
        description?: string | null;
    } | null;
    model: string;
    plan: string | null;
    active: boolean;
    unitCost: number;
    installmentCost: number;
    penaltyCost: number;
    currency: string;
    billingCycle: string;
    totalLicense: number;
    usedLicense: number;
    quantity: number;
}

export interface LicenseCost {
    id: number;
    provider: string;
    unitCost: number;
    installmentCost: number;
    penaltyCost: number;
    currency: string;
    billingCycle: string;
    model: string;
    totalLicense: number;
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
    currency: string,
    unitCost: number,
    totalLicense: number,
    plan?: string | null,
    installmentCost: number,
    active: boolean,
}

export interface useLicenseReturn {
    license: License[];
    isLoading: boolean;
    isError: Error | null;

    // Operaciones principales
    handleDeleteLicense: (licenseId: number) => Promise<Result>;
    handleEditLicense: (licenseId: number, values: LicenseFormValues) => Promise<Result>;
    handleAddLicense: (licenseConfig: LicenseConfig) => Promise<Result>

    // Funciones de utilidad
    refetch: () => Promise<License[] | undefined>;
}
