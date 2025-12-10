/**
 * Hook personalizado para manejar operaciones CRUD de departamentos
 */

import { Department, DepartmentConfig, useDepartmentsReturn } from "@/types/department";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useDepartments(activeOnly: boolean = false): useDepartmentsReturn {
    const url = activeOnly ? '/api/departments?active=true' : '/api/departments';

    const { data, error, isLoading, mutate } = useSWR<Department[]>(
        url,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    /**
     * Agregar un nuevo departamento
     */
    const handleAddDepartment = async (config: DepartmentConfig): Promise<void> => {
        try {
            const response = await fetch('/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear departamento');
            }

            await mutate();
        } catch (error) {
            console.error('Error al agregar departamento:', error);
            throw error;
        }
    };

    /**
     * Editar un departamento existente
     */
    const handleEditDepartment = async (
        id: number,
        config: DepartmentConfig
    ): Promise<void> => {
        try {
            const response = await fetch('/api/departments', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, ...config }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar departamento');
            }

            await mutate();
        } catch (error) {
            console.error('Error al editar departamento:', error);
            throw error;
        }
    };

    /**
     * Eliminar un departamento
     */
    const handleDeleteDepartment = async (id: number): Promise<void> => {
        try {
            const response = await fetch(`/api/departments?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar departamento');
            }

            await mutate();
        } catch (error) {
            console.error('Error al eliminar departamento:', error);
            throw error;
        }
    };

    /**
     * Activar/desactivar un departamento
     */
    const handleToggleActive = async (id: number, active: boolean): Promise<void> => {
        try {
            const response = await fetch('/api/departments', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, active }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cambiar estado del departamento');
            }

            await mutate();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            throw error;
        }
    };

    /**
     * Handler para submit de agregar con manejo de UI
     */
    const handleAddSubmit = async (
        e: React.FormEvent,
        config: DepartmentConfig,
        setSaving: (saving: boolean) => void,
        closeModal: () => void
    ) => {
        e.preventDefault();
        setSaving(true);

        try {
            await handleAddDepartment(config);
            closeModal();
        } catch (error: any) {
            alert(error.message || 'Error al crear departamento');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Handler para submit de editar con manejo de UI
     */
    const handleEditSubmit = async (
        e: React.FormEvent,
        id: number | null,
        config: DepartmentConfig,
        setSaving: (saving: boolean) => void,
        closeModal: () => void
    ) => {
        e.preventDefault();
        if (!id) return;

        setSaving(true);

        try {
            await handleEditDepartment(id, config);
            closeModal();
        } catch (error: any) {
            alert(error.message || 'Error al actualizar departamento');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Handler para eliminar con confirmación
     */
    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el departamento "${name}"?`)) return;

        try {
            await handleDeleteDepartment(id);
        } catch (error: any) {
            alert(error.message || 'Error al eliminar departamento');
        }
    };

    /**
     * Handler para toggle con manejo de errores
     */
    const handleToggle = async (id: number, currentActive: boolean) => {
        try {
            await handleToggleActive(id, !currentActive);
        } catch (error: any) {
            alert(error.message || 'Error al cambiar estado');
        }
    };

    /**
     * Refrescar datos
     */
    const refetch = async () => {
        return await mutate();
    };

    return {
        departments: data || [],
        isLoading,
        isError: error,
        handleAddDepartment,
        handleEditDepartment,
        handleDeleteDepartment,
        handleToggleActive,
        handleAddSubmit,
        handleEditSubmit,
        handleDelete,
        handleToggle,
        refetch,
    };
}
