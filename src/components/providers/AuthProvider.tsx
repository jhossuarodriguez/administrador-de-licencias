"use client"

import { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
    // Better Auth no requiere un provider específico en la versión actual
    // El contexto de sesión se maneja automáticamente con useSession
    return <>{children}</>
}
