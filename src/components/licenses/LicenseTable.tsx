'use client'

import { AlertCircle, KeyRound, Search } from 'lucide-react'
import { useState } from 'react'
import { useLicenses } from '@/hooks/useLicense'
import { useAuth } from '@/hooks/useAuth'
import { useTableControls } from '@/hooks/useTableControls'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { TablePagination } from '../shared/TablePagination'
import { EditLicenseDialog } from './EditLicenseDialog'
import { DeleteLicenseDialog } from './DeleteLicenseDialog'
import { LicenseTableRow } from './LicenseTableRow'
import { LicenseCard } from './LicenseCard'
import type { License } from '@/types/license'
import type { Sede } from '@/types/sede'
import type { SearchableValue } from '@/lib/tableUtils'

const LICENSE_SEARCH_FIELDS = (item: License): SearchableValue[] => [
    item.sede,
    item.provider,
    item.assigned ?? 'No asignado',
    item.department?.name ?? 'No asignado',
    item.model,
    item.plan,
    item.billingCycle,
    item.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual',
    item.active ? 'Activa' : 'Inactiva',
    item.startDate,
    item.expiration,
    item.totalLicense,
    item.usedLicense,
]

export function LicenseTable({ initialData, isAdmin: adminProp, sedes = [] }: { initialData?: License[]; isAdmin?: boolean; sedes?: Sede[] }) {
    const { isAdmin: isAdminHook } = useAuth()
    const isAdmin = adminProp ?? isAdminHook
    const { license, isError, isLoading, handleDeleteLicense, handleEditLicense } = useLicenses({ fallbackData: initialData })

    const {
        filterText, setFilterText, pageItems,
        currentPage, totalPages, goToPage,
        totalItems, filteredCount, hasFilter,
        visibleStart, visibleEnd, visiblePageNumbers,
    } = useTableControls(license, LICENSE_SEARCH_FIELDS)

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [licenseToEdit, setLicenseToEdit] = useState<number | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [licenseToDelete, setLicenseToDelete] = useState<number | null>(null)

    const selectedLicense = license.find((item) => item.id === licenseToEdit) ?? null

    const openEditModal = (id: number) => { setLicenseToEdit(id); setEditModalOpen(true) }
    const closeEditModal = () => { setEditModalOpen(false); setLicenseToEdit(null) }
    const openDeleteModal = (id: number) => { setLicenseToDelete(id); setDeleteModalOpen(true) }
    const closeDeleteModal = () => { setDeleteModalOpen(false); setLicenseToDelete(null) }

    const confirmDelete = async () => {
        if (licenseToDelete === null) return
        const result = await handleDeleteLicense(licenseToDelete)
        if (!result.ok) { toast.error(result.error); return }
        closeDeleteModal()
        toast.success('Licencia eliminada')
    }

    if (isLoading) {
        return (
            <div className='hidden overflow-x-auto bg-white sm:rounded-lg'>
                <div className='flex items-center justify-center h-32 mt-5'>
                    <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
                    <span className='ml-2'>Cargando Licencias...</span>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className='hidden overflow-x-auto bg-white shadow-md sm:rounded-lg md:block'>
                <div className='flex items-center justify-center h-32 mt-5 gap-2'>
                    <AlertCircle className='h-5 w-5 text-red-500' />
                    <span>Error al cargar las licencias, por favor, intenta de nuevo.</span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg">
            <div className="absolute top-0 left-0 z-10 flex items-center justify-center size-10 bg-gray-100">
                <KeyRound className="size-6" />
            </div>
            <div className="flex flex-col gap-3 border-b bg-white px-4 py-0.5 pl-14 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        aria-label="Filtrar licencias"
                        className="pl-9"
                        placeholder="Filtrar por producto, sede, responsable..."
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
                            <th className="px-6 py-3">Cantidad</th>
                            <th className="px-6 py-3">Sede</th>
                            <th className="px-6 py-3">Proveedor</th>
                            <th className="px-6 py-3">Inicio</th>
                            <th className="px-6 py-3">Expiración</th>
                            <th className="px-6 py-3">Asignado</th>
                            <th className="px-6 py-3">Departamento</th>
                            <th className="px-6 py-3">Plan</th>
                            <th className="px-6 py-3">Producto</th>
                            {isAdmin && <th className="px-6 py-3">Acción</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map((item) => (
                            <LicenseTableRow
                                key={item.id}
                                license={item}
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
                        {hasFilter ? `${filteredCount} de ${totalItems}` : totalItems} licencias registradas
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {pageItems.map((item) => (
                        <LicenseCard
                            key={item.id}
                            license={item}
                            isAdmin={isAdmin}
                            onEdit={openEditModal}
                        />
                    ))}
                </div>
            </div>

            {filteredCount === 0 && (
                <div className='py-8 text-center text-thirdary'>
                    {hasFilter ? 'No se encontraron licencias con ese filtro' : 'No hay Licencias disponibles'}
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

            {editModalOpen && selectedLicense && (
                <EditLicenseDialog
                    key={selectedLicense.id}
                    license={selectedLicense}
                    sedes={sedes}
                    onClose={closeEditModal}
                    onEditLicense={handleEditLicense}
                />
            )}

            <DeleteLicenseDialog
                open={deleteModalOpen}
                onOpenChange={(open) => { if (!open) closeDeleteModal() }}
                onConfirm={confirmDelete}
            />
        </div>
    )
}
