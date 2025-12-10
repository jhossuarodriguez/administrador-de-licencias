/**
 * Tipos relacionados con departamentos
 */

export interface Department {
    id: number;
    name: string;
    description?: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        users: number;
        licenses: number;
    };
}

export interface DepartmentConfig {
    id?: number;
    name: string;
    description?: string | null;
    active?: boolean;
}

export interface useDepartmentsReturn {
    departments: Department[];
    isLoading: boolean;
    isError: Error | null;

    // Operaciones principales
    handleDeleteDepartment: (id: number) => Promise<void>;
    handleEditDepartment: (id: number, config: DepartmentConfig) => Promise<void>;
    handleAddDepartment: (config: DepartmentConfig) => Promise<void>;
    handleToggleActive: (id: number, active: boolean) => Promise<void>;

    // Handlers con manejo de UI
    handleAddSubmit: (
        e: React.FormEvent,
        config: DepartmentConfig,
        setSaving: (saving: boolean) => void,
        closeModal: () => void
    ) => Promise<void>;
    handleEditSubmit: (
        e: React.FormEvent,
        id: number | null,
        config: DepartmentConfig,
        setSaving: (saving: boolean) => void,
        closeModal: () => void
    ) => Promise<void>;
    handleDelete: (id: number, name: string) => Promise<void>;
    handleToggle: (id: number, currentActive: boolean) => Promise<void>;

    // Funciones de utilidad
    refetch: () => Promise<Department[] | undefined>;
}
