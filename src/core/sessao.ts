const CHAVE = 'squad.sessao'

let aoPerder = () => {}

export function tokenDaSessao(): string | null {
  return sessionStorage.getItem(CHAVE)
}

export function guardarSessao(token: string) {
  sessionStorage.setItem(CHAVE, token)
}

export function limparSessao() {
  sessionStorage.removeItem(CHAVE)
}

export function quandoPerderSessao(funcao: () => void): () => void {
  aoPerder = funcao
  return () => {
    aoPerder = () => {}
  }
}

export function perderSessao() {
  limparSessao()
  aoPerder()
}
