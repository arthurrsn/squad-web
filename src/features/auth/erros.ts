import { ApiError } from '../../core/api/http'
import { codigoDoErro } from '../../core/api/erros'

export const LINK_INVALIDO = 'Este link é inválido, expirou ou já foi usado. Peça um novo no app.'

export function mensagemGeral(e: unknown): string {
  if (!(e instanceof ApiError)) return 'Não deu pra falar com o servidor. Confere a conexão e tenta de novo.'
  if (e.status === 429) return 'Muitas tentativas. Espera um pouco e tenta de novo.'
  if (codigoDoErro(e) === 'LINK_INVALIDO') return LINK_INVALIDO
  return 'Algo deu errado. Tenta de novo.'
}
