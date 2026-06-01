import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
      toast.success(`Imagen de "${data.commonName}" actualizada`)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'No se pudo subir la imagen'
      toast.error(message)
    },
  })
}
