import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { inventoryService } from '@/modules/inventory/services/inventory.service'
import { type CreatePlantInput } from '@/modules/inventory/types/inventory.types'

export function useCreatePlantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePlantInput) => inventoryService.createOne(payload),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
      toast.success(`"${data.commonName}" agregada al inventario`)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'No se pudo crear la planta'
      toast.error(message)
    },
  })
}
