import { z } from 'zod'

import { apiClient } from '@/app/api-client'
import type { Plant } from '@/modules/catalog/types/plant'
import plantaFallback from '@/img/icono_logo.svg'

const productSchema = z.object({
  id: z.number(),
  commonName: z.string(),
  scientificName: z.string(),
  growthForm: z.enum(['TREE', 'SHRUB', 'HERB', 'CLIMBER', 'SUCCULENT', 'PALM']).nullable().optional(),
  imagePath: z.string().nullable().optional(),
  price: z.coerce.number().nullable().optional(),
  population: z.number().nullable().optional(),
  mainPopularUse: z.object({
    culinary: z.boolean(),
    medicinal: z.boolean(),
    aromatic: z.boolean(),
    popularUse: z.boolean().optional(),
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

const fallbackImage = plantaFallback as string

export type PlantsCatalogQuery = {
  q?: string
  growthForm?: string
  useFilter?: 'culinary' | 'medicinal' | 'aromatic'
}

export async function getPlantsCatalog(query: PlantsCatalogQuery = {}): Promise<Plant[]> {
  const params: Record<string, string | number | boolean> = {
    page: 1,
    pageSize: 500,
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

  const plants = payload.results.map((product) => {
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
      imageUrl: product.imagePath || fallbackImage,
      priceCUP: product.price ?? 0,
      stock: product.population ?? null,
      uses: uses.length > 0 ? uses : ['Ornamental'],
      growthForm: (product.growthForm ? growthFormLabelMap[product.growthForm] : null) ?? 'Vertical',
    }
  })

  return { plants, total: payload.meta.total }
}
