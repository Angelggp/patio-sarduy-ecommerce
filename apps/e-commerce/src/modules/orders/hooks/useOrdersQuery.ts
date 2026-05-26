import { useQuery } from '@tanstack/react-query'

import { ordersService } from '@/modules/orders/services/orders.service'
import { type OrdersQueryParams, ordersQueryParamsSchema } from '@/modules/orders/types/orders.types'

export function useOrdersQuery(params: OrdersQueryParams) {
  const normalizedParams = ordersQueryParamsSchema.parse(params)

  return useQuery({
    queryKey: ['orders', 'find-many', normalizedParams],
    queryFn: () => ordersService.findMany(normalizedParams),
  })
}
