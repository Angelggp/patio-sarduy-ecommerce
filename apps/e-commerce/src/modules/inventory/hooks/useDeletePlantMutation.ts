import { useMutation, useQueryClient } from '@tanstack/react-query'

import { inventoryService } from '@/modules/inventory/services/inventory.service'

export function useDeletePlantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteOne(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
    },
  })
}
