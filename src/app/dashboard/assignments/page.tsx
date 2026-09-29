import { BookA } from "lucide-react";

export default function AssignmentsPage() {
    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6 mb-5 md:mb-10 animate-fade-in animate-delay-100">
            <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
                <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                    <header className="text-2xl font-bold">Total de Asignaciones</header>
                    <p className="mt-1 text-gray-600 hidden md:block">
                        Administra las asignaciones registradas en el sistema desde esta sección.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg p-6 opacity-50 cursor-not-allowed w-[250px] md:w-[450px] mx-4 md:mx-7">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-100">
                        <BookA className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-400">Asignaciones</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    Asignaciones generales del sistema (Próximamente)
                </p>
            </div>
        </div>
    );
}