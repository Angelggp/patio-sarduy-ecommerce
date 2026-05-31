import { z } from 'zod'

import { apiClient } from '@/app/api-client'
import type { Plant } from '@/modules/catalog/types/plant'
import plantaFallback from '@/img/icono_logo.svg'

const productDetailSchema = z.object({
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

const growthFormLabelMap: Record<string, string> = {
  TREE: 'Árbol',
  SHRUB: 'Arbusto',
  HERB: 'Hierba',
  CLIMBER: 'Trepadora',
  SUCCULENT: 'Suculenta',
  PALM: 'Palma',
}

const fallbackImage = plantaFallback as string

export async function getPlantById(id: string): Promise<Plant> {
  const response = await apiClient.get(`/products/${id}`)
  const product = productDetailSchema.parse(response.data)

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
}
