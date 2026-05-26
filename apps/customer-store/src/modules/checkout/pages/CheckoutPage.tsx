import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'

import type { RootState } from '@/app/store'
import { clearCartState } from '@/app/store'
import { Button } from '@/components/ui/button'
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
  const itemsByPlantId = useSelector((state: RootState) => state.cart.itemsByPlantId)
  const authSession = getStoredAuthSession()
  const isLoggedIn = Boolean(authSession?.user?.id)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [instructions, setInstructions] = useState('')

  const { data: plants = [] } = usePlantsCatalogQuery({})

  const cartItems = useMemo(() => {
    return Object.entries(itemsByPlantId)
      .map(([plantId, quantity]) => {
        const plant = plants.find((entry) => entry.id === plantId)
        if (!plant) {
          return null
        }

        return {
          plant,
          quantity,
        }
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
      if (!isLoggedIn) {
        setCustomerName('')
        setCustomerPhone('')
      }
      setInstructions('')
    },
  })

  const isCartEmpty = cartItems.length === 0

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <h1 className="mb-0">Checkout</h1>
        <p className="max-w-2xl text-muted-foreground">
          Confirma tus datos y envia el pedido al backend real.
        </p>

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
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Nombre</span>
                <input
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="h-11 w-full rounded-[var(--radius-pill)] border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium">Telefono</span>
                <input
                  required
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="h-11 w-full rounded-[var(--radius-pill)] border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                />
              </label>
            </>
          )}

          <p className="rounded-[var(--radius-md)] border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground">
            Tipo de pedido: Recogida
          </p>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Instrucciones (opcional)</span>
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              className="min-h-24 w-full rounded-[var(--radius-md)] border border-input bg-background px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            />
          </label>

          {createOrderMutation.isError ? (
            <p className="text-sm font-medium text-[color:var(--status-danger)]">
              No se pudo crear el pedido. Verifica sesion y datos obligatorios.
            </p>
          ) : null}

          {createOrderMutation.isSuccess ? (
            <p className="text-sm font-medium text-[color:var(--status-success)]">
              Pedido enviado correctamente.
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isCartEmpty || createOrderMutation.isPending}>
            {createOrderMutation.isPending ? 'Enviando...' : 'Confirmar pedido'}
          </Button>
        </form>
      </div>

      <aside className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-card p-5">
        <h2 className="mb-0 text-xl">Resumen</h2>
        {isCartEmpty ? (
          <p className="text-sm text-muted-foreground">Tu carrito esta vacio.</p>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.plant.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{item.plant.nameCommon}</p>
                  <p className="text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-semibold text-foreground">
                  {moneyFormatter.format(item.plant.priceCUP * item.quantity)}
                </p>
              </div>
            ))}

            <div className="border-t border-border pt-3">
              <p className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>Total</span>
                <span>{moneyFormatter.format(totalAmount)}</span>
              </p>
            </div>
          </div>
        )}
      </aside>
    </section>
  )
}
