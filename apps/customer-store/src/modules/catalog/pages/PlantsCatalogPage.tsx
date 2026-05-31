import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Search, SlidersHorizontal, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { usePlantsCatalogQuery } from '@/modules/catalog/hooks/use-plants-catalog-query'
import type { GrowthFormKey, Plant } from '@/modules/catalog/types/plant'

type UseFilterId = 'culinary' | 'medicinal' | 'aromatic'

const USE_PILLS: { id: UseFilterId; label: string }[] = [
  { id: 'culinary', label: 'Culinaria' },
  { id: 'medicinal', label: 'Medicinal' },
  { id: 'aromatic', label: 'Aromática' },
]

const GROWTH_GROUPS: { key: GrowthFormKey; label: string }[] = [
  { key: 'TREE', label: 'Árboles' },
  { key: 'SHRUB', label: 'Arbustos' },
  { key: 'HERB', label: 'Hierbas' },
  { key: 'CLIMBER', label: 'Trepadoras' },
  { key: 'SUCCULENT', label: 'Suculentas' },
  { key: 'PALM', label: 'Palmas' },
]

export function PlantsCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [activeUse, setActiveUse] = useState<UseFilterId | null>(null)
  const [activeGroup, setActiveGroup] = useState<GrowthFormKey | null>(null)
  const [showUsePanel, setShowUsePanel] = useState(false)

  const { data, isLoading, error } = usePlantsCatalogQuery({
    q,
    useFilter: activeUse ?? undefined,
  })

  const plants = data?.plants ?? []

  const filtered = useMemo(() => {
    const norm = q.trim().toLowerCase()
    if (!norm) return plants
    return plants.filter(
      (p) =>
        p.nameCommon.toLowerCase().includes(norm) ||
        p.scientificName.toLowerCase().includes(norm) ||
        p.family.toLowerCase().includes(norm) ||
        p.genus.toLowerCase().includes(norm),
    )
  }, [plants, q])

  const groups = useMemo(() => {
    const map = new Map<GrowthFormKey | null, Plant[]>()
    for (const plant of filtered) {
      const key = plant.growthFormKey
      const arr = map.get(key) ?? []
      arr.push(plant)
      map.set(key, arr)
    }
    const result: { key: GrowthFormKey | null; label: string; plants: Plant[] }[] = []
    for (const g of GROWTH_GROUPS) {
      const items = map.get(g.key)
      if (items && items.length > 0) result.push({ key: g.key, label: g.label, plants: items })
    }
    const unclassified = map.get(null)
    if (unclassified && unclassified.length > 0) {
      result.push({ key: null, label: 'Sin clasificar', plants: unclassified })
    }
    return result
  }, [filtered])

  const visibleGroups = useMemo(
    () => (activeGroup ? groups.filter((g) => g.key === activeGroup) : groups),
    [groups, activeGroup],
  )

  return (
    <section className="pb-8">
        {/* Sticky: búsqueda + filtros de uso */}
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
              placeholder="Buscar por nombre, familia o género..."
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
        <div className="mb-6 mt-4 text-sm text-muted-foreground">
          {isLoading
            ? 'Cargando catálogo...'
            : `${visibleGroups.reduce((s, g) => s + g.plants.length, 0)} planta${visibleGroups.reduce((s, g) => s + g.plants.length, 0) !== 1 ? 's' : ''} en el catálogo`}
        </div>

        {error && (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-[color:var(--status-danger)]/40 bg-card px-5 py-4 text-sm text-[color:var(--status-danger)]">
            No se pudo cargar el catálogo. Verifica la conexión con el servidor.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-10">
            {Array.from({ length: 2 }).map((_, gi) => (
              <div key={gi}>
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-secondary" />
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card"
                    >
                      <div className="aspect-[4/3] animate-pulse bg-secondary" />
                      <div className="space-y-2 px-3 pb-3 pt-2.5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-secondary" />
                        <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-card px-5 py-9 text-center text-sm text-muted-foreground">
            No se encontraron plantas con esos filtros. Ajusta tu búsqueda para ver más opciones.
          </div>
        ) : (
          <div className="space-y-10">
            {visibleGroups.map(({ key, label, plants: groupPlants }) => (
              <div key={key ?? 'unclassified'}>
                <h2 className="mb-4 text-lg font-semibold text-foreground">{label}</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {groupPlants.map((plant, index) => (
                    <Link
                      key={plant.id}
                      to={`/plantas/${plant.id}`}
                      className="catalog-card group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Imagen */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={plant.imageUrl}
                          alt={plant.nameCommon}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Eye className="size-7 text-white" />
                          <span className="text-xs font-semibold text-white tracking-wide">
                            Ver más
                          </span>
                        </div>
                      </div>

                      {/* Nombres */}
                      <div className="px-3 pb-3 pt-2.5">
                        <p className="text-[11px] italic leading-tight text-muted-foreground">
                          {plant.scientificName}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
                          {plant.nameCommon}
                        </p>
                        {/* Badges de uso */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {plant.uses.map((u) => (
                            <span
                              key={u}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
  )
}

