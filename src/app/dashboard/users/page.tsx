import { getUsers } from '@/lib/data/users'
import { getDepartments } from '@/lib/data/departments'
import { getLicenses } from '@/lib/data/licenses'
import { getSession } from '@/lib/session'
import { UsersTable } from '@/components/users/UsersTable'
import { AddUserDialog } from '@/components/users/AddUserDialog'

export default async function UsersPage() {
    const session = await getSession()
    const isAdmin = session?.user.role === 'ADMIN'

    const [users, departments, licenses] = await Promise.all([
        getUsers(),
        getDepartments(true),
        getLicenses(),
    ])

    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6 mb-5 md:mb-10 animate-fade-in animate-delay-100">
            <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
                <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                    <header className="text-2xl font-bold">Total de usuarios</header>
                    <p className="mt-1 text-gray-600 hidden md:block">
                        Administra los usuarios registrados en el sistema desde esta sección.
                    </p>
                </div>

                {isAdmin && (
                    <AddUserDialog departments={departments} licenses={licenses} />
                )}
            </div>

            <UsersTable initialData={users} isAdmin={isAdmin} />
        </div>
    )
}
