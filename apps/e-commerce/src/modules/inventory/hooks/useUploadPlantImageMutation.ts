import { useMutation, useQueryClient } from '@tanstack/react-query'

import { inventoryService } from '@/modules/inventory/services/inventory.service'
import { type InventoryPlant } from '@/modules/inventory/types/inventory.types'

type UploadPlantImageInput = {
  id: number
  file: File
}

export function useUploadPlantImageMutation() {
  const queryClient = useQueryClient()

  return useMutation<InventoryPlant, Error, UploadPlantImageInput>({
    mutationFn: ({ id, file }: UploadPlantImageInput) => inventoryService.updateOneImage(id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
    },
  })
}
