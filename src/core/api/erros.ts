import { ApiError } from './http.ts'

type CorpoErro = { codigo?: unknown; campos?: unknown }

export function codigoDoErro(e: unknown): string | undefined {
  const codigo = e instanceof ApiError ? (e.body as CorpoErro | null)?.codigo : undefined
  return typeof codigo === 'string' ? codigo : undefined
}

export function erroDoCampo(e: unknown, campo: string): string | undefined {
  const campos = e instanceof ApiError ? (e.body as CorpoErro | null)?.campos : undefined
  const msg = campos && typeof campos === 'object' ? (campos as Record<string, unknown>)[campo] : undefined
  return typeof msg === 'string' ? msg : undefined
}
