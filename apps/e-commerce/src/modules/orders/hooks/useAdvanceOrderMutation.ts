import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ordersService } from '@/modules/orders/services/orders.service'

export function mapApiError(error: unknown, fallbackMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string | string[] }
      | undefined

    if (Array.isArray(payload?.message) && payload.message.length > 0) {
      return new Error(payload.message.join(', '))
    }

    if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
      return new Error(payload.message)
    }
  }

  if (error instanceof Error) {
    return error
  }

  return new Error(fallbackMessage)
}

export function useAdvanceOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        return await ordersService.advanceToNextStatus(id)
      } catch (error) {
        throw mapApiError(error, 'No se pudo avanzar el estado del pedido.')
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders', 'find-many'] })
    },
  })
}
