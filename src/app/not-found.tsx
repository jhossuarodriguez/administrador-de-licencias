import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
            <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-cover opacity-10 -z-10"
                priority
            />

            <header className="text-4xl font-bold text-center">
                Error 404: Página no encontrada
            </header>
            <p className="mt-4 text-center">
                Lo sentimos, la página que estás intentando acceder no existe.
            </p>

            <Button asChild className="mt-10">
                <Link href="/dashboard">← Ir al Dashboard</Link>
            </Button>
        </div>
    )
}
