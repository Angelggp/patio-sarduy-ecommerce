import { z } from 'zod'

export const growthFormValues = ['TREE', 'SHRUB', 'HERB', 'CLIMBER', 'SUCCULENT', 'PALM'] as const
export const threatCategoryValues = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD'] as const

export const growthFormSchema = z.enum(growthFormValues)
export const threatCategorySchema = z.enum(threatCategoryValues)

export const inventoryMainPopularUseSchema = z.object({
  culinary: z.boolean(),
  medicinal: z.boolean(),
  aromatic: z.boolean(),
})

export const inventoryPlantSchema = z.object({
  id: z.number(),
  commonName: z.string(),
  scientificName: z.string(),
  genus: z.string(),
  family: z.string(),
  growthForm: growthFormSchema.nullable().optional(),
  origin: z.string().nullable().optional(),
  provenance: z.string().nullable().optional(),
  collector: z.string().nullable().optional(),
  threatCategory: threatCategorySchema.nullable().optional(),
  isEndemic: z.boolean().nullable().optional(),
  price: z.coerce.number().nullable().optional(),
  population: z.number().nullable().optional(),
  registrationDate: z.string().or(z.date()).nullable().optional(),
  deathDate: z.string().or(z.date()).nullable().optional(),
  imagePath: z.string().nullable().optional(),
  mainPopularUse: inventoryMainPopularUseSchema,
})

export const inventoryMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPage: z.number(),
})

export const inventoryFindManyResponseSchema = z.object({
  results: z.array(inventoryPlantSchema),
  meta: inventoryMetaSchema,
})

export const inventoryFiltersSchema = z.object({
  growthForm: growthFormSchema.optional(),
  threatCategory: threatCategorySchema.optional(),
  isEndemic: z.boolean().optional(),
  culinary: z.boolean().optional(),
  medicinal: z.boolean().optional(),
  aromatic: z.boolean().optional(),
  populationMin: z.number().int().min(0).optional(),
  populationMax: z.number().int().min(0).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
})

export const inventoryQueryParamsSchema = inventoryFiltersSchema.extend({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
  q: z.string().optional(),
})

export const createPlantPayloadSchema = z.object({
  commonName: z.string().min(2, 'El nombre común es requerido (mín. 2 caracteres)').max(100),
  scientificName: z.string().min(2, 'El nombre científico es requerido (mín. 2 caracteres)').max(100),
  genus: z.string().min(2, 'El género es requerido (mín. 2 caracteres)').max(100),
  family: z.string().min(2, 'La familia es requerida (mín. 2 caracteres)').max(100),
  growthForm: growthFormSchema,
  origin: z.string().max(100).optional().default(''),
  provenance: z.string().max(100).optional().default(''),
  collector: z.string().max(100).optional().default(''),
  threatCategory: threatCategorySchema,
  isEndemic: z.boolean(),
  price: z.number().min(0).optional(),
  population: z.number().int().min(0),
  registrationDate: z.string().datetime().optional(),
  deathDate: z.string().datetime().optional(),
  imagePath: z.string().optional(),
  mainPopularUse: inventoryMainPopularUseSchema,
})

export const createPlantInputSchema = createPlantPayloadSchema.extend({
  imageFile: z.instanceof(File).optional(),
})

export const updatePlantPayloadSchema = createPlantPayloadSchema
  .omit({
    registrationDate: true,
    deathDate: true,
  })
  .partial()
  .extend({
    mainPopularUse: inventoryMainPopularUseSchema.partial().optional(),
  })

export const createPresignedUploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
})

export const createPresignedUploadResponseSchema = z.object({
  uploadUrl: z.string().url(),
  objectKey: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
  objectUrl: z.string().url(),
})

export type GrowthForm = z.infer<typeof growthFormSchema>
export type ThreatCategory = z.infer<typeof threatCategorySchema>
export type InventoryPlant = z.infer<typeof inventoryPlantSchema>
export type InventoryFilters = z.infer<typeof inventoryFiltersSchema>
export type InventoryQueryParams = z.infer<typeof inventoryQueryParamsSchema>
export type InventoryFindManyResponse = z.infer<typeof inventoryFindManyResponseSchema>
export type CreatePlantPayload = z.infer<typeof createPlantPayloadSchema>
export type CreatePlantInput = z.infer<typeof createPlantInputSchema>
export type UpdatePlantPayload = z.infer<typeof updatePlantPayloadSchema>
export type CreatePresignedUploadRequest = z.infer<typeof createPresignedUploadRequestSchema>
export type CreatePresignedUploadResponse = z.infer<typeof createPresignedUploadResponseSchema>

export const importCsvResultSchema = z.object({
  inserted: z.number(),
  errors: z.array(z.object({ commonName: z.string(), message: z.string() })),
})

export type ImportCsvResult = z.infer<typeof importCsvResultSchema>
