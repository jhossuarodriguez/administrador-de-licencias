'use client'

import { useCosts } from '@/hooks/useCosts';
import { useTableControls } from '@/hooks/useTableControls';
import { useUsdDopRate } from '@/hooks/useExchangeRate';
import { dopToUsd } from '@/lib/utils';
import { CurrencyAmount } from '@/components/currency/CurrencyAmount';
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/shared/TablePagination';
import { cn } from '@/lib/utils';
import type { LicenseCost } from '@/types';
import type { SearchableValue } from '@/lib/tableUtils';
import { AlertCircle, CalendarClock, DollarSign, ReceiptText, Search, Sparkles } from 'lucide-react';
import { type ReactNode } from 'react';

const costColumns = [
    { key: 'unitCost', label: 'Unitario', description: 'Base' },
    { key: 'installmentCost', label: 'Instalacion', description: 'Por cuota' },
    { key: 'penaltyCost', label: 'Penalidad', description: 'Riesgo' },
] as const

const getCostTotal = (cost: LicenseCost) => cost.unitCost * cost.totalLicense

const getBillingCycleBadge = (billingCycle: string) => {
    const isMonthly = billingCycle === 'MONTHLY'

    return {
        label: isMonthly ? 'Mensual' : 'Anual',
        tone: isMonthly ? 'Azul operativo' : 'Verde planificado',
        className: isMonthly
            ? 'border-secondary/25 bg-secondary/10 text-secondary shadow-secondary/10'
            : 'border-emerald-500/25 bg-emerald-50 text-emerald-700 shadow-emerald-500/10',
    }
}

function CostStatusCard({
    icon,
    title,
    description,
    isError = false,
}: {
    icon: ReactNode
    title: string
    description: string
    isError?: boolean
}) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border bg-white p-8 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.65)]',
                isError ? 'border-red-200' : 'border-slate-200'
            )}
            role={isError ? 'alert' : 'status'}
            aria-live="polite"
        >
            <div className="absolute -right-10 -top-12 size-36 rounded-full bg-secondary/10 blur-2xl" />
            <div className="relative flex flex-col items-center justify-center gap-3 text-center text-thirdary sm:flex-row sm:text-left">
                <div
                    className={cn(
                        'grid size-12 place-items-center rounded-2xl border shadow-lg',
                        isError
                            ? 'border-red-200 bg-red-50 text-red-500 shadow-red-500/10'
                            : 'border-primary/20 bg-primary/10 text-primary shadow-primary/10'
                    )}
                >
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-thirdary">{description}</p>
                </div>
            </div>
        </div>
    )
}

function BillingCycleBadge({ billingCycle }: { billingCycle: string }) {
    const badge = getBillingCycleBadge(billingCycle)

    return (
        <span
            className={cn(
                'inline-flex min-w-28 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm',
                badge.className
            )}
            title={badge.tone}
        >
            {badge.label}
        </span>
    )
}

function CostAmount({ amount, currency }: { amount: number; currency?: string }) {
    return (
        <CurrencyAmount
            amount={amount}
            currency={currency === 'DOP' ? 'DOP' : 'USD'}
            layout="stacked"
            className="items-start"
            primaryClassName="font-semibold text-slate-950 tabular-nums"
            secondaryClassName="text-[11px] text-thirdary tabular-nums"
        />
    )
}

function CostMetric({
    label,
    description,
    children,
}: {
    label: string
    description: string
    children: ReactNode
}) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">{label}</p>
            <div className="mt-2 text-xl font-bold leading-tight md:text-2xl">{children}</div>
            <p className="mt-1 text-xs text-white/60">{description}</p>
        </div>
    )
}

function CostCard({ cost }: { cost: LicenseCost }) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-[0_22px_55px_-34px_rgba(68,173,226,0.55)]">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-secondary to-emerald-400" />
            <div className="flex items-start justify-between gap-3 pl-2">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-thirdary">Proveedor</p>
                    <h4 className="mt-1 truncate text-base font-bold text-slate-950">{cost.provider}</h4>
                </div>
                <BillingCycleBadge billingCycle={cost.billingCycle} />
            </div>

            <div className="mt-4 grid gap-3 pl-2">
                {costColumns.map((column) => (
                    <div key={column.key} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                        <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-thirdary">{column.label}</span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{column.description}</span>
                        </div>
                        <CostAmount amount={cost[column.key]} currency={cost.currency} />
                    </div>
                ))}
            </div>
        </article>
    )
}

const COST_SEARCH_FIELDS = (cost: LicenseCost): SearchableValue[] => [
    cost.id,
    cost.model,
    cost.unitCost,
    cost.installmentCost,
    cost.penaltyCost,
    cost.billingCycle,
    cost.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual',
    cost.currency,
]

