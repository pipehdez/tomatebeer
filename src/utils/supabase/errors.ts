import type { ErrorResponse } from '@/types/request'

// Causas comunes para clasificar errores de Supabase
export type ErrorCause = 'auth' | 'db' | 'storage' | 'network' | 'unknown'

// Mapea errores de Supabase (Auth, PostgREST, Storage) a un formato uniforme
export function mapSupabaseError(error: unknown): { message: string; code?: string; status?: number; cause: ErrorCause } {
  // PostgREST error: { message, details?, hint?, code, ... }
  const maybePg = error as { message?: string; code?: string; details?: string; hint?: string; status?: number; name?: string }

  // Auth error: { message, status, code? }
  const maybeAuth = error as { message?: string; status?: number; code?: string; name?: string }

  // Storage error: { message, statusCode? }
  const maybeStorage = error as { message?: string; statusCode?: number; name?: string }

  const message = maybePg?.message || maybeAuth?.message || maybeStorage?.message || (error instanceof Error ? error.message : 'Unexpected error')
  const code = maybePg?.code || maybeAuth?.code
  const status = maybePg?.status ?? maybeAuth?.status ?? maybeStorage?.statusCode

  let cause: ErrorCause = 'unknown'
  const name = (maybePg?.name || maybeAuth?.name || maybeStorage?.name || '')?.toLowerCase()
  if (name.includes('auth') || typeof maybeAuth?.status === 'number') cause = 'auth'
  else if (name.includes('storage') || typeof maybeStorage?.statusCode === 'number') cause = 'storage'
  else if (code || name.includes('postgrest') || typeof maybePg?.status === 'number') cause = 'db'

  return { message, code, status, cause }
}

// Crea un ErrorResponse y registra detalles para diagnóstico
export function createErrorResponse(error: unknown, fallbackMessage = 'Ha ocurrido un error inesperado'): ErrorResponse {
  const mapped = mapSupabaseError(error)
  // Log estructurado (puedes cambiar a tu logger)
  // Evita exponer detalles al usuario final, solo registra en consola
  console.error(`[Supabase:${mapped.cause}]`, { code: mapped.code, status: mapped.status, error })

  return {
    success: 404,
    error: mapped.message || fallbackMessage,
  }
}