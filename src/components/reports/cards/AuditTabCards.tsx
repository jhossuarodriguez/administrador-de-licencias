'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Building, Clock, Shield, TrendingDown, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudit } from "@/hooks/useAudit";
import { ReportFilters } from "@/hooks/useReportTypes";
import { AssignmentHistoryRecord, UserActivityRecord, DepartmentAccessRecord } from "@/types";

interface AuditTabCardsProps {
    filters?: ReportFilters;
}

export function AuditTabCards({ filters }: AuditTabCardsProps) {
    const { data, isLoading, error } = useAudit(filters)

    const getComplianceColor = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getComplianceText = (score: number) => {
        if (score >= 90) return 'Excelente';
        if (score >= 70) return 'Bueno';
        return 'Requiere Atención';
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-6 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 place-items-center">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent>
                            <div>Error al cargar datos!</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Cumplimiento */}
                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                            <Shield className={`rounded-xl p-2.5 size-11 text-white ${data?.complianceAnalysis ? getComplianceColor(data.complianceAnalysis.complianceScore) : 'bg-gray-500'} shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(68,173,226,0.85)]`} />
                        </CardHeader>
                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                            <p className="text-xl leading-tight text-gray-500">Cumplimiento</p>
                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">
                                {data?.complianceAnalysis?.complianceScore || 0}%
                            </div>
                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                <span>{data?.complianceAnalysis ? getComplianceText(data.complianceAnalysis.complianceScore) : 'Sin datos'}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sobreasignadas */}
                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                            <AlertTriangle className="rounded-xl p-2.5 size-11 text-white bg-red-500 shadow-[0_6px_18px_-6px_rgba(239,68,68,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(239,68,68,0.85)]" />
                        </CardHeader>
                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                            <p className="text-xl leading-tight text-gray-500 overflow-hidden">Sobreasignadas</p>
                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">
                                {data?.complianceAnalysis?.overAllocated || 0}
                            </div>
                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                <span>Requieren atención inmediata</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Subutilizadas */}
                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                            <TrendingDown className="rounded-xl p-2.5 size-11 text-white bg-yellow-500 shadow-[0_6px_18px_-6px_rgba(234,179,8,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(234,179,8,0.85)]" />
                        </CardHeader>
                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                            <p className="text-xl leading-tight text-gray-500">Subutilizadas</p>
                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">
                                {data?.complianceAnalysis?.underUtilized || 0}
                            </div>
                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                <span>Oportunidades de optimización</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Vencidas Activas */}
                    <Card className="group flex flex-col w-full h-[175px] md:h-56 rounded-xl transition-shadow duration-150 gap-0 py-4">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 px-4 mb-3">
                            <Clock className="rounded-xl p-2.5 size-11 text-white bg-orange-500 shadow-[0_6px_18px_-6px_rgba(249,115,22,0.7)] transition-all duration-300 group-hover:shadow-[0_8px_22px_-6px_rgba(249,115,22,0.85)]" />
                        </CardHeader>
                        <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
                            <p className="text-xl leading-tight text-gray-500">Vencidas Activas</p>
                            <div className="text-2xl md:text-4xl font-bold mt-1.5 text-secondary">
                                {data?.complianceAnalysis?.expiredActive || 0}
                            </div>
                            <p className="hidden md:block text-xs md:text-sm text-thirdary leading-tight mt-2">
                                <span>Necesitan renovación urgente</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Historial de Asignaciones */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Historial de Asignaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                            <div className="space-y-3">
                                {data?.assignmentHistory && data.assignmentHistory.length > 0 ? (
                                    data.assignmentHistory.slice(0, 10).map((assignment: AssignmentHistoryRecord) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-thirdary">{assignment.user.name}</p>
                                                <p className="text-xs text-thirdary">
                                                    {assignment.license.provider} - {assignment.license.model}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-thirdary">
                                                    {new Date(assignment.assignedAt).toLocaleDateString()}
                                                </p>
                                                <Badge variant="outline" className="text-xs">
                                                    {assignment.user.department || 'Sin dept.'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-thirdary">
                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No hay historial de asignaciones</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Actividad de Usuarios */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Usuarios Más Activos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                            <div className="space-y-3">
                                {data?.userActivity && data.userActivity.length > 0 ? (
                                    data.userActivity.slice(0, 10).map((activity: UserActivityRecord, index: number) => (
                                        <div key={activity.userId} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-thirdary">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-thirdary">{activity.user?.name || 'Usuario desconocido'}</p>
                                                    <p className="text-xs text-thirdary">
                                                        {activity.user?.department || 'Sin departamento'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">
                                                {activity._count.id} {activity._count.id === 1 ? 'asignacion' : 'asignaciones'}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-thirdary">
                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No hay actividad de usuarios</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cambios Recientes en Licencias */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Cambios Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                            <div className="space-y-3">
                                {data?.licenseChanges && data.licenseChanges.length > 0 ? (
                                    data.licenseChanges.slice(0, 10).map((change: {
                                        id: number;
                                        provider: string;
                                        model: string | null;
                                        active: boolean;
                                        updatedAt: Date;
                                    }) => (
                                        <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-thirdary">{change.provider}</p>
                                                <p className="text-xs text-thirdary">
                                                    {change.model || 'Sin modelo'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-thirdary">
                                                    {new Date(change.updatedAt).toLocaleDateString()}
                                                </p>
                                                <Badge variant={change.active ? "default" : "secondary"}>
                                                    {change.active ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-thirdary">
                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No hay cambios recientes</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Acceso por Departamento */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Acceso por Departamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                            <div className="space-y-3">
                                {data?.departmentAccess && data.departmentAccess.length > 0 ? (
                                    data.departmentAccess.map((dept: DepartmentAccessRecord) => (
                                        <div key={dept.departmentId} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-thirdary">{dept.departmentName}</p>
                                                <p className="text-xs text-thirdary">
                                                    Departamento
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {dept._count.id} {dept._count.id === 1 ? 'licencia' : 'licencias'}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-thirdary">
                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No hay datos de departamentos</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
