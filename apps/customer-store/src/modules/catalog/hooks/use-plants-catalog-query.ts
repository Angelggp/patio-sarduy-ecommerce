import { useQuery } from '@tanstack/react-query'

import {
  type PlantsCatalogQuery,
  getPlantsCatalog,
} from '@/modules/catalog/api/get-plants-catalog'

export function usePlantsCatalogQuery(query: PlantsCatalogQuery) {
  return useQuery({
    queryKey: ['plants-catalog', query],
    queryFn: () => getPlantsCatalog(query),
    select: (data) => data,
  })
}
