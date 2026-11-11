import { codigoDoErro } from '../../core/api/erros.ts'
import { ApiError, postComToken } from '../../core/api/http.ts'

export const SEM_SERVIDOR = 'Não deu pra falar com o servidor. Confere a conexão e tenta de novo.'

/** Entra com o e-mail e a senha e exclui com o token na memória. Se a exclusão falhar, a sessão aberta é encerrada. */
export async function excluirConta(email: string, senha: string): Promise<void> {
  const login = await postComToken<{ token?: unknown } | null>('/auth/login', { email, senha }, null)
  if (typeof login?.token !== 'string') throw new ApiError(500, null)
  try {
    await postComToken<void>('/auth/delete-account', { senha }, login.token)
  } catch (erro) {
    await postComToken<void>('/auth/logout', {}, login.token).catch(() => undefined)
    throw erro
  }
}

export function mensagemDaExclusao(e: unknown): string {
  const codigo = codigoDoErro(e)
  // A mesma mensagem para os dois: a página não revela se o erro foi no e-mail ou na senha.
  if (codigo === 'CREDENCIAIS_INVALIDAS' || codigo === 'SENHA_INCORRETA') return 'E-mail ou senha inválidos.'
  if (codigo === 'EMAIL_NAO_VERIFICADO') {
    return 'Esta conta ainda não foi confirmada. Confirme o e-mail no app para entrar e excluir.'
  }
  if (!(e instanceof ApiError) || e.status >= 500) return SEM_SERVIDOR
  if (e.status === 429) return 'Muitas tentativas. Espera um pouco e tenta de novo.'
  return 'Algo deu errado. Tenta de novo.'
}
