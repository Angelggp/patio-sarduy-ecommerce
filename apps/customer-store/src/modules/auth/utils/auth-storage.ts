import { type AuthSession, authSessionSchema } from '@/modules/auth/types/auth.types'

const AUTH_SESSION_STORAGE_KEY = 'patio_sarduy_customer_auth_session'

export function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }

    return authSessionSchema.parse(JSON.parse(raw))
  } catch {
    return null
  }
}

export function setStoredAuthSession(session: AuthSession): void {
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredAuthSession(): void {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}
