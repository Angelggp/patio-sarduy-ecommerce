import { apiClient } from '@/app/api-client'
import {
  type CreatePlantInput,
  type CreatePlantPayload,
  type CreatePresignedUploadRequest,
  type CreatePresignedUploadResponse,
  type ImportCsvResult,
  type InventoryFindManyResponse,
  type InventoryPlant,
  type InventoryQueryParams,
  type UpdatePlantPayload,
  createPlantInputSchema,
  createPlantPayloadSchema,
  createPresignedUploadRequestSchema,
  createPresignedUploadResponseSchema,
  importCsvResultSchema,
  inventoryPlantSchema,
  inventoryFindManyResponseSchema,
  updatePlantPayloadSchema,
} from '@/modules/inventory/types/inventory.types'

function cleanQueryParams(params: InventoryQueryParams): Record<string, string | number | boolean> {
  return Object.entries(params).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return acc
    }

    acc[key] = value as string | number | boolean
    return acc
  }, {})
}

export const inventoryService = {
  async findMany(params: InventoryQueryParams): Promise<InventoryFindManyResponse> {
    const response = await apiClient.get('/products', {
      params: cleanQueryParams(params),
    })

    return inventoryFindManyResponseSchema.parse(response.data)
  },

  async createOne(input: CreatePlantInput): Promise<InventoryPlant> {
    const normalizedInput = createPlantInputSchema.parse(input)

    const imagePath = normalizedInput.imageFile
      ? await uploadImageAndGetPublicUrl(normalizedInput.imageFile)
      : normalizedInput.imagePath

    const payload: CreatePlantPayload = createPlantPayloadSchema.parse({
      ...normalizedInput,
      imagePath,
    })

    const response = await apiClient.post('/products', payload)

    return inventoryPlantSchema.parse(response.data)
  },

  async updateOne(id: number, payload: UpdatePlantPayload): Promise<InventoryPlant> {
    const normalizedPayload = updatePlantPayloadSchema.parse(payload)
    const response = await apiClient.patch(`/products/${id}`, normalizedPayload)

    return inventoryPlantSchema.parse(response.data)
  },

  async updateOneImage(id: number, imageFile: File): Promise<InventoryPlant> {
    const imagePath = await uploadImageAndGetPublicUrl(imageFile)
    return inventoryService.updateOne(id, { imagePath })
  },

  async deleteOne(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  },

  async importCsv(file: File): Promise<ImportCsvResult> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/products/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return importCsvResultSchema.parse(response.data)
  },
}

async function uploadImageAndGetPublicUrl(file: File): Promise<string> {
  const presignedRequest: CreatePresignedUploadRequest = createPresignedUploadRequestSchema.parse({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  })

  const presignedUploadResponse = await apiClient.post('/uploads/presign', presignedRequest)
  const presignedUpload: CreatePresignedUploadResponse = createPresignedUploadResponseSchema.parse(
    presignedUploadResponse.data,
  )

  const uploadResponse = await fetch(presignedUpload.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('No se pudo subir la imagen al almacenamiento.')
  }

  return presignedUpload.objectUrl
}
