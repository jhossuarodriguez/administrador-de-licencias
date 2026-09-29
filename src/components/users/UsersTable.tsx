'use client'

import { AlertCircle, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import { useTableControls } from '@/hooks/useTableControls'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { TablePagination } from '../shared/TablePagination'
import { EditUserDialog } from './EditUserDialog'
import { DeleteUserDialog } from './DeleteUserDialog'
import { UserTableRow } from './UserTableRow'
import { UserCard } from './UserCard'
import type { User } from '@/types/user'
import type { SearchableValue } from '@/lib/tableUtils'

const USER_SEARCH_FIELDS = (user: User): SearchableValue[] => [
    user.name,
    user.username,
    user.status,
    user.status === 'active' ? 'Activo' : 'Inactivo',
    user.role,
    user.plan,
    user.department?.name ?? 'No asignado',
    user.Assignment?.[0]?.license?.provider ?? 'Sin asignar',
    user.Assignment?.[0]?.license?.model,
]

export function UsersTable({ initialData, isAdmin: adminProp }: { initialData?: User[]; isAdmin?: boolean }) {
    const { isAdmin: isAdminHook } = useAuth()
    const isAdmin = adminProp ?? isAdminHook
    const { users, isError, isLoading, handleDeleteUser, handleEditUser } = useUsers({ fallbackData: initialData })

    const {
        filterText, setFilterText, pageItems,
        currentPage, totalPages, goToPage,
        totalItems, filteredCount, hasFilter,
        visibleStart, visibleEnd, visiblePageNumbers,
    } = useTableControls(users, USER_SEARCH_FIELDS)

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<number | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<number | null>(null)

    const selectedUser = users.find((user) => user.id === userToEdit) ?? null

    const openEditModal = (id: number) => { setUserToEdit(id); setEditModalOpen(true) }
    const closeEditModal = () => { setEditModalOpen(false); setUserToEdit(null) }
    const openDeleteModal = (id: number) => { setUserToDelete(id); setDeleteModalOpen(true) }
    const closeDeleteModal = () => { setDeleteModalOpen(false); setUserToDelete(null) }

    const confirmDelete = async () => {
        if (userToDelete === null) return
        const result = await handleDeleteUser(userToDelete)
        if (!result.ok) { toast.error(result.error); return }
        closeDeleteModal()
        toast.success('Usuario eliminado')
    }

    if (isLoading) {
        return (
            <div className='hidden overflow-x-auto bg-white sm:rounded-lg'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-2'>Cargando Usuarios...</span>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className='hidden overflow-x-auto bg-white shadow-md sm:rounded-lg md:block'>
                <div className='flex items-center justify-center h-32 mt-5 gap-2'>
                    <AlertCircle className='h-5 w-5 text-red-500' />
                    <span>Error al cargar los usuarios, por favor, intenta de nuevo.</span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg">
            <div className="absolute top-0 left-0 z-10 flex items-center justify-center size-10 bg-gray-100">
                <Users className="size-6" />
            </div>
            <div className="flex flex-col gap-3 border-b bg-white px-4 py-0.5 pl-14 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        aria-label="Filtrar usuarios"
                        className="pl-9"
                        placeholder="Filtrar por nombre, usuario, departamento..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <p className="text-xs text-gray-500">
                    Mostrando <span className="font-medium text-gray-700">{visibleStart}-{visibleEnd}</span> de{' '}
                    <span className="font-medium text-gray-700">{filteredCount}</span>
                </p>
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm text-center text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Departamento</th>
                            <th className="px-6 py-3">Licencia Asignada</th>
                            {isAdmin && <th className="px-6 py-3">Accion</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map((user) => (
                            <UserTableRow
                                key={user.id}
                                user={user}
                                isAdmin={isAdmin}
                                onEdit={openEditModal}
                                onDelete={openDeleteModal}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden bg-white">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium text-gray-700 md:mx-0 mx-7">
                        {hasFilter ? `${filteredCount} de ${totalItems}` : totalItems} usuarios registrados
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {pageItems.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            isAdmin={isAdmin}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                        />
                    ))}
                </div>
            </div>

            {filteredCount === 0 && (
                <div className='py-8 text-center text-thirdary'>
                    {hasFilter ? 'No se encontraron usuarios con ese filtro' : 'No hay usuarios disponibles'}
                </div>
            )}

            {filteredCount > 0 && (
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    visiblePageNumbers={visiblePageNumbers}
                    onPageChange={goToPage}
                />
            )}

            {editModalOpen && selectedUser && (
                <EditUserDialog
                    key={selectedUser.id}
                    user={selectedUser}
                    onClose={closeEditModal}
                    onEditUser={handleEditUser}
                />
            )}

            <DeleteUserDialog
                open={deleteModalOpen}
                onOpenChange={(open) => { if (!open) closeDeleteModal() }}
                onConfirm={confirmDelete}
            />
        </div>
    )
}
