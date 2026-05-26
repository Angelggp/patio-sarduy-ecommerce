import { AlertTriangle, CheckCircle2, ChefHat, Clock3, Phone, ShoppingBasket, Trash2, User2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdvanceOrderMutation } from '@/modules/orders/hooks/useAdvanceOrderMutation'
import { useCancelOrderMutation } from '@/modules/orders/hooks/useCancelOrderMutation'
import { useOrdersQuery } from '@/modules/orders/hooks/useOrdersQuery'
import { type Order, type OrderStatus } from '@/modules/orders/types/orders.types'

const KANBAN_STATUSES: OrderStatus[] = ['PENDING', 'IN_PROGRESS']

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

function nextActionLabel(status: OrderStatus): string | null {
  if (status === 'PENDING') {
    return 'Pasar a preparacion'
  }

  if (status === 'IN_PROGRESS') {
    return 'Marcar como listo'
  }

  return null
}

function currency(value: number): string {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    maximumFractionDigits: 2,
  }).format(value)
}

function OrderCard({
  order,
  isAdvancing,
  isCancelling,
  onAdvance,
  onCancel,
}: {
  order: Order
  isAdvancing: boolean
  isCancelling: boolean
  onAdvance: () => void
  onCancel: () => void
}) {
  const actionLabel = nextActionLabel(order.status)
  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0)
  const totalAmount = order.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
  const disableActions = isAdvancing || isCancelling

  return (
    <article className='rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-(--shadow-soft)'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)'>
            Pedido #{order.id}
          </p>
          <p className='mt-1 text-sm font-semibold text-(--text-strong)'>
            {statusLabelMap[order.status]}
          </p>
        </div>
        <span className='rounded-(--radius-pill) bg-(--bg-soft-mint) px-3 py-1 text-xs font-semibold text-(--text-strong)'>
          {typeLabelMap[order.type]}
        </span>
      </div>

      <div className='space-y-2 text-sm text-(--text-body)'>
        <p className='flex items-center gap-2'>
          <User2 size={14} />
          <span>{order.customerName}</span>
        </p>
        <p className='flex items-center gap-2'>
          <Phone size={14} />
          <span>{order.customerPhone}</span>
        </p>
      </div>

      {order.deliveryDetails ? (
        <div className='mt-3 rounded-(--radius-sm) border border-(--border-soft) bg-(--bg-canvas) p-3 text-sm'>
          <p className='font-semibold text-(--text-strong)'>Direccion de entrega</p>
          <p className='text-(--text-body)'>{order.deliveryDetails.address}</p>
          <p className='text-(--text-body)'>Zona: {order.deliveryDetails.zone}</p>
          {order.deliveryDetails.instructions ? (
            <p className='text-(--text-muted)'>Notas: {order.deliveryDetails.instructions}</p>
          ) : null}
        </div>
      ) : null}

      <div className='mt-3 rounded-(--radius-sm) border border-(--border-soft) p-3'>
        <p className='mb-2 flex items-center gap-2 text-sm font-semibold text-(--text-strong)'>
          <ShoppingBasket size={14} />
          Productos ({itemCount})
        </p>
        <ul className='space-y-1 text-sm text-(--text-body)'>
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity} x {item.product?.commonName ?? `Producto #${item.productId}`}
            </li>
          ))}
        </ul>
        <p className='mt-2 text-sm font-semibold text-(--text-strong)'>Total: {currency(totalAmount)}</p>
      </div>

      <div className='mt-4 flex items-center gap-2'>
        {actionLabel ? (
          <Button className='flex-1' onClick={onAdvance} disabled={disableActions}>
            {isAdvancing ? 'Actualizando...' : actionLabel}
          </Button>
        ) : (
          <div className='flex-1' />
        )}

        <Button
          type='button'
          className='h-10 w-10 rounded-full bg-destructive p-0 text-[color:var(--text-on-dark)] hover:bg-[color:var(--status-danger)]/90'
          onClick={onCancel}
          disabled={disableActions}
          aria-label='Cancelar pedido'
          title='Cancelar pedido'
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </article>
  )
}

