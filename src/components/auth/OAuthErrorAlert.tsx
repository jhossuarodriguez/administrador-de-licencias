"use client"

import { useSearchParams } from "next/navigation"
import { getOAuthErrorMessage } from "@/lib/authErrors"

// Better Auth vuelve a la página con ?error=<código> cuando falla el login con GitHub o Google.
export function OAuthErrorAlert() {
    const error = useSearchParams().get("error")

    if (!error) return null

    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {getOAuthErrorMessage(error)}
        </div>
    )
}
