'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { debounce } from '@/lib/hookUtils';
import { Filters } from '@/types';

interface ReportFiltersProps {
    onFiltersChange: (filters: Filters) => void;
    loading?: boolean;
    refreshTrigger?: number;
}

export default function ReportFilters({ onFiltersChange, loading = false, refreshTrigger = 0 }: ReportFiltersProps) {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        provider: '',
        department: '',
        status: ''
    });

    const { options, loading: optionsLoading, error: optionsError } = useFilterOptions({ refreshTrigger });

    // Debounce para optimizar las llamadas al callback de filtros
    const debouncedOnFiltersChange = useMemo(
        () => debounce((filters: unknown) => {
            onFiltersChange(filters as Filters);
        }, 500),
        [onFiltersChange]
    );

    const handleFilterChange = useCallback((key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        // Usar debounced version para evitar muchas llamadas
        debouncedOnFiltersChange(newFilters);
    }, [filters, debouncedOnFiltersChange]);

    const clearFilters = () => {
        const emptyFilters = {
            startDate: '',
            endDate: '',
            provider: '',
            department: '',
            status: ''
        };
        setFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <span className="font-bold ">Filtros de Reporte</span>
                        {optionsError && (
                            <span className="text-xs text-red-500">Error al cargar opciones</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="text-xs"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Limpiar
                            </Button>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha Inicio</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">Fecha Fin</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="provider">Proveedor</Label>
                        <select
                            id="provider"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={filters.provider}
                            onChange={(e) => handleFilterChange('provider', e.target.value)}
                            disabled={loading || optionsLoading}
                        >
                            <option value="">Todos los proveedores</option>
                            {options?.providers?.map((provider) => (
                                <option key={provider} value={provider}>
                                    {provider}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Departamento</Label>
                        <select
                            id="department"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                            disabled={loading || optionsLoading}
                        >
                            <option value="">Todos los departamentos</option>
                            {options?.departments?.map((department) => (
                                <option key={department.id} value={department.id.toString()}>
                                    {department.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <select
                            id="status"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            disabled={loading || optionsLoading}
                        >
                            <option value="">Todos los estados</option>
                            {options?.statusOptions?.map((statusOption) => (
                                <option key={statusOption.value} value={statusOption.value}>
                                    {statusOption.label} ({statusOption.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Filtros activos:</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(filters).map(([key, value]) => {
                                if (!value) return null;

                                let label = key;
                                switch (key) {
                                    case 'startDate':
                                        label = 'Fecha inicio';
                                        break;
                                    case 'endDate':
                                        label = 'Fecha fin';
                                        break;
                                    case 'provider':
                                        label = 'Proveedor';
                                        break;
                                    case 'department':
                                        label = 'Departamento';
                                        break;
                                    case 'status':
                                        label = 'Estado';
                                        break;
                                }

                                return (
                                    <span
                                        key={key}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                                    >
                                        {label}: {value}
                                        <button
                                            onClick={() => handleFilterChange(key, '')}
                                            className="hover:bg-primary/20 rounded p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}