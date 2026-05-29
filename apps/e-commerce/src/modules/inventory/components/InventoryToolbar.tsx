import { Search } from 'lucide-react'
import { useSelector } from 'react-redux'

import { type RootState } from '@/app/store'
import { CreatePlantModal } from '@/modules/inventory/components/CreatePlantModal'
import { ImportCsvModal } from '@/modules/inventory/components/ImportCsvModal'
import { PlantFiltersModal } from '@/modules/inventory/components/PlantFiltersModal'
import { type InventoryFilters } from '@/modules/inventory/types/inventory.types'

type InventoryToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  filters: InventoryFilters
  onFiltersChange: (value: InventoryFilters) => void
}

export function InventoryToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
}: InventoryToolbarProps) {
  const authUserRole = useSelector((state: RootState) => state.auth.user?.role)
  const canCreatePlants = authUserRole !== 'STUDENT'

  return (
    <div className='mb-6 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-(--shadow-soft)'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
        <label className='relative w-full lg:max-w-xl'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)' />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder='Buscar por nombre, genero, especie o familia'
            className='w-full rounded-(--radius-pill) border border-(--border-subtle) bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-(--brand-primary)'
          />
        </label>

        <div className='flex flex-wrap gap-2 lg:ml-auto'>
          <PlantFiltersModal value={filters} onApply={onFiltersChange} />
          {canCreatePlants ? <ImportCsvModal /> : null}
          {canCreatePlants ? <CreatePlantModal /> : null}
        </div>
      </div>
    </div>
  )
}

