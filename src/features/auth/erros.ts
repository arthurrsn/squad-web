import { ApiError } from '../../core/api/http'

export const LINK_INVALIDO = 'Este link é inválido, expirou ou já foi usado. Peça um novo no app.'

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

export function mensagemGeral(e: unknown): string {
  if (!(e instanceof ApiError)) return 'Não deu pra falar com o servidor. Confere a conexão e tenta de novo.'
  if (e.status === 429) return 'Muitas tentativas. Espera um pouco e tenta de novo.'
  if (codigoDoErro(e) === 'LINK_INVALIDO') return LINK_INVALIDO
  return 'Algo deu errado. Tenta de novo.'
}
