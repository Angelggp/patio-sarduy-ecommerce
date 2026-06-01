import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
      toast.success(`"${data.commonName}" actualizada correctamente`)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'No se pudo actualizar la planta'
      toast.error(message)
    },
  })
}
