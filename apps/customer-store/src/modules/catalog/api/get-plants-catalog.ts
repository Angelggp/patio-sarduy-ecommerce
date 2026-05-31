import { z } from 'zod'

import { apiClient } from '@/app/api-client'
import type { Plant } from '@/modules/catalog/types/plant'
import plantaFallback from '@/img/icono_logo.svg'

const productSchema = z.object({
  id: z.number(),
  plantNumber: z.number().nullable().optional(),
  commonName: z.string(),
  scientificName: z.string(),
  genus: z.string(),
  family: z.string(),
  growthForm: z.enum(['TREE', 'SHRUB', 'HERB', 'CLIMBER', 'SUCCULENT', 'PALM']).nullable().optional(),
  origin: z.string().nullable().optional(),
  provenance: z.string().nullable().optional(),
  collector: z.string().nullable().optional(),
  registrationDate: z.string().nullable().optional(),
  imagePath: z.string().nullable().optional(),
  price: z.coerce.number().nullable().optional(),
  population: z.number().nullable().optional(),
  threatCategory: z.enum(['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD']).nullable().optional(),
  isEndemic: z.boolean().nullable().optional(),
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

const growthFormLabelMap: Record<string, string> = {
  TREE: 'Árbol',
  SHRUB: 'Arbusto',
  HERB: 'Hierba',
  CLIMBER: 'Trepadora',
  SUCCULENT: 'Suculenta',
  PALM: 'Palma',
}

const fallbackImage = plantaFallback as string

export type PlantsCatalogQuery = {
  q?: string
  growthForm?: string
  useFilter?: 'culinary' | 'medicinal' | 'aromatic'
  hasPrice?: boolean
}

export async function getPlantsCatalog(query: PlantsCatalogQuery = {}): Promise<{ plants: Plant[]; total: number }> {
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

  if (query.hasPrice) {
    params.priceMin = 0.01
  }

  const response = await apiClient.get('/products', { params })
  const payload = paginatedProductsSchema.parse(response.data)

  const plants = payload.results.map((product): Plant => {
    const uses: string[] = []
    if (product.mainPopularUse.culinary) uses.push('Culinaria')
    if (product.mainPopularUse.medicinal) uses.push('Medicinal')
    if (product.mainPopularUse.aromatic) uses.push('Aromática')

    return {
      id: String(product.id),
      plantNumber: product.plantNumber ?? null,
      nameCommon: product.commonName,
      scientificName: product.scientificName,
      family: product.family,
      genus: product.genus,
      origin: product.origin ?? null,
      provenance: product.provenance ?? null,
      collector: product.collector ?? null,
      registrationDate: product.registrationDate ?? null,
      imageUrl: product.imagePath || fallbackImage,
      priceCUP: product.price != null ? product.price : null,
      stock: product.population ?? null,
      uses: uses.length > 0 ? uses : ['Ornamental'],
      growthFormKey: product.growthForm ?? null,
      growthFormLabel: product.growthForm ? (growthFormLabelMap[product.growthForm] ?? 'Otro') : 'Sin clasificar',
      threatCategory: product.threatCategory ?? null,
      isEndemic: product.isEndemic ?? null,
    }
  })

  return { plants, total: payload.meta.total }
}
