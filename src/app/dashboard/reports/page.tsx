'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReports, useReportNotifications } from '@/hooks/useReports';
import { useSummary } from '@/hooks/useSummary';
import { useTemporal } from '@/hooks/useTemporal';
import { useAudit } from '@/hooks/useAudit';
import { formatCurrency } from '@/lib/utils';
import { ReportConfig } from '@/types';

// Importar todos los componentes de reportes
import ReportFilters from '@/components/reports/ReportFilters';
import ExportButtons from '@/components/reports/ExportButtons';
import AdvancedCharts from '@/components/reports/GeneralReportsTab';
import TemporalAnalysis from '@/components/reports/TemporalAnalysisTab';
import AuditReports from '@/components/reports/AuditReportsTab';
import CostAnalysis from '@/components/reports/CostAnalysisTab';
import CustomReportBuilder from '@/components/reports/CustomReportBuilder';

import {
    BarChart3,
    TrendingUp,
    Shield,
    DollarSign,
    Settings,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';

export default function ReportsPage() {
    const [filters, setFilters] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        summaryData,
        isLoading,
        hasError,
        exportReport,
        refreshAll
    } = useReports({ filters, autoRefresh: false });

    // Hooks individuales para los gráficos
    const { mutate: mutateSummaryChart } = useSummary();
    const { mutate: mutateTemporalChart } = useTemporal();
    const { mutate: mutateAuditChart } = useAudit();


    const handleCustomReport = async (config: ReportConfig) => {
        try {
            console.log('Generando reporte personalizado:', config);
            // Aquí podrías llamar a generateCustomReport con los filtros apropiados
            alert('Reporte personalizado generado exitosamente');
        } catch (error) {
            console.error('Error al generar reporte personalizado:', error);
            alert('Error al generar reporte personalizado');
        }
    };

    const handleCustomExport = async (config: ReportConfig, format: 'csv') => {
        try {
            console.log('Exportando reporte personalizado:', config, format);
            alert('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error al exportar reporte:', error);
            alert('Error al exportar reporte');
        }
    };

    const handleFiltersChange = (newFilters: Record<string, unknown>) => {
        setFilters(newFilters);
    };

    const handleRefreshAll = async () => {
        setIsRefreshing(true);
        try {
            // Refrescar los datos principales de reportes
            refreshAll();
            // Refrescar los gráficos individuales
            await Promise.all([
                mutateSummaryChart(),
                mutateTemporalChart(),
                mutateAuditChart()
            ]);
            // Forzar re-renderizado de componentes para que refresquen sus hooks
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error al refrescar:', error);
        } finally {
            // Agregar un pequeño delay para que se vea la animación
            setTimeout(() => {
                setIsRefreshing(false);
            }, 500);
        }
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'overview': return <BarChart3 className="h-4 w-4" />;
            case 'temporal': return <TrendingUp className="h-4 w-4" />;
            case 'audit': return <Shield className="h-4 w-4" />;
            case 'costs': return <DollarSign className="h-4 w-4" />;
            case 'custom': return <Settings className="h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <section>
            <div className='flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6'>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10 md:mt-0 mx-4 md:mx-7 animate-fade-in animate-delay-100">
                    <div>
                        <header className="text-2xl font-bold">Reportes Avanzados</header>
                        <p className="mt-1 text-gray-600">
                            Análisis completo de licencias, costos, auditoría y proyecciones
                        </p>
                    </div>

                    <div className="flex items-center gap-3 animate-fade-in animate-delay-200">
                        {/* Exportar */}
                        <ExportButtons onExport={exportReport} loading={isLoading} />

                        {/* Refrescar */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshAll}
                            disabled={isLoading || isRefreshing}
                            className="gap-2 cursor-pointer"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    </div>
                </div>


                {/* Filtros */}
                <div className="animate-fade-in animate-delay-300">
                    <ReportFilters
                        onFiltersChange={handleFiltersChange}
                        loading={isLoading}
                        refreshTrigger={refreshTrigger}
                    />
                </div>

                {/* Error handling */}
                {hasError && (
                    <Card className="border-red-200 bg-red-50 animate-fade-in animate-delay-400">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <span className="text-red-700 font-medium">
                                    Error al cargar los datos de reportes
                                </span>
                            </div>
                            <p className="text-sm text-red-600 mt-1">
                                Por favor, verifica tu conexión e intenta refrescar la página.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Contenido principal con tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-fade-in animate-delay-500">
                    <TabsList className="grid w-full grid-cols-4 md:grid-cols-5">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            {getTabIcon('overview')}
                            <span className="hidden sm:inline">General</span>
                        </TabsTrigger>
                        <TabsTrigger value="temporal" className="hidden md:flex items-center gap-2">
                            {getTabIcon('temporal')}
                            <span className="hidden sm:inline">Temporal</span>
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="flex items-center gap-2">
                            {getTabIcon('audit')}
                            <span className="hidden sm:inline">Auditoría</span>
                        </TabsTrigger>
                        <TabsTrigger value="costs" className="flex items-center gap-2">
                            {getTabIcon('costs')}
                            <span className="hidden sm:inline">Costos</span>
                        </TabsTrigger>
                        <TabsTrigger value="custom" className="flex items-center gap-2">
                            {getTabIcon('custom')}
                            <span className="hidden sm:inline">Personalizado</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Resumen General */}
                    <TabsContent value="overview">
                        <div className="space-y-6">
                            <div className="w-full max-w-7xl mx-auto animate-fade-in animate-delay-600">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4 animate-fade-in animate-delay-700">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                                            <BarChart3 className="rounded-xl p-2.5 size-11 text-white bg-green-600 shadow-[0_6px_18px_-6px_rgba(34,197,94,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(34,197,94,0.85)]" />
                                        </CardHeader>
                                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                                            <p className="text-xl leading-tight text-gray-500">Licencias Totales</p>
                                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">{summaryData?.summary?.totalLicenses || 0}</div>
                                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                                <span>Total en el sistema</span>
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4 animate-fade-in animate-delay-800">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                                            <TrendingUp className="rounded-xl p-2.5 size-11 text-white bg-yellow-600 shadow-[0_6px_18px_-6px_rgba(202,138,4,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(202,138,4,0.85)]" />
                                        </CardHeader>
                                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                                            <p className="text-xl leading-tight text-gray-500">Licencias Activas</p>
                                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">{summaryData?.summary?.activeLicenses || 0}</div>
                                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                                <span>Actualmente en uso</span>
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4 animate-fade-in animate-delay-900">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                                            <TrendingUp className="rounded-xl p-2.5 size-11 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(68,173,226,0.85)]" />
                                        </CardHeader>
                                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                                            <p className="text-xl leading-tight text-gray-500">Utilización</p>
                                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">
                                                {summaryData?.summary?.utilizationRate ? `${Math.round(summaryData.summary.utilizationRate)}%` : '0%'}
                                            </div>
                                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                                <span>Promedio de uso</span>
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4 animate-fade-in animate-delay-1000">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                                            <DollarSign className="rounded-xl p-2.5 size-11 text-white bg-green-600 shadow-[0_6px_18px_-6px_rgba(34,197,94,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(34,197,94,0.85)]" />
                                        </CardHeader>
                                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                                            <p className="text-xl leading-tight text-gray-500">Costo Mensual</p>
                                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">
                                                {formatCurrency(summaryData?.summary?.monthlyCost || 0)}
                                            </div>
                                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                                <span>Gasto actual</span>
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="animate-fade-in animate-delay-1100">
                                <AdvancedCharts filters={filters} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Análisis Temporal */}
                    <TabsContent value="temporal">
                        <div className="animate-fade-in animate-delay-600">
                            <TemporalAnalysis filters={filters} />
                        </div>
                    </TabsContent>

                    {/* Tab: Reportes de Auditoría */}
                    <TabsContent value="audit">
                        <div className="animate-fade-in animate-delay-600">
                            <AuditReports filters={filters} />
                        </div>
                    </TabsContent>

                    {/* Tab: Análisis de Costos */}
                    <TabsContent value="costs">
                        <div className="animate-fade-in animate-delay-600">
                            <CostAnalysis filters={filters} />
                        </div>
                    </TabsContent>

                    {/* Tab: Reportes Personalizados */}
                    <TabsContent value="custom">
                        <div className="animate-fade-in animate-delay-600">
                            <CustomReportBuilder
                                onGenerateReport={handleCustomReport}
                                onExportReport={handleCustomExport}
                                loading={isLoading}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}