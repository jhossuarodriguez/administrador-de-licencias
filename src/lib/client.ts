import { createAuthClient } from "better-auth/react"

// En el cliente, usar directamente la variable o detectar el entorno
const getBaseURL = () => {
    // En el navegador, usar la variable de entorno o la URL actual
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC || window.location.origin
    }
    // En el servidor (SSR)
    return process.env.NEXT_PUBLIC || "http://localhost:3000"
}

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
})

export const {
    signIn,
    signOut,
    signUp,
    useSession,
} = authClient;