import { useMutation, useQueryClient } from '@tanstack/react-query'

import { inventoryService } from '@/modules/inventory/services/inventory.service'
import { type CreatePlantInput } from '@/modules/inventory/types/inventory.types'

export function useCreatePlantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePlantInput) => inventoryService.createOne(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
    },
  })
}
