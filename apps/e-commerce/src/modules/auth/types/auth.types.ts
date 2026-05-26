import { z } from 'zod'

export const userRoleValues = ['ADMIN', 'ASSISTANT', 'STUDENT', 'CLIENT'] as const
export const userRoleSchema = z.enum(userRoleValues)

export const authUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  role: userRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: authUserSchema,
})

export type UserRole = z.infer<typeof userRoleSchema>
export type AuthUser = z.infer<typeof authUserSchema>
export type AuthSession = z.infer<typeof authSessionSchema>
