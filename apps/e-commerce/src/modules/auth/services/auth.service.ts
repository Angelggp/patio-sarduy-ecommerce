import { z } from 'zod'

import { apiClient } from '@/app/api-client'
import { type AuthSession, type AuthUser, authSessionSchema, authUserSchema } from '@/modules/auth/types/auth.types'

const loginPayloadSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const refreshPayloadSchema = z.object({
  refreshToken: z.string().min(1),
})

export const authService = {
  async login(username: string, password: string): Promise<AuthSession> {
    const payload = loginPayloadSchema.parse({ username, password })
    const response = await apiClient.post('/auth/login', payload)

    return authSessionSchema.parse(response.data)
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const payload = refreshPayloadSchema.parse({ refreshToken })
    const response = await apiClient.post('/auth/refresh', payload)

    return authSessionSchema.parse(response.data)
  },

  async me(): Promise<AuthUser> {
    const response = await apiClient.get('/auth/me')
    return authUserSchema.parse(response.data)
  },
}
