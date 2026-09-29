import { KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const MARK_SIZES = {
    sm: 'size-9 rounded-lg [&_svg]:size-5',
    md: 'size-11 rounded-xl [&_svg]:size-6',
    lg: 'size-16 rounded-2xl [&_svg]:size-8',
} as const

interface AppLogoProps {
    size?: keyof typeof MARK_SIZES
    showText?: boolean
    className?: string
}

export function AppLogo({ size = 'md', showText = false, className }: AppLogoProps) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <span
                aria-hidden="true"
                className={cn(
                    'flex shrink-0 items-center justify-center bg-linear-to-br from-secondary to-[#2b86b8] text-white shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]',
                    MARK_SIZES[size],
                )}
            >
                <KeyRound />
            </span>
            {showText ? (
                <span className="flex flex-col leading-tight">
                    <span className="font-semibold text-gray-900">Administrador</span>
                    <span className="text-sm text-thirdary">de Licencias</span>
                </span>
            ) : (
                <span className="sr-only">Administrador de Licencias</span>
            )}
        </div>
    )
}
