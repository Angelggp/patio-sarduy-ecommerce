import { apiClient } from '@/app/api-client'
import {
  type Order,
  type OrdersFindManyResponse,
  type OrdersQueryParams,
  orderSchema,
  ordersFindManyResponseSchema,
} from '@/modules/orders/types/orders.types'

function cleanQueryParams(params: OrdersQueryParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    pageSize: params.pageSize,
  }

  if (params.statuses?.length) {
    query.statuses = params.statuses.join(',')
  }

  return query
}

export const ordersService = {
  async findMany(params: OrdersQueryParams): Promise<OrdersFindManyResponse> {
    const response = await apiClient.get('/orders', {
      params: cleanQueryParams(params),
    })

    return ordersFindManyResponseSchema.parse(response.data)
  },

  async advanceToNextStatus(id: number): Promise<Order> {
    const response = await apiClient.patch(`/orders/${id}/advance`)

    return orderSchema.parse(response.data)
  },

  async cancelOrder(id: number): Promise<Order> {
    const response = await apiClient.patch(`/orders/${id}/cancel`)

    return orderSchema.parse(response.data)
  },
}
