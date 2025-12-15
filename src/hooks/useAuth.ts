"use client"

import { useSession, signIn, signOut, signUp } from "@/lib/client"
import { useState } from "react"
import type { LoginData, SignupData } from "@/types/auth"
import { loginSchema, signupSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"

export function useAuth() {
    const { data: session, isPending, error } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [authError, setAuthError] = useState("")

    const handleLogin = async ({ username, password }: LoginData) => {
        setAuthError("")
        setIsLoading(true)

        try {
            // Validar con Zod
            const validatedData = loginSchema.parse({
                identifier: username,
                password,
            });

        } catch (error: any) {
            if (error instanceof ZodError) {
                const firstError = error.issues[0]?.message;
                setAuthError(firstError || "Datos inválidos");
                setIsLoading(false);
                return { success: false, error: firstError || "Datos inválidos" };
            }
        }

        try {
            const userResponse = await fetch(`/api/users/by-username/${username}`)

            if (!userResponse.ok) {
                setAuthError("Usuario no existe")
                setIsLoading(false)
                return { success: false, error: "Usuario no existe" }
            }

            const userData = await userResponse.json()

            const response = await signIn.email({
                email: userData.email,
                password,
                fetchOptions: {
                    onSuccess: async () => {
                        window.location.href = "/dashboard"
                    },
                    onError: (ctx) => {
                        console.error("Login error:", ctx.error)
                        setAuthError(ctx.error.message || "Contraseña incorrecta")
                    },
                },
            })

            // Verificar si el login fue exitoso
            if (response.error) {
                setAuthError(response.error.message || "Contraseña incorrecta")
                setIsLoading(false)
                return { success: false, error: response.error.message || "Contraseña incorrecta" }
            }

            setIsLoading(false)
            return { success: true, data: response }
        } catch (error) {
            console.error("Login error:", error)
            setAuthError("Usuario o contraseña incorrectos")
            setIsLoading(false)
            return { success: false, error: "Usuario o contraseña incorrectos" }
        }
    }

    const handleSignup = async ({ name, username, email, password, confirmPassword }: SignupData & { confirmPassword?: string }) => {
        setAuthError("")
        setIsLoading(true)

        try {
            // Validar con Zod
            const validatedData = signupSchema.parse({
                name,
                username,
                email,
                password,
                confirmPassword: confirmPassword || password,
            });
        } catch (error: any) {
            if (error instanceof ZodError) {
                const firstError = error.issues[0]?.message;
                setAuthError(firstError || "Datos inválidos");
                setIsLoading(false);
                return { success: false, error: firstError || "Datos inválidos" };
            }
        }

        try {
            // Crear usuario usando fetch directo para tener control total
            const response = await fetch('/api/auth/sign-up/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    username, // Campo adicional configurado en Better Auth
                }),
                credentials: 'include',
            })

            const textResponse = await response.text()

            let data: any = {}
            try {
                if (textResponse) {
                    data = JSON.parse(textResponse)
                }
            } catch (e) {
                data = { error: textResponse || 'Invalid response from server' }
            }

            if (!response.ok) {
                const errorMsg = data?.message || data?.error || textResponse || `HTTP ${response.status}: ${response.statusText}`
                setAuthError(errorMsg)
                throw new Error(errorMsg)
            }

            // Si autoSignIn está en true, Better Auth crea sesión automáticamente
            // Cerramos la sesión para que el usuario tenga que loguearse manualmente
            await signOut()

            setIsLoading(false)
            return { success: true, data }
        } catch (error: any) {
            const errorMessage = error?.message || error?.toString() || "Error al crear la cuenta"
            setAuthError(errorMessage.includes("unique") || errorMessage.includes("already exists")
                ? "El usuario o email ya existe."
                : errorMessage)
            setIsLoading(false)
            return { success: false, error: errorMessage }
        }
    }

    const handleLogout = async () => {
        setAuthError("")
        setIsLoading(true)

        try {
            await signOut()
            setIsLoading(false)
            return { success: true }
        } catch (error) {
            setAuthError("Error al cerrar sesión")
            setIsLoading(false)
            return { success: false, error }
        }
    }

    const clearError = () => setAuthError("")

    return {
        // Estado de sesión
        session,
        user: session?.user,
        isPending,
        error,
        isAuthenticated: !!session?.user,

        // Estado de carga y errores
        isLoading,
        authError,
        clearError,

        // Acciones
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
    }
}
