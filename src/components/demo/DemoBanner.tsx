import { Info } from 'lucide-react'

// Aviso fijo del modo demo: explica qué puede hacer la cuenta y que todo se reinicia.
export function DemoBanner({ isDemoAccount }: { isDemoAccount: boolean }) {
    return (
        <div role="status" className="flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-center text-sm text-white">
            <Info className="size-4 shrink-0" aria-hidden="true" />
            {isDemoAccount
                ? 'Estás en la demo con permisos de administrador: puedes crear, editar y eliminar. Los datos se reinician cada día.'
                : 'Tu cuenta de la demo es de solo lectura y se borra cada día. Para probar la edición, entra con "Probar demo".'}
        </div>
    )
}
