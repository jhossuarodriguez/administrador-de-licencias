"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { getAuthErrorMessage } from "@/lib/authErrors"
import { loginSchema, signupSchema } from "@/lib/validations/auth"
import type { LoginData, SignupData, SocialProvider } from "@/types/auth"

type AuthResult = { success: boolean; error?: string }
type AuthResponse = { error: { code?: string; message?: string; status?: number } | null }

export function useAuth() {
    const { data, isPending, refetch } = authClient.useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [authError, setAuthError] = useState("")
    const [socialRedirect, setSocialRedirect] = useState<SocialProvider | null>(null)

    // Si el usuario vuelve con "Atrás" desde GitHub/Google, el navegador puede restaurar
    // la página desde caché con los botones todavía bloqueados.
    useEffect(() => {
        const resetOnRestore = (event: PageTransitionEvent) => {
            if (event.persisted) setSocialRedirect(null)
        }
        window.addEventListener("pageshow", resetOnRestore)
        return () => window.removeEventListener("pageshow", resetOnRestore)
    }, [])

    const user = data?.user ?? null

    const fail = (message: string): AuthResult => {
        setAuthError(message)
        return { success: false, error: message }
    }

    // Ejecuta una llamada a Better Auth y traduce sus errores a mensajes para el usuario.
    const run = async (request: () => Promise<AuthResponse>): Promise<AuthResult> => {
        setAuthError("")
        setIsLoading(true)
        try {
            const { error } = await request()
            if (error) return fail(getAuthErrorMessage(error))
            return { success: true }
        } catch {
            return fail("Error de conexión")
        } finally {
            setIsLoading(false)
        }
    }

    // Tras iniciar sesión espera a tener la sesión cargada, así el dashboard no redirige al login.
    const withSession = (request: () => Promise<AuthResponse>) => run(async () => {
        const response = await request()
        if (!response.error) await refetch()
        return response
    })

    const handleLogin = async ({ username, password }: LoginData) => {
        const validation = loginSchema.safeParse({ identifier: username, password })

        if (!validation.success) {
            return fail(validation.error.issues[0]?.message || "Datos inválidos")
        }

        const { identifier } = validation.data
        return withSession(() => identifier.includes("@")
            ? authClient.signIn.email({ email: identifier, password })
            : authClient.signIn.username({ username: identifier, password }))
    }

    const handleSignup = async (signupData: SignupData) => {
        const validation = signupSchema.safeParse(signupData)

        if (!validation.success) {
            return fail(validation.error.issues[0]?.message || "Datos inválidos")
        }

        const { name, username, email, password } = validation.data
        return withSession(() => authClient.signUp.email({ name, username, email, password }))
    }

    const handleSocialLogin = async (provider: SocialProvider) => {
        setSocialRedirect(provider)
        const result = await run(() => authClient.signIn.social({
            provider,
            callbackURL: "/dashboard",
            // Si el proveedor falla o el usuario cancela, vuelve aquí con ?error=
            errorCallbackURL: window.location.pathname,
        }))

        // Si salió bien, el navegador ya va camino al proveedor
        if (!result.success) setSocialRedirect(null)
        return result
    }

    const handleLogout = () => run(() => authClient.signOut())

    const clearError = () => setAuthError("")

    return {
        user,
        isPending,
        isAdmin: user?.role === "ADMIN",
        isAuthenticated: !!user,
        isLoading,
        authError,
        socialRedirect,
        clearError,
        login: handleLogin,
        signup: handleSignup,
        socialLogin: handleSocialLogin,
        logout: handleLogout,
    }
}
