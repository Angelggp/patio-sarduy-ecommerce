import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { type InventoryFilters, growthFormValues, threatCategoryValues } from '@/modules/inventory/types/inventory.types'
import {
  booleanFilterOptions,
  growthFormLabelMap,
  threatCategoryLabelMap,
} from '@/modules/inventory/utils/inventory.constants'

type PlantFiltersModalProps = {
  value: InventoryFilters
  onApply: (nextFilters: InventoryFilters) => void
}

type BooleanSelection = 'all' | 'true' | 'false'

function booleanToSelection(value: boolean | undefined): BooleanSelection {
  if (value === undefined) {
    return 'all'
  }

  return value ? 'true' : 'false'
}

function selectionToBoolean(value: BooleanSelection): boolean | undefined {
  if (value === 'all') {
    return undefined
  }

  return value === 'true'
}

export function PlantFiltersModal({ value, onApply }: PlantFiltersModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<InventoryFilters>(value)

  const activeFiltersCount = useMemo(
    () => Object.values(value).filter((item) => item !== undefined).length,
    [value],
  )

  const applyAndClose = () => {
    onApply(draft)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const emptyFilters: InventoryFilters = {}
    setDraft(emptyFilters)
    onApply(emptyFilters)
  }

  return (
    <>
      <Button type='button' variant='secondary' onClick={() => setIsOpen(true)}>
        Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
      </Button>

      {isOpen ? (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4'>
          <div className='w-full max-w-2xl rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5 shadow-(--shadow-float)'>
            <div className='mb-4 flex items-start justify-between'>
              <div>
                <h2 className='font-heading text-2xl text-(--text-strong)'>Filtrar plantas</h2>
                <p className='text-sm text-(--text-muted)'>
                  Solo campos enum, booleanos y numericos.
                </p>
              </div>
              <button
                type='button'
                className='rounded-full border border-(--border-subtle) px-3 py-1 text-sm'
                onClick={() => {
                  setDraft(value)
                  setIsOpen(false)
                }}
              >
                Cerrar
              </button>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Forma de crecimiento</span>
                <select
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  value={draft.growthForm ?? ''}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      growthForm: event.target.value ? (event.target.value as (typeof growthFormValues)[number]) : undefined,
                    }))
                  }
                >
                  <option value=''>Todos</option>
                  {growthFormValues.map((valueOption) => (
                    <option key={valueOption} value={valueOption}>
                      {growthFormLabelMap[valueOption]}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Categoria de amenaza</span>
                <select
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  value={draft.threatCategory ?? ''}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      threatCategory: event.target.value
                        ? (event.target.value as (typeof threatCategoryValues)[number])
                        : undefined,
                    }))
                  }
                >
                  <option value=''>Todas</option>
                  {threatCategoryValues.map((valueOption) => (
                    <option key={valueOption} value={valueOption}>
                      {threatCategoryLabelMap[valueOption]}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Endemica</span>
                <select
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  value={booleanToSelection(draft.isEndemic)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      isEndemic: selectionToBoolean(event.target.value as BooleanSelection),
                    }))
                  }
                >
                  {booleanFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Uso culinario</span>
                <select
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  value={booleanToSelection(draft.culinary)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      culinary: selectionToBoolean(event.target.value as BooleanSelection),
                    }))
                  }
                >
                  {booleanFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Uso medicinal</span>
                <select
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  value={booleanToSelection(draft.medicinal)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      medicinal: selectionToBoolean(event.target.value as BooleanSelection),
                    }))
                  }
                >
                  {booleanFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Uso aromatico</span>
                <select
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  value={booleanToSelection(draft.aromatic)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      aromatic: selectionToBoolean(event.target.value as BooleanSelection),
                    }))
                  }
                >
                  {booleanFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Poblacion minima</span>
                <input
                  type='number'
                  min={0}
                  value={draft.populationMin ?? ''}
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      populationMin:
                        event.target.value === '' ? undefined : Number.parseInt(event.target.value, 10),
                    }))
                  }
                />
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Poblacion maxima</span>
                <input
                  type='number'
                  min={0}
                  value={draft.populationMax ?? ''}
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      populationMax:
                        event.target.value === '' ? undefined : Number.parseInt(event.target.value, 10),
                    }))
                  }
                />
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Precio minimo</span>
                <input
                  type='number'
                  min={0}
                  step='0.01'
                  value={draft.priceMin ?? ''}
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      priceMin: event.target.value === '' ? undefined : Number.parseFloat(event.target.value),
                    }))
                  }
                />
              </label>

              <label className='space-y-1'>
                <span className='text-sm font-semibold'>Precio maximo</span>
                <input
                  type='number'
                  min={0}
                  step='0.01'
                  value={draft.priceMax ?? ''}
                  className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm'
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      priceMax: event.target.value === '' ? undefined : Number.parseFloat(event.target.value),
                    }))
                  }
                />
              </label>
            </div>

            <div className='mt-5 flex justify-end gap-2'>
              <Button type='button' variant='ghost' onClick={clearFilters}>
                Limpiar
              </Button>
              <Button type='button' variant='secondary' onClick={() => setDraft(value)}>
                Restaurar
              </Button>
              <Button type='button' onClick={applyAndClose}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

