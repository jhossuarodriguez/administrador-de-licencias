'use client'

import { MostUsedLicenses } from "@/components/overview/MostUsedLicenses";
import { StatsChart } from "@/components/overview/StatsChart";
import { BarStatsSummary } from "@/components/overview/BarStatsSummary"
import { AboutExpired } from '@/components/overview/AboutExpired';
import { UserLicenseCards } from "@/components/overview/cards/UserLicenseCards";

export default function DashboardPage() {

    return (
        <section>
            <div className={`flex flex-col mx-4 md:mx-7 transition-all duration-500 `}>
                <div className="w-full px-2 mx-auto mt-10 mb-10 max-w-[1450px]">
                    <UserLicenseCards />
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 mt-5">
                        {/* Bloque 1 - Chart Principal */}
                        <StatsChart />
                        {/* Bloque 2 - Más Usadas */}
                        <MostUsedLicenses />
                        {/* Bloque 3 - Bar Chart */}
                        <BarStatsSummary />
                        {/* Bloque 4 - Resumen (Proxima a Expirar) */}
                        <AboutExpired />
                    </div>
                </div>
            </div>
        </section >
    );
}