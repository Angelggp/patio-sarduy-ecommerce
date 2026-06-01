import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ordersService } from '@/modules/orders/services/orders.service'

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => ordersService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders', 'find-many'] })
      toast.success('Pedido cancelado correctamente')
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'No se pudo cancelar el pedido'
      toast.error(message)
    },
  })
}
