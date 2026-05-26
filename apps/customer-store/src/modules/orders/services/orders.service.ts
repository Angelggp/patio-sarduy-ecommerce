import { apiClient } from '@/app/api-client'
import {
  type CreateOrderPayload,
  type OrdersFindManyResponse,
  createOrderPayloadSchema,
  ordersFindManyResponseSchema,
} from '@/modules/orders/types/orders.types'

export const ordersService = {
  async createOne(payload: CreateOrderPayload): Promise<void> {
    const normalizedPayload = createOrderPayloadSchema.parse(payload)

    await apiClient.post('/orders', normalizedPayload)
  },

  async findMany(): Promise<OrdersFindManyResponse> {
    const response = await apiClient.get('/orders', {
      params: {
        page: 1,
        pageSize: 20,
      },
    })

    return ordersFindManyResponseSchema.parse(response.data)
  },
}
