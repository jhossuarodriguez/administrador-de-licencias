import Image from "next/image"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
    name?: string | null
    image?: string | null
    className?: string
}

function getInitials(name?: string | null) {
    return (name ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
}

// Foto de GitHub/Google si existe; si no, las iniciales del usuario.
export function UserAvatar({ name, image, className }: UserAvatarProps) {
    if (image) {
        return (
            <Image
                src={image}
                alt={name ?? "Usuario"}
                width={40}
                height={40}
                referrerPolicy="no-referrer"
                className={cn("size-10 rounded-full object-cover", className)}
            />
        )
    }

    return (
        <span
            role="img"
            aria-label={name ?? "Usuario"}
            className={cn("flex size-10 items-center justify-center rounded-full bg-secondary/15 text-sm font-semibold text-secondary", className)}
        >
            {getInitials(name) || "?"}
        </span>
    )
}
