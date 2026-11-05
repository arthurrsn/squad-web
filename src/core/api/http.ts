import { perderSessao, tokenDaSessao } from '../sessao.ts'

const TIMEOUT_MS = 10_000

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

async function chamar<T>(metodo: string, caminho: string, dados?: unknown, sinal?: AbortSignal): Promise<T> {
  const token = tokenDaSessao()
  const headers: Record<string, string> = {}
  if (dados !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const tempo = AbortSignal.timeout(TIMEOUT_MS)
  const res = await fetch(`${import.meta.env.VITE_API_URL}${caminho}`, {
    method: metodo,
    headers,
    body: dados === undefined ? undefined : JSON.stringify(dados),
    signal: sinal ? AbortSignal.any([tempo, sinal]) : tempo,
  })
  const body = await res.json().catch(() => null)
  if (res.status === 401 && token) perderSessao()
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

export const get = <T>(caminho: string, sinal?: AbortSignal) => chamar<T>('GET', caminho, undefined, sinal)
export const post = <T>(caminho: string, dados: unknown) => chamar<T>('POST', caminho, dados)
export const put = <T>(caminho: string, dados: unknown) => chamar<T>('PUT', caminho, dados)
export const del = (caminho: string) => chamar<void>('DELETE', caminho)
