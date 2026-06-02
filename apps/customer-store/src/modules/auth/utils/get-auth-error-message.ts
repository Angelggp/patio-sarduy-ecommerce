import axios from 'axios'

export function getAuthErrorMessage(
  error: unknown,
  fallback = 'No se pudo completar la operación. Verifica los datos e intenta de nuevo.',
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
    if (Array.isArray(message) && message.length > 0) {
      return message.join(' ')
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
