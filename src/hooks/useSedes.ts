import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Result } from '@/types/result';
import type { Sede, SedeConfig } from '@/types/sede';

interface UseSedesOptions {
    fallbackData?: Sede[];
}

const getApiError = async (response: Response, fallback: string) => {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    return body?.error ?? fallback;
};

export function useSedes(activeOnly = false, options?: UseSedesOptions) {
    const url = activeOnly ? '/api/sedes?active=true' : '/api/sedes';
    const { data, error, isLoading, mutate } = useSWR<Sede[]>(url, fetcher, {
        fallbackData: options?.fallbackData,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
    });

    const createSede = async (config: SedeConfig): Promise<Result<Sede>> => {
        try {
            const response = await fetch('/api/sedes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                return { ok: false, error: await getApiError(response, 'Error al crear sede') };
            }

            const sede = await response.json() as Sede;
            await mutate();
            return { ok: true, data: sede };
        } catch {
            return { ok: false, error: 'No se pudo conectar con el servidor' };
        }
    };

    const updateSede = async (id: number, config: Partial<SedeConfig>): Promise<Result<Sede>> => {
        try {
            const response = await fetch('/api/sedes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...config }),
            });

            if (!response.ok) {
                return { ok: false, error: await getApiError(response, 'Error al actualizar sede') };
            }

            const sede = await response.json() as Sede;
            await mutate();
            return { ok: true, data: sede };
        } catch {
            return { ok: false, error: 'No se pudo conectar con el servidor' };
        }
    };

    const deleteSede = async (id: number): Promise<Result> => {
        try {
            const response = await fetch(`/api/sedes?id=${id}`, { method: 'DELETE' });
            if (!response.ok) {
                return { ok: false, error: await getApiError(response, 'Error al eliminar sede') };
            }

            await mutate();
            return { ok: true, data: undefined };
        } catch {
            return { ok: false, error: 'No se pudo conectar con el servidor' };
        }
    };

    return {
        sedes: data ?? [],
        isLoading,
        isError: error,
        createSede,
        updateSede,
        deleteSede,
        refetch: mutate,
    };
}
