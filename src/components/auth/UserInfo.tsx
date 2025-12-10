"use client"

import { useAuth } from "@/hooks/useAuth"
import { User } from "lucide-react"

export function UserInfo() {
    const { user, isAuthenticated, isPending } = useAuth()

    if (isPending) {
        return (
            <div className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return null
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <User className="w-4 h-4 text-primary" />
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                    {user.name}
                </span>
                <span className="text-xs text-gray-500">
                    {user.email}
                </span>
            </div>
        </div>
    )
}
