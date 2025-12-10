/**
 * Tipos relacionados con usuarios
 */

export interface User {
    id: number;
    name: string;
    username: string;
    status: string;
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
    handleDeleteUser: (userId: number) => Promise<void>;
    handleEditUser: (userId: number, userConfig: UserConfig) => Promise<void>;
    handleAddUser: (userConfig: UserConfig) => Promise<void>

    // Funciones de utilidad
    refetch: () => Promise<User[] | undefined>;
}
