import { type AuthSession, type UserRole, authSessionSchema } from '@/modules/auth/types/auth.types'

const AUTH_SESSION_STORAGE_KEY = 'patio_sarduy_auth_session'

export function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    return authSessionSchema.parse(parsed)
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

export function getDefaultRouteByRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/inventario'
    case 'ASSISTANT':
      return '/admin/inventario'
    case 'STUDENT':
      return '/admin/inventario'
    default:
      return '/login'
  }
}