export function OrdersPage() {
  const ordersQuery = useOrdersQuery({
    page: 1,
    pageSize: 100,
    statuses: KANBAN_STATUSES,
  })
  const advanceMutation = useAdvanceOrderMutation()
  const cancelMutation = useCancelOrderMutation()

  const ordersByStatus = KANBAN_STATUSES.reduce<Record<OrderStatus, Order[]>>(
    (acc, status) => ({
      ...acc,
      [status]: ordersQuery.data?.results.filter((order) => order.status === status) ?? [],
    }),
    {
      PENDING: [],
      IN_PROGRESS: [],
      READY: [],
      DELIVERED: [],
      CANCELLED: [],
    },
  )

  return (
    <section className='space-y-6'>
      <header className='rounded-(--radius-lg) border border-(--border-soft) bg-(--bg-canvas) p-5'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='font-heading text-3xl font-semibold text-(--text-strong)'>Pedidos</h2>
            <p className='mt-1 text-sm text-(--text-body)'>
              Mueve cada orden por su flujo de elaboracion. Al marcarla como lista, saldra de este tablero y pasara
              a pagos.
            </p>
          </div>
          <div className='flex items-center gap-3 rounded-(--radius-pill) border border-(--border-subtle) bg-(--bg-surface) px-4 py-2 text-sm'>
            <Clock3 size={16} className='text-(--text-muted)' />
            <span className='font-semibold text-(--text-strong)'>
              Activas: {ordersQuery.data?.results.length ?? 0}
            </span>
          </div>
        </div>
      </header>

      {ordersQuery.isError ? (
        <div className='flex items-center gap-2 rounded-(--radius-sm) border border-(--status-danger)/30 bg-(--status-danger)/10 px-4 py-3 text-sm text-(--text-strong)'>
          <AlertTriangle size={16} />
          <span>No se pudieron cargar los pedidos.</span>
        </div>
      ) : null}

      {advanceMutation.isError ? (
        <div className='flex items-center gap-2 rounded-(--radius-sm) border border-(--status-danger)/30 bg-(--status-danger)/10 px-4 py-3 text-sm text-(--text-strong)'>
          <AlertTriangle size={16} />
          <span>
            {advanceMutation.error instanceof Error
              ? advanceMutation.error.message
              : 'No se pudo avanzar el estado del pedido.'}
          </span>
        </div>
      ) : null}

      {cancelMutation.isError ? (
        <div className='flex items-center gap-2 rounded-(--radius-sm) border border-(--status-danger)/30 bg-(--status-danger)/10 px-4 py-3 text-sm text-(--text-strong)'>
          <AlertTriangle size={16} />
          <span>
            {cancelMutation.error instanceof Error
              ? cancelMutation.error.message
              : 'No se pudo cancelar el pedido.'}
          </span>
        </div>
      ) : null}

      <div className='grid gap-4 xl:grid-cols-2'>
        {KANBAN_STATUSES.map((status) => {
          const columnOrders = ordersByStatus[status]

          return (
            <section
              key={status}
              className='rounded-(--radius-lg) border border-(--border-subtle) bg-(--bg-canvas) p-4'
            >
              <header className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  {status === 'PENDING' ? (
                    <Clock3 size={16} className='text-(--status-warning)' />
                  ) : (
                    <ChefHat size={16} className='text-(--status-success)' />
                  )}
                  <h3 className='text-base font-semibold text-(--text-strong)'>{statusLabelMap[status]}</h3>
                </div>
                <span className='rounded-(--radius-pill) bg-(--bg-surface) px-3 py-1 text-xs font-semibold text-(--text-muted)'>
                  {columnOrders.length}
                </span>
              </header>

              <div className='space-y-3'>
                {ordersQuery.isLoading ? (
                  <div className='rounded-(--radius-md) border border-dashed border-(--border-subtle) bg-(--bg-surface) p-4 text-sm text-(--text-muted)'>
                    Cargando pedidos...
                  </div>
                ) : null}

                {!ordersQuery.isLoading && columnOrders.length === 0 ? (
                  <div className='rounded-(--radius-md) border border-dashed border-(--border-subtle) bg-(--bg-surface) p-5 text-center text-sm text-(--text-muted)'>
                    <CheckCircle2 className='mx-auto mb-2' size={18} />
                    Sin pedidos en esta columna.
                  </div>
                ) : null}

                {columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isAdvancing={advanceMutation.isPending && advanceMutation.variables === order.id}
                    isCancelling={cancelMutation.isPending && cancelMutation.variables === order.id}
                    onAdvance={() => {
                      advanceMutation.mutate(order.id)
                    }}
                    onCancel={() => {
                      cancelMutation.mutate(order.id)
                    }}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
