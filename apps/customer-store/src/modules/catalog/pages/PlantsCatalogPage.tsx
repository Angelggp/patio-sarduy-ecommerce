import { useMemo, useState } from 'react'
import { Minus, Plus, Search, Sparkles } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

import type { RootState } from '@/app/store'
import { decrementPlantQty, incrementPlantQty } from '@/app/store'
import { Button } from '@/components/ui/button'
import { usePlantsCatalogQuery } from '@/modules/catalog/hooks/use-plants-catalog-query'

const moneyFormatter = new Intl.NumberFormat('es-CU', {
  style: 'currency',
  currency: 'CUP',
  maximumFractionDigits: 0,
})

export function PlantsCatalogPage() {
  const dispatch = useDispatch()
  const itemsByPlantId = useSelector((state: RootState) => state.cart.itemsByPlantId)

  const [searchText, setSearchText] = useState('')
  const [selectedGrowthForm, setSelectedGrowthForm] = useState('Todas' as 'Todas' | 'TREE' | 'SHRUB' | 'HERB' | 'CLIMBER' | 'SUCCULENT' | 'PALM')
  const [selectedUseFilter, setSelectedUseFilter] = useState<'all' | 'culinary' | 'medicinal' | 'aromatic'>('all')
  const [selectedUse, setSelectedUse] = useState('Todos')

  const { data: plants = [], isLoading, isFetching, error } = usePlantsCatalogQuery({
    q: searchText,
    growthForm: selectedGrowthForm,
    useFilter: selectedUseFilter === 'all' ? undefined : selectedUseFilter,
  })

  const growthFormOptions = [
    { value: 'Todas', label: 'Todas' },
    { value: 'TREE', label: 'Arbol' },
    { value: 'SHRUB', label: 'Arbusto' },
    { value: 'HERB', label: 'Hierba' },
    { value: 'CLIMBER', label: 'Trepadora' },
    { value: 'SUCCULENT', label: 'Suculenta' },
    { value: 'PALM', label: 'Palma' },
  ] as const

  const useFilterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'culinary', label: 'Culinaria' },
    { value: 'medicinal', label: 'Medicinal' },
    { value: 'aromatic', label: 'Aromatica' },
  ] as const

  const useOptions = useMemo(() => ['Todos', ...new Set(plants.flatMap((plant) => plant.uses))], [plants])

  const filteredPlants = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return plants.filter((plant) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        plant.nameCommon.toLowerCase().includes(normalizedSearch) ||
        plant.scientificName.toLowerCase().includes(normalizedSearch)
      const matchesUse = selectedUse === 'Todos' || plant.uses.includes(selectedUse)

      return matchesSearch && matchesUse
    })
  }, [plants, searchText, selectedUse])

  const cartItemCount = useMemo(() => {
    return Object.values(itemsByPlantId).reduce<number>((acc, quantity) => acc + quantity, 0)
  }, [itemsByPlantId])

  const cardDelayStep = 90

  return (
    <section className="space-y-7 pb-8">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-[linear-gradient(135deg,#ffffff_0%,#eaf5ee_45%,#dff0e6_100%)] px-6 py-7 shadow-[var(--shadow-soft)] lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute -top-20 right-3 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(34,211,95,0.27)_0%,rgba(34,211,95,0)_72%)]" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(8,39,21,0.13)_0%,rgba(8,39,21,0)_72%)]" />

        <div className="relative space-y-5">
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Jardin vivo para casa
          </div>

          <div className="space-y-2">
            <h1 className="mb-0">Plantas listas para tu espacio</h1>
            <p className="max-w-2xl text-[15px] text-muted-foreground lg:text-base">
              Explora especies seleccionadas con informacion practica para decidir rapido: precio,
              usos y forma de crecimiento. Agrega al carrito y ajusta cantidades sin salir del
              catalogo.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[color:var(--bg-deep-forest)] px-4 py-2 text-sm font-semibold text-[color:var(--text-on-dark)] shadow-[var(--shadow-float)]">
            Carrito activo: {cartItemCount} unidad{cartItemCount === 1 ? '' : 'es'}
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-soft)] lg:grid-cols-[2.1fr_1fr_1fr] lg:items-end lg:p-5">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Buscar planta
          </span>
          <div className="flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-input bg-background px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Nombre comun o cientifico"
              className="h-full w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Crecimiento
          </span>
          <select
            value={selectedGrowthForm}
            onChange={(event) =>
              setSelectedGrowthForm(
                event.target.value as 'Todas' | 'TREE' | 'SHRUB' | 'HERB' | 'CLIMBER' | 'SUCCULENT' | 'PALM',
              )
            }
            className="h-11 w-full rounded-[var(--radius-pill)] border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            {growthFormOptions.map((growthForm) => (
              <option key={growthForm.value} value={growthForm.value}>
                {growthForm.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Uso principal
          </span>
          <select
            value={selectedUseFilter}
            onChange={(event) =>
              setSelectedUseFilter(
                event.target.value as 'all' | 'culinary' | 'medicinal' | 'aromatic',
              )
            }
            className="h-11 w-full rounded-[var(--radius-pill)] border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            {useFilterOptions.map((useOption) => (
              <option key={useOption.value} value={useOption.value}>
                {useOption.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Tag de uso
          </span>
          <select
            value={selectedUse}
            onChange={(event) => setSelectedUse(event.target.value)}
            className="h-11 w-full rounded-[var(--radius-pill)] border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            {useOptions.map((useOption) => (
              <option key={useOption} value={useOption}>
                {useOption}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredPlants.length} de {plants.length} plantas
        </p>

        {isFetching ? <p className="text-xs text-muted-foreground">Actualizando resultados...</p> : null}
      </div>

      {error ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--status-danger)]/40 bg-card px-5 py-4 text-sm text-[color:var(--status-danger)]">
          No se pudo consultar productos del backend. Verifica API, token o CORS.
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-card px-5 py-9 text-center text-sm text-muted-foreground">
          Cargando catalogo...
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

                  {quantityInCart === 0 ? (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => dispatch(incrementPlantQty(plant.id))}
                    >
                      Agregar al carrito
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between rounded-[var(--radius-pill)] border border-border bg-secondary px-2 py-1.5">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => dispatch(decrementPlantQty(plant.id))}
                        aria-label={`Disminuir cantidad de ${plant.nameCommon}`}
                      >
                        <Minus className="size-3.5" />
                      </Button>

                      <span className="text-sm font-semibold text-foreground">
                        {quantityInCart} en carrito
                      </span>

                      <Button
                        type="button"
                        size="icon-xs"
                        onClick={() => dispatch(incrementPlantQty(plant.id))}
                        aria-label={`Aumentar cantidad de ${plant.nameCommon}`}
                      >
                        <Plus className="size-3.5" />
                      </Button>
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
