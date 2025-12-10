import type { auth } from "@/lib/auth"
import type { Session, User } from "better-auth/types"

export type AuthSession = typeof auth.$Infer.Session

export interface ExtendedUser extends User {
    username: string
    status?: string
    departmentId?: number
    startDate?: Date
}

export interface ExtendedSession extends Session {
    user: ExtendedUser
}

// Tipos para autenticación
export interface LoginData {
    username: string
    password: string
}

export interface SignupData {
    name: string
    username: string
    email: string
    password: string
}
