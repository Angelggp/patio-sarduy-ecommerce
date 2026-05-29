import { useMemo, useState } from 'react'
import { Minus, Plus, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

import type { RootState } from '@/app/store'
import { decrementPlantQty, incrementPlantQty } from '@/app/store'
import { usePlantsCatalogQuery } from '@/modules/catalog/hooks/use-plants-catalog-query'

const moneyFormatter = new Intl.NumberFormat('es-CU', {
  style: 'currency',
  currency: 'CUP',
  maximumFractionDigits: 0,
})

type CategoryId =
  | 'all'
  | 'TREE'
  | 'SHRUB'
  | 'HERB'
  | 'CLIMBER'
  | 'SUCCULENT'
  | 'PALM'
  | 'culinary'
  | 'medicinal'
  | 'aromatic'

const CATEGORY_PILLS: { id: CategoryId; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'TREE', label: 'Árbol' },
  { id: 'SHRUB', label: 'Arbusto' },
  { id: 'HERB', label: 'Hierba' },
  { id: 'CLIMBER', label: 'Trepadora' },
  { id: 'SUCCULENT', label: 'Suculenta' },
  { id: 'PALM', label: 'Palma' },
  { id: 'culinary', label: 'Culinaria' },
  { id: 'medicinal', label: 'Medicinal' },
  { id: 'aromatic', label: 'Aromática' },
]

const GROWTH_FORM_IDS: readonly string[] = ['TREE', 'SHRUB', 'HERB', 'CLIMBER', 'SUCCULENT', 'PALM']
const USE_FILTER_IDS: readonly string[] = ['culinary', 'medicinal', 'aromatic']

export function PlantsCatalogPage() {
  const dispatch = useDispatch()
  const itemsByPlantId = useSelector((state: RootState) => state.cart.itemsByPlantId)

  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [selectedUse, setSelectedUse] = useState('Todos')

  const growthForm = GROWTH_FORM_IDS.includes(selectedCategory)
    ? (selectedCategory as 'TREE' | 'SHRUB' | 'HERB' | 'CLIMBER' | 'SUCCULENT' | 'PALM')
    : ('Todas' as const)

  const useFilter = USE_FILTER_IDS.includes(selectedCategory)
    ? (selectedCategory as 'culinary' | 'medicinal' | 'aromatic')
    : undefined

  const { data, isLoading, isFetching, error } = usePlantsCatalogQuery({
    q,
    growthForm,
    useFilter,
  })
  const plants = data?.plants ?? []
  const totalInDb = data?.total ?? 0

  const useOptions = useMemo(() => ['Todos', ...new Set(plants.flatMap((plant) => plant.uses))], [plants])

  const filteredPlants = useMemo(() => {
    const normalizedSearch = q.trim().toLowerCase()

    return plants.filter((plant) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        plant.nameCommon.toLowerCase().includes(normalizedSearch) ||
        plant.scientificName.toLowerCase().includes(normalizedSearch)
      const matchesUse = selectedUse === 'Todos' || plant.uses.includes(selectedUse)

      return matchesSearch && matchesUse
    })
  }, [plants, q, selectedUse])

  const cardDelayStep = 90

  return (
    <section className="pb-8">
      {/* ── Sticky: buscador + categorías ── */}
      <div className="sticky top-0 z-30 -mx-4 space-y-3 bg-background/95 px-4 pb-3 pt-4 backdrop-blur-sm lg:-mx-8 lg:top-[52px] lg:px-8">
        {/* Buscador */}
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-[var(--shadow-soft)]">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setSearchParams(
                (prev) => {
                  if (e.target.value) prev.set('q', e.target.value)
                  else prev.delete('q')
                  return prev
                },
                { replace: true },
              )
            }}
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

        {/* Filtros por categoría */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_PILLS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-foreground text-background'
                    : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowMoreFilters((v) => !v)}
            className={`shrink-0 rounded-full border p-2.5 transition-colors ${
              showMoreFilters || selectedUse !== 'Todos'
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
            title="Más filtros"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        {/* Panel de filtros extra */}
        <AnimatePresence>
          {showMoreFilters && (
          <motion.div
            key="more-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Tag de uso
              </p>
              <div className="flex flex-wrap gap-2">
                {useOptions.map((use) => (
                  <button
                    key={use}
                    onClick={() => setSelectedUse(use)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedUse === use
                        ? 'bg-foreground text-background'
                        : 'border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {use}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>{/* fin sticky */}

      {/* ── Conteo ── */}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{filteredPlants.length} planta{filteredPlants.length !== 1 ? 's' : ''}</span>
        {!isLoading && totalInDb > 0 && (
          <span className="text-muted-foreground/60">· {totalInDb} en total</span>
        )}
        {isFetching && <span>· Actualizando...</span>}
      </div>

      {error ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--status-danger)]/40 bg-card px-5 py-4 text-sm text-[color:var(--status-danger)]">
          No se pudo consultar productos del backend. Verifica API, token o CORS.
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-card px-5 py-9 text-center text-sm text-muted-foreground">
          No encontramos plantas con esos filtros. Ajusta tu busqueda para ver mas opciones.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlants.map((plant, index) => {
            const quantityInCart = itemsByPlantId[plant.id] ?? 0

            return (
              <article
                key={plant.id}
                className="catalog-card group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]"
                style={{ animationDelay: `${index * cardDelayStep}ms` }}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={plant.imageUrl}
                    alt={plant.nameCommon}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,39,21,0)_38%,rgba(8,39,21,0.6)_100%)]" />
                  <div className="absolute bottom-3 left-3 rounded-[var(--radius-pill)] bg-[color:var(--bg-deep-forest)]/85 px-3 py-1 text-xs font-semibold text-[color:var(--text-on-dark)]">
                    {plant.growthForm}
                  </div>
                </div>

                <div className="space-y-4 px-4 pb-4 pt-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {plant.scientificName}
                    </p>
                    <h2 className="mb-0 text-[22px] leading-[1.1]">{plant.nameCommon}</h2>
                    <p className="text-sm font-semibold text-foreground">
                      {moneyFormatter.format(plant.priceCUP)}
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

                  {plant.stock === 0 ? (
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center rounded-full py-2.5 text-sm font-semibold opacity-50 bg-secondary text-muted-foreground"
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
