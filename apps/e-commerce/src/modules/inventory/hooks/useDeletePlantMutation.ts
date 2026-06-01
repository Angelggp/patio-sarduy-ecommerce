import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { inventoryService } from '@/modules/inventory/services/inventory.service'

export function useDeletePlantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteOne(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
      toast.success('Planta eliminada')
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'No se pudo eliminar la planta'
      toast.error(message)
    },
  })
}
