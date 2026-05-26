import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, CheckCircle2, Filter } from 'lucide-react'

import { useOrdersQuery } from '@/modules/orders/hooks/useOrdersQuery'
import { type Order, type OrderStatus } from '@/modules/orders/types/orders.types'

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']

const statusLabelMap: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En preparacion',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const typeLabelMap = {
  DELIVERY: 'Entrega',
  PICKUP: 'Recogida',
}

function currency(value: number): string {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    maximumFractionDigits: 2,
  }).format(value)
}

function toLocalDateKey(dateLike: string | Date): string {
  const date = new Date(dateLike)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDateHeader(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('es-CU', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(dateLike: string | Date): string {
  const date = new Date(dateLike)

  return new Intl.DateTimeFormat('es-CU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function OrderHistoryCard({ order }: { order: Order }) {
  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0)
  const totalAmount = order.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)

  return (
    <article className='rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-(--shadow-soft)'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)'>Pedido #{order.id}</p>
          <p className='mt-1 text-sm font-semibold text-(--text-strong)'>{statusLabelMap[order.status]}</p>
        </div>
        <span className='rounded-(--radius-pill) bg-(--bg-soft-mint) px-3 py-1 text-xs font-semibold text-(--text-strong)'>
          {typeLabelMap[order.type]}
        </span>
      </div>

      <div className='mt-3 space-y-1 text-sm text-(--text-body)'>
        <p className='font-semibold text-(--text-strong)'>{order.customerName}</p>
        <p>{order.customerPhone}</p>
        <p className='text-(--text-muted)'>Creado: {formatDateTime(order.createdAt)}</p>
      </div>

      <div className='mt-3 rounded-(--radius-sm) border border-(--border-soft) p-3 text-sm'>
        <p className='text-(--text-body)'>Productos: {itemCount}</p>
        <p className='font-semibold text-(--text-strong)'>Total: {currency(totalAmount)}</p>
      </div>
    </article>
  )
}

export function OrdersHistoryPage() {
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>(ALL_STATUSES)

  const statusFilter =
    selectedStatuses.length === ALL_STATUSES.length || selectedStatuses.length === 0
      ? undefined
      : selectedStatuses

  const historyQuery = useOrdersQuery({
    page: 1,
    pageSize: 100,
    statuses: statusFilter,
  })

  const groupedOrders = useMemo(() => {
    const groups = new Map<string, Order[]>()

    for (const order of historyQuery.data?.results ?? []) {
      const key = toLocalDateKey(order.createdAt)
      const currentGroup = groups.get(key) ?? []
      currentGroup.push(order)
      groups.set(key, currentGroup)
    }

    return Array.from(groups.entries()).sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
  }, [historyQuery.data?.results])

  function toggleStatus(status: OrderStatus) {
    setSelectedStatuses((previous) => {
      if (previous.includes(status)) {
        if (previous.length === 1) {
          return previous
        }

        return previous.filter((value) => value !== status)
      }

      return [...previous, status]
    })
  }

  function enableAllStatuses() {
    setSelectedStatuses(ALL_STATUSES)
  }

  return (
    <section className='space-y-6'>
      <header className='rounded-(--radius-lg) border border-(--border-soft) bg-(--bg-canvas) p-5'>
        <h2 className='font-heading text-3xl font-semibold text-(--text-strong)'>Historial de pedidos</h2>
        <p className='mt-1 text-sm text-(--text-body)'>
          Consulta todos los pedidos organizados por fecha y filtra por estado.
        </p>
      </header>

      <section className='rounded-(--radius-lg) border border-(--border-subtle) bg-(--bg-surface) p-4'>
        <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-(--text-strong)'>
          <Filter size={14} />
          <span>Filtrar por estado</span>
        </div>

        <div className='flex flex-wrap gap-2'>
          {ALL_STATUSES.map((status) => {
            const isActive = selectedStatuses.includes(status)

            return (
              <button
                key={status}
                type='button'
                onClick={() => {
                  toggleStatus(status)
                }}
                className={[
                  'rounded-(--radius-pill) border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors',
                  isActive
                    ? 'border-(--brand-primary) bg-(--brand-primary-soft) text-(--bg-deep-forest)'
                    : 'border-(--border-subtle) bg-(--bg-canvas) text-(--text-muted) hover:text-(--text-strong)',
                ].join(' ')}
              >
                {statusLabelMap[status]}
              </button>
            )
          })}

          <button
            type='button'
            onClick={enableAllStatuses}
            className='rounded-(--radius-pill) border border-(--border-subtle) bg-(--bg-canvas) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-(--text-muted) transition-colors hover:text-(--text-strong)'
          >
            Mostrar todos
          </button>
        </div>
      </section>

      {historyQuery.isLoading ? (
        <div className='rounded-(--radius-md) border border-dashed border-(--border-subtle) bg-(--bg-surface) p-4 text-sm text-(--text-muted)'>
          Cargando historial de pedidos...
        </div>
      ) : null}

      {historyQuery.isError ? (
        <div className='flex items-center gap-2 rounded-(--radius-sm) border border-(--status-danger)/30 bg-(--status-danger)/10 px-4 py-3 text-sm text-(--text-strong)'>
          <AlertTriangle size={16} />
          <span>No se pudo cargar el historial de pedidos.</span>
        </div>
      ) : null}

      {!historyQuery.isLoading && !historyQuery.isError && groupedOrders.length === 0 ? (
        <div className='rounded-(--radius-md) border border-(--border-soft) bg-(--bg-canvas) p-5 text-sm text-(--text-muted)'>
          No hay pedidos para los filtros seleccionados.
        </div>
      ) : null}

      <div className='space-y-4'>
        {groupedOrders.map(([date, orders]) => (
          <section key={date} className='rounded-(--radius-lg) border border-(--border-subtle) bg-(--bg-canvas) p-4'>
            <header className='mb-4 flex items-center justify-between gap-3'>
              <h3 className='flex items-center gap-2 text-base font-semibold text-(--text-strong)'>
                <CalendarDays size={16} className='text-(--status-success)' />
                {formatDateHeader(date)}
              </h3>
              <span className='rounded-(--radius-pill) bg-(--bg-surface) px-3 py-1 text-xs font-semibold text-(--text-muted)'>
                {orders.length} pedidos
              </span>
            </header>

            <div className='grid gap-3 md:grid-cols-2'>
              {orders
                .slice()
                .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))
                .map((order) => (
                  <OrderHistoryCard key={order.id} order={order} />
                ))}
            </div>
          </section>
        ))}
      </div>

      <div className='rounded-(--radius-sm) border border-(--border-soft) bg-(--bg-canvas) px-4 py-3 text-sm text-(--text-body)'>
        <p className='flex items-center gap-2'>
          <CheckCircle2 size={16} className='text-(--status-success)' />
          Los pedidos se agrupan por la fecha de creacion y se muestran del mas reciente al mas antiguo.
        </p>
      </div>
    </section>
  )
}
