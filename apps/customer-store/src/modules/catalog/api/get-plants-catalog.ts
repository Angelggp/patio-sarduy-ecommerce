import { z } from 'zod'

import { apiClient } from '@/app/api-client'
import type { Plant } from '@/modules/catalog/types/plant'

const productSchema = z.object({
  id: z.number(),
  commonName: z.string(),
  scientificName: z.string(),
  growthForm: z.enum(['TREE', 'SHRUB', 'HERB', 'CLIMBER', 'SUCCULENT', 'PALM']),
  imagePath: z.string().nullable().optional(),
  price: z.coerce.number().nullable().optional(),
  mainPopularUse: z.object({
    culinary: z.boolean(),
    medicinal: z.boolean(),
    aromatic: z.boolean(),
  }),
})

const paginatedProductsSchema = z.object({
  results: z.array(productSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPage: z.number(),
  }),
})

const growthFormLabelMap: Record<string, Plant['growthForm']> = {
  TREE: 'Arbustiva',
  SHRUB: 'Arbustiva',
  HERB: 'Roseta',
  CLIMBER: 'Trepadora',
  SUCCULENT: 'Roseta',
  PALM: 'Vertical',
}

const fallbackImageByIndex = [
  'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80',
]

export type PlantsCatalogQuery = {
  q?: string
  growthForm?: string
  useFilter?: 'culinary' | 'medicinal' | 'aromatic'
}

export async function getPlantsCatalog(query: PlantsCatalogQuery = {}): Promise<Plant[]> {
  const params: Record<string, string | number | boolean> = {
    page: 1,
    pageSize: 100,
  }

  if (query.q?.trim()) {
    params.q = query.q.trim()
  }

  if (query.growthForm && query.growthForm !== 'Todas') {
    params.growthForm = query.growthForm
  }

  if (query.useFilter) {
    params[query.useFilter] = true
  }

  const response = await apiClient.get('/products', { params })
  const payload = paginatedProductsSchema.parse(response.data)

  return payload.results.map((product, index) => {
    const uses: string[] = []
    if (product.mainPopularUse.culinary) {
      uses.push('Culinaria')
    }
    if (product.mainPopularUse.medicinal) {
      uses.push('Medicinal')
    }
    if (product.mainPopularUse.aromatic) {
      uses.push('Aromatica')
    }

    return {
      id: String(product.id),
      nameCommon: product.commonName,
      scientificName: product.scientificName,
      imageUrl: product.imagePath || fallbackImageByIndex[index % fallbackImageByIndex.length],
      priceCUP: product.price ?? 0,
      uses: uses.length > 0 ? uses : ['Ornamental'],
      growthForm: growthFormLabelMap[product.growthForm] ?? 'Vertical',
    }
  })
}
