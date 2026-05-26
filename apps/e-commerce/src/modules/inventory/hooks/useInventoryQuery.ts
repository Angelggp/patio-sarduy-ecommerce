import { useQuery } from '@tanstack/react-query'

import { inventoryService } from '@/modules/inventory/services/inventory.service'
import { type InventoryQueryParams, inventoryQueryParamsSchema } from '@/modules/inventory/types/inventory.types'

export function useInventoryQuery(params: InventoryQueryParams) {
  const normalizedParams = inventoryQueryParamsSchema.parse(params)

  return useQuery({
    queryKey: ['inventory', 'find-many', normalizedParams],
    queryFn: () => inventoryService.findMany(normalizedParams),
  })
}
