import { AlertTriangle, CheckCheck, CreditCard, MapPinned, Phone, User2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdvanceOrderMutation } from '@/modules/orders/hooks/useAdvanceOrderMutation'
import { useOrdersQuery } from '@/modules/orders/hooks/useOrdersQuery'
import { type Order } from '@/modules/orders/types/orders.types'

function currency(value: number): string {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    maximumFractionDigits: 2,
  }).format(value)
}

function PaymentOrderCard({
  order,
  isSubmitting,
  onMarkDelivered,
}: {
  order: Order
  isSubmitting: boolean
  onMarkDelivered: () => void
}) {
  const totalAmount = order.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)

  return (
    <article className='rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-(--shadow-soft)'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)'>Pedido #{order.id}</p>
          <p className='mt-1 inline-flex items-center gap-2 rounded-(--radius-pill) bg-(--brand-primary-soft) px-3 py-1 text-xs font-semibold text-(--bg-deep-forest)'>
            <CreditCard size={14} />
            Listo para pago
          </p>
        </div>
      </div>

      <div className='mt-3 space-y-2 text-sm text-(--text-body)'>
        <p className='flex items-center gap-2'>
          <User2 size={14} />
          {order.customerName}
        </p>
        <p className='flex items-center gap-2'>
          <Phone size={14} />
          {order.customerPhone}
        </p>
      </div>

      {order.deliveryDetails ? (
        <div className='mt-3 rounded-(--radius-sm) border border-(--border-soft) bg-(--bg-canvas) p-3 text-sm text-(--text-body)'>
          <p className='mb-1 flex items-center gap-2 font-semibold text-(--text-strong)'>
            <MapPinned size={14} />
            Entrega
          </p>
          <p>{order.deliveryDetails.address}</p>
          <p>Zona: {order.deliveryDetails.zone}</p>
          {order.deliveryDetails.instructions ? <p>Notas: {order.deliveryDetails.instructions}</p> : null}
        </div>
      ) : null}

      <div className='mt-3 rounded-(--radius-sm) border border-(--border-soft) p-3'>
        <p className='mb-2 text-sm font-semibold text-(--text-strong)'>Detalle de cobro</p>
        <ul className='space-y-1 text-sm text-(--text-body)'>
          {order.items.map((item) => {
            const itemSubtotal = Number(item.price) * item.quantity
            return (
              <li key={item.id} className='flex items-center justify-between gap-3'>
                <span>
                  {item.quantity} x {item.product?.commonName ?? `Producto #${item.productId}`}
                </span>
                <span className='font-medium text-(--text-strong)'>{currency(itemSubtotal)}</span>
              </li>
            )
          })}
        </ul>
        <p className='mt-3 border-t border-(--border-soft) pt-2 text-sm font-semibold text-(--text-strong)'>
          Total a pagar: {currency(totalAmount)}
        </p>
      </div>

      <Button className='mt-4 w-full' onClick={onMarkDelivered} disabled={isSubmitting}>
        {isSubmitting ? 'Actualizando...' : 'Marcar como entregado'}
      </Button>
    </article>
  )
}

export function PaymentsPage() {
  const readyOrdersQuery = useOrdersQuery({
    page: 1,
    pageSize: 100,
    statuses: ['READY'],
  })
  const advanceMutation = useAdvanceOrderMutation()

  return (
    <section className='space-y-6'>
      <header className='rounded-(--radius-lg) border border-(--border-soft) bg-(--bg-canvas) p-5'>
        <h2 className='font-heading text-3xl font-semibold text-(--text-strong)'>Pagos</h2>
        <p className='mt-1 text-sm text-(--text-body)'>
          Pedidos listos para cobro. Una vez procesados, pueden pasar a entregado.
        </p>
      </header>

      {readyOrdersQuery.isLoading ? (
        <div className='rounded-(--radius-md) border border-dashed border-(--border-subtle) bg-(--bg-surface) p-4 text-sm text-(--text-muted)'>
          Cargando pedidos listos...
        </div>
      ) : null}

      {readyOrdersQuery.isError ? (
        <div className='flex items-center gap-2 rounded-(--radius-sm) border border-(--status-danger)/30 bg-(--status-danger)/10 px-4 py-3 text-sm text-(--text-strong)'>
          <AlertTriangle size={16} />
          <span>No se pudieron cargar los pedidos listos.</span>
        </div>
      ) : null}

      {advanceMutation.isError ? (
        <div className='flex items-center gap-2 rounded-(--radius-sm) border border-(--status-danger)/30 bg-(--status-danger)/10 px-4 py-3 text-sm text-(--text-strong)'>
          <AlertTriangle size={16} />
          <span>
            {advanceMutation.error instanceof Error
              ? advanceMutation.error.message
              : 'No se pudo marcar el pedido como entregado.'}
          </span>
        </div>
      ) : null}

      {!readyOrdersQuery.isLoading && !readyOrdersQuery.data?.results.length ? (
        <div className='rounded-(--radius-md) border border-(--border-soft) bg-(--bg-canvas) p-5 text-sm text-(--text-muted)'>
          No hay pedidos listos para cobro.
        </div>
      ) : null}

      <div className='grid gap-3 md:grid-cols-2'>
        {readyOrdersQuery.data?.results.map((order) => (
          <PaymentOrderCard
            key={order.id}
            order={order}
            isSubmitting={advanceMutation.isPending && advanceMutation.variables === order.id}
            onMarkDelivered={() => {
              advanceMutation.mutate(order.id)
            }}
          />
        ))}
      </div>

      <div className='rounded-(--radius-sm) border border-(--border-soft) bg-(--bg-canvas) px-4 py-3 text-sm text-(--text-body)'>
        <p className='flex items-center gap-2'>
          <CheckCheck size={16} className='text-(--status-success)' />
          Al marcar como entregado, el pedido sale de esta lista automaticamente.
        </p>
      </div>
    </section>
  )
}