export function CostosTable({ initialData }: { initialData?: LicenseCost[] }) {
    const { costs, error, isLoading } = useCosts({ fallbackData: initialData })
    const {
        filterText, setFilterText, filteredItems, pageItems,
        currentPage, totalPages, goToPage,
        totalItems, filteredCount, hasFilter,
        visibleStart, visibleEnd, visiblePageNumbers,
    } = useTableControls(costs, COST_SEARCH_FIELDS)

    const { rate } = useUsdDopRate()

    const monthlyCosts = filteredItems.filter((cost) => cost.billingCycle === 'MONTHLY').length
    const annualCosts = filteredItems.length - monthlyCosts
    // Total normalizado a USD: los montos en DOP se convierten con la tasa vigente
    const unitCostTotal = filteredItems.reduce((total, cost) => {
        const amount = Number(cost.unitCost ?? 0)
        if (cost.currency === 'DOP') {
            return rate ? total + dopToUsd(amount, rate) : total
        }
        return total + amount
    }, 0)

    if (isLoading) {
        return (
            <CostStatusCard
                icon={<div className="size-5 animate-spin rounded-full border-2 border-primary/20 border-b-primary" />}
                title="Cargando costos"
                description="Sincronizando la matriz de precios y equivalencias USD/DOP."
            />
        )
    }

    if (error) {
        return (
            <CostStatusCard
                icon={<AlertCircle className="size-5" />}
                title="No se pudieron cargar los costos"
                description="Intenta de nuevo para recuperar los precios registrados."
                isError
            />
        )
    }

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_26px_70px_-42px_rgba(15,23,42,0.75)]">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_14%_22%,rgba(243,164,83,0.34),transparent_30%),radial-gradient(circle_at_88%_0%,rgba(68,173,226,0.32),transparent_34%)]" />
            <div className="relative overflow-hidden bg-slate-950 px-5 py-6 text-white md:px-7">
                <div className="absolute inset-0 opacity-80 bg-secondary" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-[0_14px_35px_-18px_rgba(243,164,83,0.95)]">
                            <ReceiptText className="size-6" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white">Matriz de costos</p>
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
                                    <Sparkles className="size-3" />
                                    USD + DOP
                                </span>
                            </div>
                            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Precios por licencia</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                                Comparativa rapida de costo unitario, cuotas de instalacion y penalidades por proveedor.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                        <CostMetric label="Registros" description={hasFilter ? `${totalItems} total` : 'Tarifas activas'}>
                            {filteredCount}
                        </CostMetric>
                        <CostMetric label="Ciclos" description={`${annualCosts} anuales`}>
                            {monthlyCosts} mensuales
                        </CostMetric>
                        <CostMetric label="Base total" description="Costo unitario acumulado">
                            <CurrencyAmount
                                amount={unitCostTotal}
                                layout="stacked"
                                primaryClassName="text-white"
                                secondaryClassName="text-white/60"
                            />
                        </CostMetric>
                    </div>
                </div>
            </div>

            {costs.length > 0 && (
                <div className="relative flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">
                    <div className="relative w-full md:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            aria-label="Filtrar costos"
                            className="pl-9"
                            placeholder="Filtrar por producto, ciclo o costo..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-thirdary">
                        Mostrando <span className="font-semibold text-slate-700">{visibleStart}-{visibleEnd}</span> de{' '}
                        <span className="font-semibold text-slate-700">{filteredCount}</span>
                        {hasFilter && <span> resultados de {totalItems}</span>}
                    </p>
                </div>
            )}

            {costs.length === 0 ? (
                <div className="relative px-5 py-12 text-center md:px-7">
                    <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-dashed border-secondary/40 bg-secondary/10 text-secondary">
                        <DollarSign className="size-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-950">No hay costos disponibles</h3>
                    <p className="mt-1 text-sm text-thirdary">Cuando existan licencias con costos, apareceran aqui con su equivalencia en DOP.</p>
                </div>
            ) : filteredCount === 0 ? (
                <div className="relative px-5 py-12 text-center md:px-7">
                    <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-dashed border-secondary/40 bg-secondary/10 text-secondary">
                        <Search className="size-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-950">No se encontraron costos</h3>
                    <p className="mt-1 text-sm text-thirdary">Prueba con otro proveedor, ciclo de facturacion o monto.</p>
                </div>
            ) : (
                <>
                    {/* Vista Desktop - Tabla */}
                    <div className="relative hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[860px] text-left text-sm">
                            <caption className="sr-only">Costos de licencias por proveedor</caption>
                            <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Producto</th>
                                    {costColumns.map((column) => (
                                        <th key={column.key} className="px-6 py-4 font-semibold">
                                            <span className="block text-slate-700">{column.label}</span>
                                            <span className="mt-0.5 block text-[10px] font-medium tracking-[0.14em] text-slate-400">{column.description}</span>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-center font-semibold">Total</th>
                                    <th className="px-6 py-4 text-center font-semibold">Facturacion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {pageItems.map((cost, index) => (
                                    <tr
                                        key={cost.id}
                                        className="group transition-colors duration-200 hover:bg-secondary/5"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="grid size-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition-colors group-hover:border-secondary/40 group-hover:bg-secondary/10 group-hover:text-secondary">
                                                    {String(visibleStart + index).padStart(2, '0')}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-950">{cost.model}</p>
                                                    <p className="text-xs text-thirdary">Licencia #{cost.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {costColumns.map((column) => (
                                            <td key={column.key} className="px-6 py-5 align-middle">
                                                <CostAmount amount={cost[column.key]} currency={cost.currency} />
                                            </td>
                                        ))}

                                        <td className="px-6 py-5 text-center align-middle">
                                            <CostAmount amount={getCostTotal(cost)} currency={cost.currency} />
                                        </td>

                                        <td className="px-6 py-5 text-center align-middle">
                                            <BillingCycleBadge billingCycle={cost.billingCycle} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Mobile - Tarjetas */}
                    <div className="relative bg-slate-50/70 p-4 md:hidden">
                        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
                                    <CalendarClock className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-950">Costos de licencias</h3>
                                    <p className="text-xs text-thirdary">Mostrando {visibleStart}-{visibleEnd} de {filteredCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            {pageItems.map((cost) => (
                                <CostCard key={cost.id} cost={cost} />
                            ))}
                        </div>
                    </div>

                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        visiblePageNumbers={visiblePageNumbers}
                        onPageChange={goToPage}
                    />
                </>
            )}
        </section>

    )
}
