import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Check, Minus, Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'

import type { RootState } from '@/app/store'
import { clearCartState, decrementPlantQty, incrementPlantQty, setPlantQty } from '@/app/store'
import { getStoredAuthSession } from '@/modules/auth/utils/auth-storage'
import { usePlantsCatalogQuery } from '@/modules/catalog/hooks/use-plants-catalog-query'
import { ordersService } from '@/modules/orders/services/orders.service'

const moneyFormatter = new Intl.NumberFormat('es-CU', {
  style: 'currency',
  currency: 'CUP',
  maximumFractionDigits: 0,
})

export function CheckoutPage() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const itemsByPlantId = useSelector((state: RootState) => state.cart.itemsByPlantId)
  const authSession = getStoredAuthSession()
  const isLoggedIn = Boolean(authSession?.user?.id)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [instructions, setInstructions] = useState('')

  const { data: catalogData } = usePlantsCatalogQuery({})
  const plants = catalogData?.plants ?? []

  const cartItems = useMemo(() => {
    return Object.entries(itemsByPlantId)
      .map(([plantId, quantity]) => {
        const plant = plants.find((entry) => entry.id === plantId)
        if (!plant) return null
        return { plant, quantity }
      })
      .filter((entry): entry is { plant: (typeof plants)[number]; quantity: number } => entry !== null)
  }, [itemsByPlantId, plants])

  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.plant.priceCUP * item.quantity, 0)
  }, [cartItems])

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      await ordersService.createOne({
        userId: isLoggedIn ? authSession?.user.id : undefined,
        type: 'PICKUP',
        customerName: isLoggedIn ? undefined : customerName,
        customerPhone: isLoggedIn ? undefined : customerPhone,
        instructions: instructions || undefined,
        items: Object.entries(itemsByPlantId).map(([plantId, quantity]) => ({
          productId: Number(plantId),
          quantity,
        })),
      })
    },
    onSuccess: () => {
      dispatch(clearCartState())
      void queryClient.invalidateQueries({ queryKey: ['customer-orders'] })
      if (!isLoggedIn) {
        setCustomerName('')
        setCustomerPhone('')
      }
      setInstructions('')
    },
  })

  const isCartEmpty = cartItems.length === 0

  if (createOrderMutation.isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto flex max-w-sm flex-col items-center gap-6 py-16 text-center"
      >
        {/* Círculo con check */}
        <div
          className="flex size-20 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--bg-deep-forest)' }}
        >
          <Check className="size-9" style={{ color: 'var(--text-on-dark)' }} strokeWidth={2.5} />
        </div>

        <div className="space-y-2">
          <h1 className="mb-0 text-2xl">Pedido confirmado</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tu pedido fue recibido. Puedes revisar su estado en la
            sección de pedidos en cualquier momento.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <Link
            to="/pedidos"
            className="flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--bg-deep-forest)', color: 'var(--text-on-dark)' }}
          >
            Ver mis pedidos
          </Link>
          <Link
            to="/plantas"
            className="flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Seguir comprando
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_400px]">
      {/* Formulario — izquierda en desktop */}
      <div className="space-y-4">
        <div>
          <h1 className="mb-1">Tu pedido</h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos y confirma para enviar tu pedido.
          </p>
        </div>

        <form
          className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-card p-5"
          onSubmit={(event) => {
            event.preventDefault()
            createOrderMutation.mutate()
          }}
        >
          {isLoggedIn ? (
            <p className="rounded-[var(--radius-md)] border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground">
              Pedido asociado a la cuenta: {authSession?.user.name}
            </p>
          ) : (
            <>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Nombre</span>
                <input
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Tu nombre completo"
                  className="h-11 w-full rounded-[var(--radius-pill)] border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Teléfono</span>
                <input
                  required
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="Número de contacto"
                  className="h-11 w-full rounded-[var(--radius-pill)] border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                />
              </label>
            </>
          )}

          <div className="rounded-[var(--radius-md)] border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground">
            Tipo: Recogida en tienda
          </div>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">
              Instrucciones{' '}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </span>
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Ej. tamaño preferido, variedad, etc."
              className="min-h-[88px] w-full resize-none rounded-[var(--radius-md)] border border-input bg-background px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            />
          </label>

          {createOrderMutation.isError ? (
            <p className="text-sm font-medium text-[color:var(--status-danger)]">
              No se pudo crear el pedido. Verifica sesión y datos obligatorios.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isCartEmpty || createOrderMutation.isPending}
            className="flex w-full items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-deep-forest)', color: 'var(--text-on-dark)' }}
          >
            {createOrderMutation.isPending ? 'Enviando...' : 'Confirmar pedido'}
          </button>
        </form>
      </div>

      {/* Resumen del carrito — derecha en desktop, arriba en mobile */}
      <aside className="order-first space-y-3 lg:order-last">
        <h2 className="mb-0 text-base font-semibold text-foreground">Resumen del carrito</h2>

        {isCartEmpty ? (
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-card px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
            <Link to="/plantas" className="text-sm font-medium text-primary hover:underline">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
            <ul className="divide-y divide-border">
              {cartItems.map((item) => {
                const atStockLimit =
                  item.plant.stock !== null && item.quantity >= item.plant.stock

                return (
                  <li key={item.plant.id} className="flex items-start gap-3 p-3 sm:p-4">
                    {/* Imagen */}
                    <img
                      src={item.plant.imageUrl}
                      alt={item.plant.nameCommon}
                      className="size-12 flex-shrink-0 rounded-[var(--radius-md)] object-cover sm:size-14"
                    />

                    {/* Info + controles */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        {item.plant.scientificName}
                      </p>
                      <p className="truncate text-sm font-semibold leading-tight">{item.plant.nameCommon}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {moneyFormatter.format(item.plant.priceCUP)} c/u
                      </p>

                      {/* Stepper + subtotal en la misma fila */}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => dispatch(decrementPlantQty(item.plant.id))}
                            className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            aria-label={`Disminuir cantidad de ${item.plant.nameCommon}`}
                          >
                            <Minus className="size-3" />
                          </button>

                          <span className="w-5 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => dispatch(incrementPlantQty(item.plant.id))}
                            disabled={atStockLimit}
                            className="flex size-7 items-center justify-center rounded-full transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ backgroundColor: 'var(--bg-deep-forest)', color: 'var(--text-on-dark)' }}
                            aria-label={`Aumentar cantidad de ${item.plant.nameCommon}`}
                          >
                            <Plus className="size-3" />
                          </button>

                          {atStockLimit ? (
                            <span className="text-[10px] text-muted-foreground">
                              máx. {item.plant.stock}
                            </span>
                          ) : null}
                        </div>

                        {/* Subtotal */}
                        <p className="flex-shrink-0 text-sm font-semibold">
                          {moneyFormatter.format(item.plant.priceCUP * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(setPlantQty({ plantId: item.plant.id, quantity: 0 }))
                      }
                      className="mt-0.5 flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Eliminar ${item.plant.nameCommon}`}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Total estimado</span>
              <span className="text-base font-bold">{moneyFormatter.format(totalAmount)}</span>
            </div>
          </div>
        )}
      </aside>
    </section>
  )
}
