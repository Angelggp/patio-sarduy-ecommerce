import { z } from 'zod'

export const orderTypeSchema = z.enum(['DELIVERY', 'PICKUP'])
export const orderStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'])

export const orderItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  quantity: z.number(),
  price: z.coerce.number(),
  product: z
    .object({
      id: z.number(),
      commonName: z.string(),
    })
    .optional(),
})

export const orderSchema = z.object({
  id: z.number(),
  status: orderStatusSchema,
  type: orderTypeSchema,
  userId: z.number().nullable().optional(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      phone: z.string().nullable().optional(),
      role: z.string(),
      isGuest: z.boolean().optional(),
    })
    .nullable()
    .optional(),
  customerName: z.string(),
  customerPhone: z.string(),
  createdAt: z.string().or(z.date()),
  items: z.array(orderItemSchema),
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

export const createOrderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export const createOrderPayloadSchema = z
  .object({
    userId: z.number().int().positive().optional(),
    type: orderTypeSchema,
    customerName: z.string().min(3).max(100).optional(),
    customerPhone: z.string().min(6).max(20).optional(),
    address: z.string().max(120).optional(),
    zone: z.string().max(80).optional(),
    instructions: z.string().max(120).optional(),
    items: z.array(createOrderItemSchema).min(1),
  })
  .superRefine((value, ctx) => {
    if (!value.userId && (!value.customerName || !value.customerPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes enviar nombre y telefono cuando no hay usuario autenticado.',
        path: ['customerName'],
      })
    }

    if (value.type === 'DELIVERY') {
      if (!value.address || value.address.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La direccion es obligatoria para entrega.',
          path: ['address'],
        })
      }

      if (!value.zone || value.zone.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La zona es obligatoria para entrega.',
          path: ['zone'],
        })
      }
    }
  })

export type CreateOrderPayload = z.infer<typeof createOrderPayloadSchema>
export type Order = z.infer<typeof orderSchema>
export type OrdersFindManyResponse = z.infer<typeof ordersFindManyResponseSchema>
