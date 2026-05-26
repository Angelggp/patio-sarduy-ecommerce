import { z } from 'zod'

import { apiClient } from '@/app/api-client'
import { type AuthSession, authSessionSchema } from '@/modules/auth/types/auth.types'

const loginPayloadSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const registerPayloadSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  name: z.string().min(2),
  phone: z.string().min(6),
})

export const authService = {
  async login(username: string, password: string): Promise<AuthSession> {
    const payload = loginPayloadSchema.parse({ username, password })
    const response = await apiClient.post('/auth/login', payload)

    return authSessionSchema.parse(response.data)
  },

  async register(input: {
    username: string
    password: string
    name: string
    phone: string
  }): Promise<AuthSession> {
    const payload = registerPayloadSchema.parse(input)
    const response = await apiClient.post('/auth/register', payload)

    return authSessionSchema.parse(response.data)
  },
}
