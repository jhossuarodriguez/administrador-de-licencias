'use client';

import { OverviewHeader } from "@/components/overview/OverviewHeader";
import LeftSidebar from "@/components/ui/dashboard/LeftSidebar";
import { useSidebarProvider } from "@/hooks/useSidebar";
import { useSession } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export { useSidebar } from "@/hooks/useSidebar";

export default function DashboardLayout(
    { children }: { children: React.ReactNode }
) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const { isSidebarOpen, toggleSidebar, SidebarContext: Context } = useSidebarProvider();

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/');
        }
    }, [session, isPending, router]);

    // Mostrar loading mientras verifica la sesión
    if (isPending) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Si no hay sesión, no renderizar nada (se redirigirá)
    if (!session) {
        return null;
    }

    return (
        <Context.Provider value={{ isSidebarOpen, toggleSidebar }}>
            <div className="flex flex-row w-full h-screen overflow-x-hidden">
                {/* Sidebar */}
                <aside
                    className={`bg-sidebarBg transition-all duration-500 ease-in-out flex-shrink-0 ${isSidebarOpen
                        ? 'w-20 md:w-56 opacity-100 translate-x-0'
                        : 'w-0 opacity-0 -translate-x-full overflow-hidden'
                        }`}
                >
                    <div
                        className={`w-20 md:w-56 transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <LeftSidebar />
                    </div>
                </aside>

                {/* Main Content con efecto Apple Liquid Glass */}
                <main className="relative flex-1 flex justify-center items-start min-h-screen overflow-y-auto overflow-x-hidden transition-all duration-500 ease-in-out bg-[linear-gradient(135deg,#fafafa_0%,#f0f4f8_40%,#fef5eb_100%)]">

                    {/* Orbes difusos de fondo */}
                    <div className="pointer-events-none fixed inset-0 overflow-hidden">
                        {/* Orb azul */}
                        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl bg-[radial-gradient(circle,#44ADE2,transparent_70%)]" />

                        {/* Orb azul suave */}
                        <div className="absolute top-1/3 right-1/3 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl bg-[radial-gradient(circle,#44ADE2,transparent_70%)]" />
                    </div>

                    {/* Contenido */}
                    <div className="relative w-full max-w-full z-10">
                        <OverviewHeader />
                        {children}
                    </div>
                </main>
            </div>
        </Context.Provider>
    )
}