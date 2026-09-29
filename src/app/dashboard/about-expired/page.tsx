import { AboutToExpiredTable } from "@/components/licenses/AboutToExpiredTable"

export default function AboutToExpired() {
    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6 mb-5 md:mb-10 animate-fade-in animate-delay-100">
        <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
            <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                <header className="text-2xl font-bold">Próximas a expirar</header>
            </div>
        </div>
        <AboutToExpiredTable />
    </div>
    )
}
