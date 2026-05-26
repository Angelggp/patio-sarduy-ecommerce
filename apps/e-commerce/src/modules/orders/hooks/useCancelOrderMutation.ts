import { useMutation, useQueryClient } from '@tanstack/react-query'

import { mapApiError } from '@/modules/orders/hooks/useAdvanceOrderMutation'
import { ordersService } from '@/modules/orders/services/orders.service'

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        return await ordersService.cancelOrder(id)
      } catch (error) {
        throw mapApiError(error, 'No se pudo cancelar el pedido.')
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders', 'find-many'] })
    },
  })
}
