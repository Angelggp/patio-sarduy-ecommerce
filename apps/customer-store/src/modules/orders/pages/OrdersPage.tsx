import { Ban, LockKeyhole, Loader2, ReceiptText, TriangleAlert, X } from 'lucide-react'
import { useState } from 'react'

import { getStoredAuthSession } from '@/modules/auth/utils/auth-storage'
import { useCancelOrderMutation } from '@/modules/orders/hooks/use-cancel-order-mutation'
import { useOrdersQuery } from '@/modules/orders/hooks/use-orders-query'

const moneyFormatter = new Intl.NumberFormat('es-CU', {
  style: 'currency',
  currency: 'CUP',
  maximumFractionDigits: 0,
})

export function OrdersPage() {
  const authSession = getStoredAuthSession()
  const { data, isLoading, isError } = useOrdersQuery(Boolean(authSession))
  const cancelMutation = useCancelOrderMutation()
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null)

  const handleConfirmCancel = async () => {
    if (confirmingOrderId === null) return
    await cancelMutation.mutateAsync(confirmingOrderId)
    setConfirmingOrderId(null)
  }

  if (!authSession) {
    return (
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-[linear-gradient(120deg,#0a2816_0%,#11361f_46%,#1c4f2d_100%)] p-7 text-[color:var(--text-on-dark)] shadow-[var(--shadow-float)] lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(182,243,202,0.45)_0%,rgba(182,243,202,0)_72%)]" />
          <div className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_72%)]" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              <LockKeyhole className="size-3.5" />
              Zona privada
            </div>

            <h1 className="mb-0 text-[clamp(2rem,4vw,3.3rem)] leading-[0.95] text-white]">
              Debes loguearte para ver tus pedidos
            </h1>

            <p className="max-w-2xl text-sm text-white/85 lg:text-base">
              Esta pestaña muestra el historial personal de compras y su estado en tiempo real.
              Inicia sesion para consultar tus pedidos.
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-secondary-foreground">
            <ReceiptText className="size-3.5" />
            Seguimiento de pedidos
          </div>
          <p className="text-sm text-muted-foreground">
            Cuando tengas sesion activa, aqui veras numero de pedido, estado, articulos y total.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h1 className="mb-0">Mis pedidos</h1>
      <p className="max-w-2xl text-muted-foreground">
        Historial de pedidos consumido desde el backend real.
      </p>

      {/* Modal de confirmación de cancelación */}
      {confirmingOrderId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-[var(--shadow-float)]">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--status-danger)]/10">
                <TriangleAlert className="size-5 text-[color:var(--status-danger)]" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  Cancelar pedido #{confirmingOrderId}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Esta accion no se puede deshacer. El pedido quedara cancelado y el stock sera repuesto.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingOrderId(null)}
                disabled={cancelMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
              >
                <X className="size-3.5" />
                No, mantener
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--status-danger)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Ban className="size-3.5" />
                )}
                {cancelMutation.isPending ? 'Cancelando...' : 'Sí, cancelar pedido'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6 text-sm text-muted-foreground">
          Cargando pedidos...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--status-danger)]/40 bg-card p-6 text-sm text-[color:var(--status-danger)]">
          No se pudieron cargar los pedidos. Verifica sesion y backend.
        </div>
      ) : null}

      {data && data.results.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Aun no hay pedidos registrados.</p>
        </div>
      ) : null}

      {data && data.results.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((order) => {
            const totalAmount = order.items.reduce(
              (acc, item) => acc + Number(item.price) * item.quantity,
              0,
            )

            const canCancel = order.status === 'PENDING' || order.status === 'IN_PROGRESS'

            return (
              <article
                key={order.id}
                className="rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Pedido #{order.id}</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-[var(--radius-pill)] bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      {order.status}
                    </span>
                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => setConfirmingOrderId(order.id)}
                        disabled={cancelMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[color:var(--status-danger)] bg-transparent px-3 py-1 text-xs font-semibold text-[color:var(--status-danger)] transition hover:bg-[color:var(--status-danger)] hover:text-white disabled:opacity-50"
                      >
                        <Ban className="size-3" />
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="mb-3 text-sm text-muted-foreground">
                  {order.customerName} · {order.customerPhone} · {order.type}
                </p>

                <div className="space-y-2 border-t border-border pt-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {item.product?.commonName ?? `Producto ${item.productId}`} x{item.quantity}
                      </span>
                      <span className="font-medium text-foreground">
                        {moneyFormatter.format(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-right text-sm font-semibold text-foreground">
                  Total: {moneyFormatter.format(totalAmount)}
                </p>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
