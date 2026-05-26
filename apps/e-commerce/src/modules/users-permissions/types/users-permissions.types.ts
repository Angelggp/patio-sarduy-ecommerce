import { z } from 'zod'

import { userRoleSchema } from '@/modules/auth/types/auth.types'

export const panelUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  role: userRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const createPanelUserSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(2),
  phone: z.string().min(6).max(20).optional(),
  password: z.string().min(4),
  role: userRoleSchema,
})

export const updatePanelUserSchema = z
  .object({
    username: z.string().min(3).optional(),
    name: z.string().min(2).optional(),
    phone: z.string().min(6).max(20).optional(),
    role: userRoleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para modificar.',
  })

export const changePanelUserPasswordSchema = z.object({
  password: z.string().min(4),
})

export type PanelUser = z.infer<typeof panelUserSchema>
export type CreatePanelUserInput = z.infer<typeof createPanelUserSchema>
export type UpdatePanelUserInput = z.infer<typeof updatePanelUserSchema>
export type ChangePanelUserPasswordInput = z.infer<typeof changePanelUserPasswordSchema>
