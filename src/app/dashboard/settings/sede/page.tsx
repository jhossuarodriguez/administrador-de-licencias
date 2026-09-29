import { SedeManager } from '@/components/sede/SedeManager'
import { getSedes } from '@/lib/data/sede'
import { getSession } from '@/lib/session'

export default async function SedePage() {
    const [session, sedes] = await Promise.all([getSession(), getSedes()])
    const isAdmin = session?.user.role === 'ADMIN'

    return <SedeManager initialData={sedes} isAdmin={isAdmin} />
}
