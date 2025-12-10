'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Plus, Download, RefreshCw, AlertCircle, Info, Trash2, CheckCircle, FileEdit, BarChart3, ArrowRight } from 'lucide-react';
import { useReportBuilderOptions } from '@/hooks/useReportBuilderOptions';
import { useCustomReportBuilder } from '@/hooks/useCustomReportBuilder';
import { ReportConfig } from '@/types';

interface CustomReportBuilderProps {
    onGenerateReport?: (config: ReportConfig) => void;
    onExportReport?: (config: ReportConfig, format: 'csv') => void;
    loading?: boolean;
    refreshTrigger?: number;
}

export default function CustomReportBuilder({ onGenerateReport, onExportReport, loading = false, refreshTrigger = 0 }: CustomReportBuilderProps) {
    //Abrir Modal Edit + Estado
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [reportToEdit, setReportToEdit] = useState<number | null>(null);
    const [currentEditingReportId, setCurrentEditingReportId] = useState<number | null>(null);

    //Abrir modal Eliminar
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<number | null>(null);


    const {
        options,
        loading: optionsLoading,
        error: optionsError,
        refetch,
        getCompatibleCharts,
        getCompatibleGroupOptions,
        getCompatibleDateRanges
    } = useReportBuilderOptions();

    const {
        reportConfig,
        setReportConfig,
        savedReports,
        savedReportsLoading,
        savedReportsError,
        handleMetricToggle,
        handleSaveReport,
        handleLoadReport,
        handleDeleteReport,
        handleEditReport,
        saving,
        error,
        resetReportConfig,
    } = useCustomReportBuilder(onGenerateReport);

    // Funciones para manejar el modal
    const openDeleteModal = (reportId: number) => {
        setReportToDelete(reportId);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setReportToDelete(null);
    };

    const confirmDelete = () => {
        if (reportToDelete !== null) {
            handleDeleteReport(reportToDelete);
            closeDeleteModal();
        }
    };

    const openEditModal = (reportId: number) => {
        const report = savedReports.find(r => r.id === reportId);
        if (report) {
            setReportToEdit(reportId);
            // Cargar la configuración del reporte en el editor
            handleLoadReport(report);
            setCurrentEditingReportId(reportId);
            setEditModalOpen(true);
        }
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setReportToEdit(null);
        // No limpiar currentEditingReportId para mantener el estado de edición
    };

    const confirmEdit = async () => {
        if (reportToEdit !== null) {
            await handleEditReport(reportToEdit);
            closeEditModal();
        }
    };

    // Refrescar cuando cambie refreshTrigger
    useEffect(() => {
        if (refreshTrigger > 0) {
            refetch();
        }
    }, [refreshTrigger, refetch]);

    // Calcular opciones compatibles directamente (sin useMemo para evitar problemas de dependencias)
    const compatibleCharts = options && reportConfig.metrics.length > 0
        ? getCompatibleCharts(reportConfig.metrics)
        : options?.chartTypes || [];

    const compatibleGroups = options && reportConfig.metrics.length > 0
        ? getCompatibleGroupOptions(reportConfig.metrics)
        : options?.groupByOptions || [];

    const compatibleDates = options && reportConfig.metrics.length > 0
        ? getCompatibleDateRanges(reportConfig.metrics)
        : options?.dateRangeOptions || [];

    // Mostrar error principal si hay problemas críticos
    if (optionsError && !options) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Error al cargar el constructor de reportes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800 mb-2">
                                    <strong>Error:</strong> No se pudieron cargar las opciones del constructor de reportes.
                                </p>
                                <p className="text-xs text-red-600 mb-3">
                                    {optionsError || 'Error desconocido al conectar con el servidor'}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={refetch}
                                        disabled={optionsLoading}
                                        className="text-red-700 border-red-300 hover:bg-red-50"
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${optionsLoading ? 'animate-spin' : ''}`} />
                                        {optionsLoading ? 'Cargando...' : 'Reintentar'}
                                    </Button>
                                </div>
                            </div>
                            <div className="text-xs text-thirdary">
                                <p><strong>Posibles soluciones:</strong></p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>Verifica tu conexión a internet</li>
                                    <li>Asegúrate de que el servidor esté funcionando</li>
                                    <li>Recarga la página si el problema persiste</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mensaje de error global si hay problemas menores */}
            {(error || savedReportsError) && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-orange-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {error || 'Algunos servicios presentan problemas'}
                            </span>
                        </div>
                        {savedReportsError && (
                            <p className="text-xs text-orange-600 mt-1">
                                • No se pudieron cargar los reportes guardados
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}


            {/* Reportes Guardados */}
            <Card className='w-full '>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="text-lg ">Reportes Guardados</span>
                        <Badge variant="secondary">
                            {savedReports.length}
                        </Badge>
                    </CardTitle>
                    {savedReportsError && (
                        <div className="text-xs text-orange-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Error al cargar reportes guardados
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-auto">
                        {savedReportsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-32 bg-muted animate-pulse rounded-lg"></div>
                                ))}
                            </div>
                        ) : savedReportsError ? (
                            <div className="text-center py-8">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                                <p className="text-sm text-orange-600 mb-1">Error al cargar reportes guardados</p>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Los reportes guardados no están disponibles temporalmente
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                    className="text-orange-600 border-secondary hover:bg-orange-50"
                                >
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Recargar página
                                </Button>
                            </div>
                        ) : savedReports.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {savedReports.slice(0, 4).map((report) => (
                                        <div key={report.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-sm text-thirdary">{report.name}</h4>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => openDeleteModal(report.id)}
                                                        className="text-xs h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-thirdary line-clamp-2">
                                                    {report.description}
                                                </p>
                                                <p className="text-xs text-thirdary">
                                                    Último uso: {new Date(report.lastUsed).toLocaleDateString()}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditModal(report.id)}
                                                        className="text-xs h-auto px-3 py-2 cursor-pointer flex-1"
                                                        title="Editar reporte"
                                                    >
                                                        <FileEdit className="h-3 w-3 mr-1" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => {
                                                            if (onExportReport) {
                                                                onExportReport(report.config, 'csv');
                                                            }
                                                        }}
                                                        className="text-xs h-auto px-3 py-2 cursor-pointer flex-1"
                                                        title="Descargar reporte en CSV"
                                                        disabled={!onExportReport}
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Descargar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {savedReports.length > 4 && (
                                    <div className="mt-4 pt-3 border-t">
                                        <Link href="/dashboard/reports/saved">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full cursor-pointer"
                                            >
                                                Ver todos los reportes guardados ({savedReports.length})
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-thirdary">
                                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay reportes guardados</p>
                                <p className="text-xs">Crea y guarda tu primer reporte personalizado</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Grid de 2 columnas: Constructor + Vista Previa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Constructor de Reportes */}
                <Card className='block h-auto overflow-hidden'>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 hidden md:block" />
                                <span className='text-lg'>Constructor de Reportes Personalizados</span>
                                {optionsError && options && (
                                    <span className="text-xs text-secondary/35 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Datos parciales
                                    </span>
                                )}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 mt-5">
                        {/* Información básica */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reportName">Nombre del Reporte</Label>
                                <Input
                                    id="reportName"
                                    placeholder="Ej: Reporte Mensual de IT"
                                    value={reportConfig.name}
                                    onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reportDescription">Descripción</Label>
                                <Input
                                    id="reportDescription"
                                    placeholder="Breve descripción del reporte"
                                    value={reportConfig.description}
                                    onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Selección de métricas */}
                        <div className="space-y-3">
                            <Label>Métricas a Incluir</Label>
                            {optionsLoading ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : options?.metrics && options.metrics.length > 0 ? (
                                <ScrollArea className="h-[280px] pr-3">
                                    <div className="grid grid-cols-1 gap-3">
                                        {options.metrics.map((metric) => (
                                            <div
                                                key={metric.id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${reportConfig.metrics.includes(metric.id)
                                                    ? 'border-secondary bg-primary/10'
                                                    : 'border-muted hover:border-secondary/50'
                                                    }`}
                                                onClick={() => handleMetricToggle(metric.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm text-thirdary">{metric.label}</p>
                                                        <p className="text-xs text-thirdary">{metric.category}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-semibold text-blue-600">
                                                                {Math.round(metric.currentValue).toLocaleString('es-ES', { maximumFractionDigits: 0 })} {metric.unit}
                                                            </span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                    {reportConfig.metrics.includes(metric.id) && (
                                                        <Badge variant="default" className="text-xs">
                                                            ✓
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <p className="text-sm text-thirdary">No hay métricas disponibles</p>
                            )}
                        </div>

                        {/* Configuración del reporte */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Gráfico</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={reportConfig.chartType}
                                    onChange={(e) => setReportConfig(prev => ({ ...prev, chartType: e.target.value }))}
                                    disabled={optionsLoading || reportConfig.metrics.length === 0}
                                >
                                    {optionsLoading ? (
                                        <option>Cargando...</option>
                                    ) : (
                                        compatibleCharts.map((chart) => (
                                            <option key={chart.id} value={chart.id}>
                                                {chart.label}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {reportConfig.metrics.length > 0 && (
                                    <p className="text-xs text-thirdary">
                                        {compatibleCharts.length} opciones compatibles
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Agrupar por</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={reportConfig.groupBy}
                                    onChange={(e) => setReportConfig(prev => ({ ...prev, groupBy: e.target.value }))}
                                    disabled={optionsLoading || reportConfig.metrics.length === 0}
                                >
                                    <option value="">Sin agrupar</option>
                                    {optionsLoading ? (
                                        <option>Cargando...</option>
                                    ) : (
                                        compatibleGroups.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.label}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {reportConfig.metrics.length > 0 && (
                                    <p className="text-xs text-thirdary">
                                        {compatibleGroups.length} opciones compatibles
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Rango de Fechas</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={reportConfig.dateRange}
                                    onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                                    disabled={optionsLoading || reportConfig.metrics.length === 0}
                                >
                                    {optionsLoading ? (
                                        <option>Cargando...</option>
                                    ) : (
                                        compatibleDates.map((range) => (
                                            <option key={range.id} value={range.id}>
                                                {range.label}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {reportConfig.metrics.length > 0 && (
                                    <p className="text-xs text-thirdary">
                                        {compatibleDates.length} opciones compatibles
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 flex-col md:flex-row">
                            <Button
                                onClick={() => {
                                    if (onExportReport) {
                                        onExportReport(reportConfig, 'csv');
                                    }
                                }}
                                disabled={loading || reportConfig.metrics.length === 0}
                                className="flex-1 cursor-pointer"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar Reporte
                            </Button>
                            {currentEditingReportId ? (
                                <Button
                                    variant="default"
                                    onClick={async () => {
                                        await handleEditReport(currentEditingReportId);
                                        setCurrentEditingReportId(null);
                                    }}
                                    disabled={reportConfig.metrics.length === 0 || saving}
                                    className='cursor-pointer'
                                >
                                    {saving ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    {saving ? 'Actualizando...' : 'Actualizar'}
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={handleSaveReport}
                                    disabled={reportConfig.metrics.length === 0 || saving}
                                    className='cursor-pointer'
                                >
                                    {saving ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </Button>
                            )}
                            <Button
                                className='cursor-pointer'
                                variant="ghost"
                                onClick={() => {
                                    resetReportConfig();
                                    setCurrentEditingReportId(null);
                                }}
                                disabled={saving}
                            >
                                Limpiar
                            </Button>
                        </div>

                        {/* Mensajes de error y éxito */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-red-800">{error}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Vista Previa del Reporte */}
                <Card className='block h-[400px] overflow-hidden'>
                    <CardHeader>
                        <CardTitle className="text-lg">Vista Previa del Reporte</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reportConfig.metrics.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Métricas Seleccionadas:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {reportConfig.metrics.map((metricId) => {
                                            const metric = options?.metrics?.find(m => m.id === metricId);
                                            return metric ? (
                                                <Badge key={metricId} variant="secondary">
                                                    {metric.label}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-thirdary">Tipo de Gráfico:</span>
                                        <p className="text-thirdary">
                                            {options?.chartTypes?.find(t => t.id === reportConfig.chartType)?.label || 'No seleccionado'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-thirdary">Agrupar por:</span>
                                        <p className="text-thirdary">
                                            {options?.groupByOptions?.find(g => g.id === reportConfig.groupBy)?.label || 'Sin agrupar'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-thirdary">Rango de Fechas:</span>
                                        <p className="text-thirdary">
                                            {options?.dateRangeOptions?.find(d => d.id === reportConfig.dateRange)?.label || 'No seleccionado'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-thirdary">Total métricas:</span>
                                        <p className="text-thirdary">
                                            {reportConfig.metrics.length} seleccionadas
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <div className="flex-1 text-sm">
                                            <span className="font-medium text-green-800">Configuración válida</span>
                                            <p className="text-xs text-green-600 mt-0.5">
                                                Opciones a exportar: {compatibleCharts.length} gráficos, {compatibleGroups.length} agrupaciones
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-thirdary">
                                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Selecciona métricas para previsualizar</p>
                                <p className="text-xs mt-1">La vista previa aparecerá aquí</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de confirmación de eliminación */}
            {deleteModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
                    onClick={closeDeleteModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">Eliminar Reporte</h3>
                                    <p className="text-sm text-thirdary">Esta acción no se puede deshacer</p>
                                </div>
                            </div>

                            <p className="text-sm text-thirdary">
                                ¿Estás seguro que deseas eliminar este reporte guardado?
                            </p>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={closeDeleteModal}
                                    className="cursor-pointer"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={confirmDelete}
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de edición */}
            {editModalOpen && reportToEdit && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
                    onClick={closeEditModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <FileEdit className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdary">Editar Reporte</h3>
                                    <p className="text-sm text-thirdary">Modifica toda la configuración del reporte</p>
                                </div>
                            </div>

                            {/* Campos de edición */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editReportName">Nombre del Reporte</Label>
                                        <Input
                                            id="editReportName"
                                            placeholder="Ej: Reporte Mensual de IT"
                                            value={reportConfig.name}
                                            onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="editReportDescription">Descripción</Label>
                                        <Input
                                            id="editReportDescription"
                                            placeholder="Breve descripción del reporte"
                                            value={reportConfig.description}
                                            onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Selección de métricas */}
                                <div className="space-y-3">
                                    <Label>Métricas a Incluir</Label>
                                    {optionsLoading ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {Array.from({ length: 4 }).map((_, index) => (
                                                <div key={index} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                                            ))}
                                        </div>
                                    ) : options?.metrics && options.metrics.length > 0 ? (
                                        <ScrollArea className="h-[200px] pr-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {options.metrics.map((metric) => (
                                                    <div
                                                        key={metric.id}
                                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${reportConfig.metrics.includes(metric.id)
                                                            ? 'border-secondary bg-secondary/10'
                                                            : 'border-muted hover:border-secondary/50'
                                                            }`}
                                                        onClick={() => handleMetricToggle(metric.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm text-thirdary">{metric.label}</p>
                                                                <p className="text-xs text-thirdary">{metric.category}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs font-semibold text-blue-600">
                                                                        {Math.round(metric.currentValue).toLocaleString('es-ES', { maximumFractionDigits: 0 })} {metric.unit}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {reportConfig.metrics.includes(metric.id) && (
                                                                <Badge variant="default" className="text-xs">
                                                                    ✓
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <p className="text-sm text-thirdary">No hay métricas disponibles</p>
                                    )}
                                </div>

                                {/* Configuración adicional */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de Gráfico</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={reportConfig.chartType}
                                            onChange={(e) => setReportConfig(prev => ({ ...prev, chartType: e.target.value }))}
                                            disabled={optionsLoading || reportConfig.metrics.length === 0}
                                        >
                                            {optionsLoading ? (
                                                <option>Cargando...</option>
                                            ) : (
                                                compatibleCharts.map((chart) => (
                                                    <option key={chart.id} value={chart.id}>
                                                        {chart.label}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Agrupar por</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={reportConfig.groupBy}
                                            onChange={(e) => setReportConfig(prev => ({ ...prev, groupBy: e.target.value }))}
                                            disabled={optionsLoading || reportConfig.metrics.length === 0}
                                        >
                                            <option value="">Sin agrupar</option>
                                            {optionsLoading ? (
                                                <option>Cargando...</option>
                                            ) : (
                                                compatibleGroups.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.label}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Rango de Fechas</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                            value={reportConfig.dateRange}
                                            onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                                            disabled={optionsLoading || reportConfig.metrics.length === 0}
                                        >
                                            {optionsLoading ? (
                                                <option>Cargando...</option>
                                            ) : (
                                                compatibleDates.map((range) => (
                                                    <option key={range.id} value={range.id}>
                                                        {range.label}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium text-blue-800 mb-1">
                                            {reportConfig.metrics.length} métrica{reportConfig.metrics.length !== 1 ? 's' : ''} seleccionada{reportConfig.metrics.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Haz clic en las métricas para agregarlas o quitarlas del reporte.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        closeEditModal();
                                        resetReportConfig();
                                        setCurrentEditingReportId(null);
                                    }}
                                    className="cursor-pointer"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={async () => {
                                        if (reportToEdit) {
                                            await handleEditReport(reportToEdit);
                                            closeEditModal();
                                            resetReportConfig();
                                            setCurrentEditingReportId(null);
                                        }
                                    }}
                                    className="cursor-pointer"
                                    disabled={saving || !reportConfig.name.trim() || reportConfig.metrics.length === 0}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}