import { useQuery } from '@tanstack/react-query'

import { ordersService } from '@/modules/orders/services/orders.service'

export function useOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: ['customer-orders', 'find-many'],
    queryFn: () => ordersService.findMany(),
    enabled,
  })
}
