import { getLicenses, getLicenseCosts } from '@/lib/data/licenses'
import { getDepartments } from '@/lib/data/departments'
import { getUsers } from '@/lib/data/users'
import { getSedes } from '@/lib/data/sede'
import { getSession } from '@/lib/session'
import { LicenseTable } from '@/components/licenses/LicenseTable'
import { CostosTable } from '@/components/licenses/CostosTable'
import { AddLicenseDialog } from '@/components/licenses/AddLicenseDialog'

export default async function LicensesPage() {
    const session = await getSession()
    const isAdmin = session?.user.role === 'ADMIN'

    const [licenses, costs, departments, users, sedes] = await Promise.all([
        getLicenses(),
        getLicenseCosts(),
        getDepartments(true),
        getUsers(),
        getSedes(true),
    ])

    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6 mb-5 md:mb-10 animate-fade-in animate-delay-100">
            <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
                <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                    <header className="text-2xl font-bold">Total de Licencias</header>
                    <p className="mt-1 text-gray-600 hidden md:block">
                        Administra las licencias registradas en el sistema desde esta sección.
                    </p>
                </div>

                {isAdmin && (
                    <AddLicenseDialog departments={departments} users={users} sedes={sedes} />
                )}
            </div>

            <LicenseTable initialData={licenses} isAdmin={isAdmin} sedes={sedes} />

            <div className='mt-0 mb-10 md:mt-10'>
                <CostosTable initialData={costs} />
            </div>
        </div>
    )
}
