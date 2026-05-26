import { LockKeyhole, ReceiptText } from 'lucide-react'

import { getStoredAuthSession } from '@/modules/auth/utils/auth-storage'
import { useOrdersQuery } from '@/modules/orders/hooks/use-orders-query'

const moneyFormatter = new Intl.NumberFormat('es-CU', {
  style: 'currency',
  currency: 'CUP',
  maximumFractionDigits: 0,
})

export function OrdersPage() {
  const authSession = getStoredAuthSession()
  const { data, isLoading, isError } = useOrdersQuery(Boolean(authSession))

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

            <h1 className="mb-0 text-[clamp(2rem,4vw,3.3rem)] leading-[0.95] text-[color:var(--text-on-dark)]">
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

            return (
              <article
                key={order.id}
                className="rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Pedido #{order.id}</p>
                  <span className="rounded-[var(--radius-pill)] bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {order.status}
                  </span>
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
