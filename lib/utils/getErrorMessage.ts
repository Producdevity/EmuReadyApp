import { isString, isObjectType } from 'remeda'

export function getErrorMessage(error: unknown, fallback?: string): string {
  const fallbackMessage = fallback || 'An unknown error occurred'

  if (!error) return fallbackMessage

  if (error instanceof Error) return error.message || fallbackMessage

  if (isString(error)) return error ? error : fallbackMessage

  if (isObjectType<{ message?: string }>(error) && 'message' in error) {
    return error.message || fallbackMessage
  }

  return fallbackMessage
}
