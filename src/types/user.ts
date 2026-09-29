import type { Result } from './result';
import type { UserFormValues } from '@/lib/validations/users';

/**
 * Tipos relacionados con usuarios
 */

export interface User {
    id: number;
    name: string;
    username: string;
    status: string;
    role: string;
    plan: string;
    departmentId?: number | null;
    department?: {
        id: number;
        name: string;
        description?: string | null;
    } | null;
    Assignment?: {
        id: number;
        license: {
            id: number;
            provider: string;
            model?: string;
        };
    }[];
}
export interface UserConfig {
    id?: number;
    name: string;
    username: string;
    departmentId?: number | null;
    status: string;
    role: string;
    plan: string;
}

export interface UseUsersReturn {
    // Datos de usuarios (lo que usa el componente)
    users: User[];
    isLoading: boolean;
    isError: Error | null;

    // Operaciones principales
    handleDeleteUser: (userId: number) => Promise<Result>;
    handleEditUser: (userId: number, values: UserFormValues) => Promise<Result>;
    handleAddUser: (userConfig: UserConfig) => Promise<void>

    // Funciones de utilidad
    refetch: () => Promise<User[] | undefined>;
}
