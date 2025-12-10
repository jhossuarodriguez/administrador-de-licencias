import useSWR from "swr";
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

// Fetcher tipado específicamente para licencias
const fetchLicensesWithRetry = async (url: string): Promise<License[]> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 3, retryDelay: 1000 });
    return result as License[];
};

export function useLicenses(): useLicenseReturn {
    const { data, error: swrError, isLoading, mutate } = useSWR<License[]>(
        '/api/licenses',
        fetchLicensesWithRetry,
        {
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener licencias');
                }
            }
        }
    );

    // Filtrar licencias con datos incompletos
    const validLicenses = data ? filterNullish(data) : [];

    const handleAddLicense = async (licenseConfig: LicenseConfig): Promise<void> => {
        try {
            const sanitizedConfig = sanitizeFilters(licenseConfig as unknown as Record<string, unknown>)
            await withRetry(async () => {
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

                return result
            }, { maxRetries: 2, retryDelay: 1000 })

            await mutate()

            console.log('Licencia agregada exitosamente')
        } catch (err) {
            console.error('Error al agregar la licencia', handleError(err, 'añadir licencia'))
        }

    }

    // Editar licencia
    const handleEditLicense = async (licenseId: number, licenseConfig: LicenseConfig): Promise<void> => {
        try {
            // Sanitizar datos antes de enviar
            const sanitizedConfig = sanitizeFilters(licenseConfig as unknown as Record<string, unknown>);

            await withRetry(async () => {
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

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de licencias
            await mutate();

            console.log('Licencia actualizada exitosamente');

        } catch (err) {
            console.error('Error al editar licencia:', handleError(err, 'actualizar licencia'));
        }
    };

    // Eliminar licencia
    const handleDeleteLicense = async (licenseId: number): Promise<void> => {
        try {
            await withRetry(async () => {
                const response = await fetch(`/api/licenses?id=${licenseId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al eliminar la licencia');
                }

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de licencias
            await mutate();

            console.log('Licencia eliminada exitosamente');

        } catch (err) {
            console.error('Error al eliminar licencia:', handleError(err, 'eliminar licencia'));
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