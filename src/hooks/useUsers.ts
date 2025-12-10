import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { User } from "@/types";
import {
    handleError,
    filterNullish,
    isNetworkError,
    withRetry,
    sanitizeFilters
} from "@/lib/hookUtils";
import { UserConfig, UseUsersReturn } from "@/types/user";

// Fetcher tipado específicamente para usuarios
const fetchUsersWithRetry = async (url: string): Promise<User[]> => {
    const result = await withRetry(() => fetcher(url), { maxRetries: 3, retryDelay: 1000 });
    return result as User[];
};

export function useUsers(): UseUsersReturn {
    // Obtener usuarios con SWR (manteniendo la funcionalidad básica)
    const { data, error: swrError, isLoading, mutate } = useSWR<User[]>(
        "/api/users",
        fetchUsersWithRetry,
        {
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
                    throw new Error(result.error || result.message || 'Erorr al agregar el usuario')
                }

                return result
            }, { maxRetries: 2, retryDelay: 1000 })

            await mutate()

            console.log('Usuario agregado exitosamente')


        } catch (err) {
            console.error('Error al agregar el usuario', handleError(err, 'añadir usuario'))
        }
    }

    // Editar usuario (funcionalidad principal que necesita el componente)
    const handleEditUser = async (userId: number, userConfig: UserConfig): Promise<void> => {
        try {
            // Sanitizar datos antes de enviar
            const sanitizedConfig = sanitizeFilters(userConfig as unknown as Record<string, unknown>);

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
                    throw new Error(result.error || result.message || 'Error al actualizar el usuario');
                }

                return result;
            }, { maxRetries: 2, retryDelay: 1000 });

            // Actualizar la lista de usuarios
            await mutate();

            console.log('Usuario actualizado exitosamente');

        } catch (err) {
            console.error('Error al editar usuario:', handleError(err, 'actualizar usuario'));
        }
    };

    // Eliminar usuario (funcionalidad principal que necesita el componente)
    const handleDeleteUser = async (userId: number): Promise<void> => {
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

            console.log('Usuario eliminado exitosamente');

        } catch (err) {
            console.error('Error al eliminar usuario:', handleError(err, 'eliminar usuario'));
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