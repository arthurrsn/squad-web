import { del, get, post } from '../../core/api/http.ts'
import type { DadosDaPunicao } from './contas.ts'
import type { Alvo, Parte } from './fila.ts'

export const entrar = (email: string, senha: string) => post<{ token?: unknown } | null>('/auth/login', { email, senha })

export const sair = () => post<void>('/auth/logout', {})

export const buscarFila = (sinal?: AbortSignal) => get<unknown>('/admin/denuncias', sinal)

export const arquivar = (alvo: Alvo, alvoId: string) => post<void>('/admin/denuncias/arquivar', { alvo, alvoId })

/** Sem {@code partes}, o servidor tira a bio e a foto, como antes de as partes existirem. */
export const remover = (alvo: Alvo, alvoId: string, partes?: Parte[]) =>
  post<void>('/admin/denuncias/remover', alvo === 'PERFIL' && partes ? { alvo, alvoId, partes } : { alvo, alvoId })

export const suspenderPelaFila = (alvo: Alvo, alvoId: string, d: DadosDaPunicao) =>
  post<void>('/admin/denuncias/suspender', {
    alvo,
    alvoId,
    dias: d.dias,
    motivo: d.motivo,
    nota: d.nota.trim() || null,
    ...(alvo === 'PERFIL' ? { partes: d.partes } : {}),
  })

export const banirPelaFila = (alvo: Alvo, alvoId: string, d: DadosDaPunicao) =>
  post<void>('/admin/denuncias/banir', { alvo, alvoId, motivo: d.motivo, nota: d.nota.trim() || null })

export const buscarConta = (busca: string, sinal?: AbortSignal) =>
  get<unknown>(`/admin/contas?busca=${encodeURIComponent(busca)}`, sinal)

export const suspender = (userId: string, d: DadosDaPunicao) =>
  post<void>(`/admin/contas/${encodeURIComponent(userId)}/suspensao`, {
    dias: d.dias,
    motivo: d.motivo,
    nota: d.nota.trim() || null,
  })

export const encerrarSuspensao = (userId: string) => del(`/admin/contas/${encodeURIComponent(userId)}/suspensao`)

export const banir = (userId: string, d: DadosDaPunicao) =>
  post<void>(`/admin/contas/${encodeURIComponent(userId)}/banimento`, { motivo: d.motivo, nota: d.nota.trim() || null })
