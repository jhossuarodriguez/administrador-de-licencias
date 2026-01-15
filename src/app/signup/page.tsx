"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Signup() {
    const { signup, authError } = useAuth()
    const router = useRouter()
    const [successMessage, setSuccessMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSuccessMessage("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const username = formData.get("username") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const result = await signup({ name, username, email, password })

        if (result.success) {
            setSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...")

            setTimeout(() => {
                router.push("/")
            }, 2000)
        }
    }

    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            {/* Left Side - Video Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <Image
                    className="h-screen w-full object-cover"
                    src="/left-bento.png"
                    alt="Image Background"
                />
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-6">
                            <Image
                                src="/logo.png"
                                alt='Logo'
                                width={120}
                                height={120}
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Regístrate</h2>
                    </div>

                    {/* Signup Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {authError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {authError}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                                {successMessage}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Nombre*
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Nombre"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Usuario*
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Usuario"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email*
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Correo electrónico"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Contraseña*
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Contraseña"
                                className="mt-1.5 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                required
                                minLength={8}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Mínimo 8 caracteres
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium cursor-pointer"
                        >
                            Crear Cuenta
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
