import { useMutation, useQueryClient } from '@tanstack/react-query'

import { inventoryService } from '@/modules/inventory/services/inventory.service'
import { type UpdatePlantPayload } from '@/modules/inventory/types/inventory.types'

type UpdatePlantInput = {
  id: number
  payload: UpdatePlantPayload
}

export function useUpdatePlantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePlantInput) => inventoryService.updateOne(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
    },
  })
}
