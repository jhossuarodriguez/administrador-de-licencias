"use client"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
    showIcon?: boolean
    className?: string
}

export function LogoutButton({
    variant = "ghost",
    size = "default",
    showIcon = true,
    className = ""
}: LogoutButtonProps) {
    const { logout, isLoading } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        const result = await logout()
        if (result.success) {
            router.push("/")
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleLogout}
            className={className}
            disabled={isLoading}
        >
            {showIcon && <LogOut className="w-4 h-4 mr-2" />}
            {isLoading ? "Cerrando..." : "Cerrar Sesión"}
        </Button>
    )
}
