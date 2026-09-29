import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { User } from "@/types";
import type { Result } from "@/types/result";
import {
    handleError,
    filterNullish,
    isNetworkError,
    withRetry,
    sanitizeFilters
} from "@/lib/hookUtils";
import type { UserConfig, UseUsersReturn } from "@/types/user";
import type { UserFormValues } from "@/lib/validations/users";

// Fetcher tipado específicamente para usuarios
const fetchUsersWithRetry = async (url: string): Promise<User[]> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 3, retryDelay: 1000 });
    return result as User[];
};

export function useUsers(options?: { fallbackData?: User[] }): UseUsersReturn {
    // Obtener usuarios con SWR (manteniendo la funcionalidad básica)
    const { data, error: swrError, isLoading, mutate } = useSWR<User[]>(
        "/api/users",
        fetchUsersWithRetry,
        {
            fallbackData: options?.fallbackData,
            onError: (err) => {
                if (isNetworkError(err)) {
                    console.error('Error de red al obtener usuarios');
                }
            }
        }
    );

    // Filtrar usuarios con datos incompletos
    const validUsers = data ? filterNullish(data) : [];

    //Añadir usuario (funcionalidad principal que necesita el componente)
    const handleAddUser = async (userConfig: UserConfig): Promise<void> => {
        try {
            const sanitizedConfig = sanitizeFilters(userConfig as unknown as Record<string, unknown>);
            await withRetry(async () => {
                const response = await fetch(`/api/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sanitizedConfig),
                });

                const result = await response.json()

                if (!response.ok) {
                    throw new Error(`${result.error || result.message || 'Error al agregar el usuario'}, ${response.status}, ${response.statusText}`)
                }

                return result
            }, { maxRetries: 2, retryDelay: 1000 })

            await mutate()

        } catch (err) {
            console.error('Error al agregar el usuario', handleError(err, 'añadir usuario'), err)
            throw err;
        }
    }

    // Editar usuario (funcionalidad principal que necesita el componente)
    const handleEditUser = async (userId: number, values: UserFormValues): Promise<Result> => {
        try {
            // Sanitizar datos antes de enviar
            const sanitizedConfig = sanitizeFilters(values as unknown as Record<string, unknown>);

            await withRetry(async () => {
                const response = await fetch(`/api/users?id=${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sanitizedConfig),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(`${result.error || result.message || 'Error al actualizar el usuario'}, ${response.status}, ${response.statusText}`);
                }

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de usuarios
            await mutate();

            return { ok: true, data: undefined };

        } catch (err) {
            return { ok: false, error: handleError(err, 'actualizar usuario') };
        }
    };

    // Eliminar usuario (funcionalidad principal que necesita el componente)
    const handleDeleteUser = async (userId: number): Promise<Result> => {
        try {
            await withRetry(async () => {
                const response = await fetch(`/api/users?id=${userId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Error al eliminar el usuario');
                }

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de usuarios
            await mutate();

            return { ok: true, data: undefined };

        } catch (err) {
            return { ok: false, error: handleError(err, 'eliminar usuario') };
        }
    };

    return {
        // Datos de usuarios (lo que necesita el componente)
        users: validUsers,
        isLoading,
        isError: swrError,

        // Operaciones principales
        handleDeleteUser,
        handleEditUser,
        handleAddUser,

        // Funciones de utilidad
        refetch: mutate
    };
}