import axios from 'axios'

import { type AuthSession, authSessionSchema } from '@/modules/auth/types/auth.types'
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  setStoredAuthSession,
} from '@/modules/auth/utils/auth-storage'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<AuthSession | null> | null = null

apiClient.interceptors.request.use((config) => {
  const session = getStoredAuthSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const statusCode = error.response?.status as number | undefined
    const requestUrl = originalRequest?.url ?? ''
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh')

    if (statusCode !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshSession()
    }

    const refreshedSession = await refreshPromise
    refreshPromise = null

    if (!refreshedSession) {
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${refreshedSession.accessToken}`
    return apiClient(originalRequest)
  },
)

async function refreshSession(): Promise<AuthSession | null> {
  try {
    const currentSession = getStoredAuthSession()
    if (!currentSession?.refreshToken) {
      clearStoredAuthSession()
      return null
    }

    const response = await refreshClient.post('/auth/refresh', {
      refreshToken: currentSession.refreshToken,
    })

    const nextSession = authSessionSchema.parse(response.data)
    setStoredAuthSession(nextSession)
    return nextSession
  } catch {
    clearStoredAuthSession()
    return null
  }
}
