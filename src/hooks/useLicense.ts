import useSWR, { mutate as globalMutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { License } from "@/types";
import {
    handleError,
    filterNullish,
    isNetworkError,
    withRetry,
    sanitizeFilters
} from "@/lib/hookUtils";
import { useLicenseReturn, LicenseConfig } from "@/types/license";
import type { Result } from "@/types/result";
import type { LicenseFormValues } from "@/lib/validations/license";

// Fetcher tipado específicamente para licencias
const fetchLicensesWithRetry = async (url: string): Promise<License[]> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 3, retryDelay: 1000 });
    return result as License[];
};

const LICENSES_API_KEY = '/api/licenses';
const LICENSE_COSTS_API_KEY = '/api/licenses/costs';

export function useLicenses(options?: { fallbackData?: License[] }): useLicenseReturn {
    const { data, error: swrError, isLoading, mutate } = useSWR<License[]>(
        LICENSES_API_KEY,
        fetchLicensesWithRetry,
        {
            fallbackData: options?.fallbackData,
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener licencias');
                }
            }
        }
    );

    // Filtrar licencias con datos incompletos
    const validLicenses = data ? filterNullish(data) : [];

    const revalidateLicenseData = async () => {
        await Promise.all([
            mutate(),
            globalMutate(LICENSE_COSTS_API_KEY),
        ]);
    };

    const handleAddLicense = async (licenseConfig: LicenseConfig): Promise<Result> => {
        try {
            const sanitizedConfig = sanitizeFilters(licenseConfig as unknown as Record<string, unknown>)
            {
                const response = await fetch(`/api/licenses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sanitizedConfig)

                })

                const result = await response.json()


                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al agregar la licencia')
                }

                await revalidateLicenseData()

                return { ok: true, data: result }
            }
        } catch (err) {
            return { ok: false, error: handleError(err, 'añadir licencia') }
        }
    }

    // Editar licencia
    const handleEditLicense = async (licenseId: number, licenseConfig: LicenseFormValues): Promise<Result> => {
        try {
            // Sanitizar datos antes de enviar
            const sanitizedConfig = sanitizeFilters(licenseConfig as unknown as Record<string, unknown>);

            {
                const response = await fetch(`/api/licenses?id=${licenseId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sanitizedConfig),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al actualizar la licencia');
                }

                await revalidateLicenseData();

                return { ok: true, data: result };
            }
        } catch (err) {
            return { ok: false, error: handleError(err, 'actualizar licencia') };
        }
    };

    // Eliminar licencia
    const handleDeleteLicense = async (licenseId: number): Promise<Result> => {
        try {
            {
                const response = await fetch(`/api/licenses?id=${licenseId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al eliminar la licencia');
                }

                await revalidateLicenseData();

                return { ok: true, data: result };
            }

        } catch (err) {
            return { ok: false, error: handleError(err, 'eliminar licencia') };
        }
    };

    return {
        // Datos de licencias (lo que necesita el componente)
        license: validLicenses,
        isLoading,
        isError: swrError,

        // Operaciones principales
        handleAddLicense,
        handleDeleteLicense,
        handleEditLicense,

        // Funciones de utilidad
        refetch: mutate
    };
}
