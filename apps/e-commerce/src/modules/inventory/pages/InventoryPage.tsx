import { useState } from 'react'

import { InventoryTitle } from '@/modules/inventory/components/InventoryTitle'
import { InventoryToolbar } from '@/modules/inventory/components/InventoryToolbar'
import { PlantCardGrid } from '@/modules/inventory/components/PlantCardGrid'
import { useDebouncedValue } from '@/modules/inventory/hooks/useDebouncedValue'
import { useInventoryQuery } from '@/modules/inventory/hooks/useInventoryQuery'
import { type InventoryFilters } from '@/modules/inventory/types/inventory.types'
import { DEFAULT_INVENTORY_PAGE_SIZE } from '@/modules/inventory/utils/inventory.constants'

export function InventoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<InventoryFilters>({})
  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isLoading } = useInventoryQuery({
    page,
    pageSize: DEFAULT_INVENTORY_PAGE_SIZE,
    q: debouncedSearch || undefined,
    ...filters,
  })

  return (
    <section className='space-y-6'>
      <InventoryTitle />

      <InventoryToolbar
        search={search}
        onSearchChange={(nextValue) => {
          setSearch(nextValue)
          setPage(1)
        }}
        filters={filters}
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters)
          setPage(1)
        }}
      />

      <PlantCardGrid
        plants={data?.results ?? []}
        isLoading={isLoading}
        page={data?.meta.page ?? page}
        totalPage={data?.meta.totalPage ?? 1}
        onPageChange={setPage}
      />
    </section>
  )
}
