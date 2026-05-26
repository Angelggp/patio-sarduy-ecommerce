import { z } from 'zod'

export const orderStatusValues = ['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'] as const
export const orderTypeValues = ['DELIVERY', 'PICKUP'] as const

export const orderStatusSchema = z.enum(orderStatusValues)
export const orderTypeSchema = z.enum(orderTypeValues)

export const orderProductSchema = z.object({
  id: z.number(),
  commonName: z.string(),
})

export const orderItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  price: z.coerce.number(),
  quantity: z.number(),
  product: orderProductSchema.optional(),
})

export const deliveryDetailsSchema = z.object({
  id: z.number(),
  address: z.string(),
  zone: z.string(),
  instructions: z.string().nullable().optional(),
})

export const orderSchema = z.object({
  id: z.number(),
  status: orderStatusSchema,
  type: orderTypeSchema,
  customerName: z.string(),
  customerPhone: z.string(),
  deliveryDetails: deliveryDetailsSchema.nullable().optional(),
  items: z.array(orderItemSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const ordersMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPage: z.number(),
})

export const ordersFindManyResponseSchema = z.object({
  results: z.array(orderSchema),
  meta: ordersMetaSchema,
})

export const ordersQueryParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  statuses: z.array(orderStatusSchema).optional(),
})

export type OrderStatus = z.infer<typeof orderStatusSchema>
export type OrderType = z.infer<typeof orderTypeSchema>
export type Order = z.infer<typeof orderSchema>
export type OrdersFindManyResponse = z.infer<typeof ordersFindManyResponseSchema>
export type OrdersQueryParams = z.infer<typeof ordersQueryParamsSchema>
