import { ApiError } from '../../core/api/http.ts'

export const SEM_SERVIDOR = 'Não deu pra falar com o servidor. Confere a conexão e tenta de novo.'

export function mensagemDoErro(e: unknown): string {
  if (!(e instanceof ApiError) || e.status >= 500) return SEM_SERVIDOR
  if (e.status === 429) return 'Muitas tentativas. Espera um pouco e tenta de novo.'
  const mensagem = (e.body as { mensagem?: unknown } | null)?.mensagem
  return typeof mensagem === 'string' && mensagem ? mensagem : 'Algo deu errado. Tenta de novo.'
}
