import { useMutation, useQueryClient } from '@tanstack/react-query'

import { inventoryService } from '@/modules/inventory/services/inventory.service'

export function useImportCsvMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => inventoryService.importCsv(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'find-many'] })
    },
  })
}
