import { useQuery } from '@tanstack/react-query'
import { getPlantById } from '@/modules/catalog/api/get-plant-by-id'

export function usePlantByIdQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['plant', id],
    queryFn: () => getPlantById(id!),
    enabled: !!id,
  })
}
