"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { Suspense, useState } from "react"
import { BarChart3, CalendarClock, KeyRound } from "lucide-react"
import { AppLogo } from "@/components/brand/AppLogo"
import { OAuthErrorAlert } from "@/components/auth/OAuthErrorAlert"
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons"
import { useAuth } from "@/hooks/useAuth"
import { isDemoMode } from "@/lib/demo"
import { useRouter } from "next/navigation"

const HIGHLIGHTS = [
    { icon: KeyRound, text: "Inventario de licencias y asignaciones por usuario" },
    { icon: CalendarClock, text: "Alertas de licencias próximas a vencer" },
    { icon: BarChart3, text: "Reportes de costos por proveedor y departamento" },
]

export default function Signup() {
    const { signup, socialLogin, socialRedirect, isLoading, authError } = useAuth()
    const router = useRouter()
    const [successMessage, setSuccessMessage] = useState("")
    const isBusy = isLoading || socialRedirect !== null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSuccessMessage("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const username = formData.get("username") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        const result = await signup({ name, username, email, password, confirmPassword })

        if (result?.success) {
            setSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo al panel...")
            router.push("/dashboard")
        }
    }

    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            {/* Left Side - Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-linear-to-br from-secondary to-[#1f6f9c] text-white">
                <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
                        <KeyRound className="size-6" />
                    </span>
                    <span className="text-lg font-semibold">Administrador de Licencias</span>
                </div>

                <div className="max-w-md space-y-8">
                    <p className="text-4xl font-bold leading-tight">
                        Todas tus licencias de software, bajo control.
                    </p>
                    <ul className="space-y-4">
                        {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-3 text-white/90">
                                <Icon className="size-5 shrink-0" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-sm text-white/70">Costos, asignaciones y vencimientos en un solo lugar.</p>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-6 lg:hidden">
                            <AppLogo size="lg" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Regístrate</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Crea tu cuenta para administrar licencias
                        </p>
                        {isDemoMode() && (
                            <p className="mt-3 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-2 text-sm text-gray-600">
                                Demo pública: las cuentas nuevas son de solo lectura y se borran cada día.
                            </p>
                        )}
                    </div>

                    {authError ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {authError}
                        </div>
                    ) : (
                        <Suspense fallback={null}>
                            <OAuthErrorAlert />
                        </Suspense>
                    )}

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                            {successMessage}
                        </div>
                    )}

                    <SocialAuthButtons
                        onSelect={socialLogin}
                        redirectingTo={socialRedirect}
                        disabled={isBusy}
                        dividerText="o regístrate con tu email"
                    />

                    {/* Signup Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="name" className="text-base font-medium text-gray-700">
                                Nombre Completo
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Nombre Completo"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                                disabled={isBusy}
                            />
                        </div>

                        <div>
                            <Label htmlFor="username" className="text-base font-medium text-gray-700">
                                Usuario
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Nombre de usuario"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                                disabled={isBusy}
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-base font-medium text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                                disabled={isBusy}
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-base font-medium text-gray-700">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Contraseña"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                                minLength={8}
                                disabled={isBusy}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Mínimo 8 caracteres
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">
                                Confirmar Contraseña
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirmar contraseña"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                disabled={isBusy}
                                minLength={8}
                                required
                                >
                            </Input>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium cursor-pointer"
                            disabled={isBusy}
                        >
                            {isLoading && socialRedirect === null ? "Creando cuenta..." : "Crear Cuenta"}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{' '}
                            <Link
                                href="/"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
