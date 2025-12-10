import Link from "next/link"
import { Building2, Settings, Database } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6 mb-5 md:mb-10 animate-fade-in animate-delay-100">
            <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
                <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                    <header className="text-2xl font-bold">Configuración</header>
                    <p className="mt-1 text-gray-600 hidden md:block">
                        Administra la configuración registrada en el sistema desde esta sección.
                    </p>
                </div>
            </div>

            {/* Grid de opciones de configuración */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4 md:mx-7">
                {/* Departamentos */}
                <Link href="/dashboard/settings/departments">
                    <div className="group border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Departamentos</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Administra los departamentos de tu organización. Crea, edita y organiza departamentos.
                        </p>
                    </div>
                </Link>

                {/* Placeholder para futuras configuraciones */}
                <div className="border rounded-lg p-6 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-gray-100">
                            <Settings className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-400">General</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Configuraciones generales del sistema (Próximamente)
                    </p>
                </div>

                <div className="border rounded-lg p-6 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-gray-100">
                            <Database className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-400">Base de Datos</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Gestión de respaldos y mantenimiento (Próximamente)
                    </p>
                </div>
            </div>
        </div>
    )
}