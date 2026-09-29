import { getDepartments } from '@/lib/data/departments'
import { getSession } from '@/lib/session'
import { DepartmentsManager } from '@/components/departments/DepartmentsManager'

export default async function DepartmentsPage() {
    const session = await getSession()
    const isAdmin = session?.user.role === 'ADMIN'

    const departments = await getDepartments()

    return <DepartmentsManager initialData={departments} isAdmin={isAdmin} />
}
