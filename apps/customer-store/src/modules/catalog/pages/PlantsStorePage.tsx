import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

import type { RootState } from '@/app/store'
import { decrementPlantQty, incrementPlantQty } from '@/app/store'
import { usePlantsCatalogQuery } from '@/modules/catalog/hooks/use-plants-catalog-query'
import type { GrowthFormKey } from '@/modules/catalog/types/plant'

const moneyFormatter = new Intl.NumberFormat('es-CU', {
  style: 'currency',
  currency: 'CUP',
  maximumFractionDigits: 0,
})

type UseFilterId = 'culinary' | 'medicinal' | 'aromatic'

const GROWTH_GROUPS: { key: GrowthFormKey; label: string }[] = [
  { key: 'TREE', label: 'Árbol' },
  { key: 'SHRUB', label: 'Arbustivo' },
  { key: 'HERB', label: 'Herbásea' },
  { key: 'CLIMBER', label: 'Trepadora' },
  { key: 'LIANA', label: 'Liana' },
]

const USE_PILLS: { id: UseFilterId; label: string }[] = [
  { id: 'culinary', label: 'Culinaria' },
  { id: 'medicinal', label: 'Medicinal' },
  { id: 'aromatic', label: 'Aromática' },
]

export function PlantsStorePage() {
  const dispatch = useDispatch()
  const itemsByPlantId = useSelector((state: RootState) => state.cart.itemsByPlantId)

  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [activeGroup, setActiveGroup] = useState<GrowthFormKey | null>(null)
  const [activeUse, setActiveUse] = useState<UseFilterId | null>(null)
  const [showUsePanel, setShowUsePanel] = useState(false)

  const { data, isLoading, isFetching, error } = usePlantsCatalogQuery({
    q,
    useFilter: activeUse ?? undefined,
    hasPrice: true,
  })

  const allPlants = data?.plants ?? []

  const filteredPlants = useMemo(() => {
    const norm = q.trim().toLowerCase()
    const base = allPlants.filter((p) => {
      const matchesSearch =
        norm.length === 0 ||
        p.nameCommon.toLowerCase().includes(norm) ||
        p.scientificName.toLowerCase().includes(norm)
      const matchesGroup = activeGroup === null || p.growthFormKey === activeGroup
      return matchesSearch && matchesGroup
    })
    return [...base].sort((a, b) => {
      const aOut = a.stock === 0
      const bOut = b.stock === 0
      if (aOut === bOut) return 0
      return aOut ? 1 : -1
    })
  }, [allPlants, q, activeGroup])

  return (
    <section className="pb-8">
      {/* Sticky: buscador + categorías */}
      <div className="sticky top-0 z-30 -mx-4 space-y-3 bg-background/95 px-4 pb-3 pt-4 backdrop-blur-sm lg:-mx-8 lg:top-[52px] lg:px-8">
        {/* Buscador */}
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-[var(--shadow-soft)]">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) =>
              setSearchParams(
                (prev) => {
                  if (e.target.value) prev.set('q', e.target.value)
                  else prev.delete('q')
                  return prev
                },
                { replace: true },
              )
            }
            placeholder="Buscar por nombre común o científico..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              onClick={() =>
                setSearchParams((prev) => { prev.delete('q'); return prev }, { replace: true })
              }
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Categorías + botón de uso */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveGroup(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeGroup === null
                  ? 'bg-foreground text-background'
                  : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Todas
            </button>
            {GROWTH_GROUPS.map((g) => (
              <button
                key={g.key}
                onClick={() => setActiveGroup(activeGroup === g.key ? null : g.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeGroup === g.key
                    ? 'bg-foreground text-background'
                    : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Icono de filtros por uso */}
          <button
            onClick={() => setShowUsePanel((v) => !v)}
            className={`shrink-0 rounded-full border p-2.5 transition-colors ${
              showUsePanel || activeUse !== null
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
            title="Filtrar por uso"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        {/* Panel desplegable de filtros por uso */}
        <AnimatePresence>
          {showUsePanel && (
            <motion.div
              key="use-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Filtrar por uso
                </p>
                <div className="flex flex-wrap gap-2">
                  {([{ id: null, label: 'Todos' }, ...USE_PILLS] as { id: UseFilterId | null; label: string }[]).map((p) => (
                    <button
                      key={p.id ?? 'all'}
                      onClick={() => setActiveUse(p.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeUse === p.id
                          ? 'bg-foreground text-background'
                          : 'border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conteo */}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {filteredPlants.length} planta{filteredPlants.length !== 1 ? 's' : ''} en venta
        </span>
        {isFetching && <span className="text-muted-foreground/60">· Actualizando...</span>}
      </div>

      {error && (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--status-danger)]/40 bg-card px-5 py-4 text-sm text-[color:var(--status-danger)]">
          No se pudo consultar la tienda. Verifica la conexión con el servidor.
        </div>
      )}

      {isLoading ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]"
            >
              <div className="h-52 animate-pulse bg-secondary" />
              <div className="space-y-4 px-4 pb-4 pt-3">
                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-secondary" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-4 w-14 animate-pulse rounded-full bg-secondary" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-secondary" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-secondary" />
                </div>
                <div className="h-10 w-full animate-pulse rounded-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-border bg-card px-5 py-9 text-center text-sm text-muted-foreground">
          No encontramos plantas en venta con esos filtros. Ajusta tu búsqueda para ver más opciones.
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlants.map((plant, index) => {
            const quantityInCart = itemsByPlantId[plant.id] ?? 0
            const isOutOfStock = plant.stock === 0

            return (
              <article
                key={plant.id}
                className={`catalog-card group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)] transition-opacity ${
                  isOutOfStock ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={plant.imageUrl}
                    alt={plant.nameCommon}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,39,21,0)_38%,rgba(8,39,21,0.6)_100%)]" />

                  {/* Badge: forma de crecimiento */}
                  <div className="absolute bottom-3 left-3 rounded-[var(--radius-pill)] bg-[color:var(--bg-deep-forest)]/85 px-3 py-1 text-xs font-semibold text-[color:var(--text-on-dark)]">
                    {plant.growthFormLabel}
                  </div>

                  {/* Badge: Agotado */}
                  {isOutOfStock && (
                    <div className="absolute right-3 top-3 rounded-[var(--radius-pill)] bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      Agotado
                    </div>
                  )}
                </div>

                <div className="space-y-4 px-4 pb-4 pt-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {plant.scientificName}
                    </p>
                    <h2 className="mb-0 text-[22px] leading-[1.1]">{plant.nameCommon}</h2>
                    <p className="text-sm font-semibold text-foreground">
                      {plant.priceCUP != null ? moneyFormatter.format(plant.priceCUP) : '—'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {plant.uses.map((useTag) => (
                      <span
                        key={useTag}
                        className="rounded-[var(--radius-pill)] border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {useTag}
                      </span>
                    ))}
                  </div>

                  {isOutOfStock ? (
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-secondary py-2.5 text-sm font-semibold text-muted-foreground opacity-50"
                    >
                      Sin stock
                    </button>
                  ) : quantityInCart === 0 ? (
                    <button
                      type="button"
                      onClick={() => dispatch(incrementPlantQty(plant.id))}
                      className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: 'var(--bg-deep-forest)', color: 'var(--text-on-dark)' }}
                    >
                      <ShoppingBag className="size-4" />
                      Agregar al carrito
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-full border border-border bg-card px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => dispatch(decrementPlantQty(plant.id))}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={`Disminuir cantidad de ${plant.nameCommon}`}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-foreground">
                        {quantityInCart} en carrito
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch(incrementPlantQty(plant.id))}
                        disabled={plant.stock !== null && quantityInCart >= plant.stock}
                        className="flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ backgroundColor: 'var(--bg-deep-forest)', color: 'var(--text-on-dark)' }}
                        aria-label={`Aumentar cantidad de ${plant.nameCommon}`}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
