import { get, post } from '../../core/api/http.ts'
import type { Alvo } from './fila.ts'

export const entrar = (email: string, senha: string) => post<{ token?: unknown } | null>('/auth/login', { email, senha })

export const sair = () => post<void>('/auth/logout', {})

export const buscarFila = (sinal?: AbortSignal) => get<unknown>('/admin/denuncias', sinal)

export const arquivar = (alvo: Alvo, alvoId: string) => post<void>('/admin/denuncias/arquivar', { alvo, alvoId })

export const remover = (alvo: Alvo, alvoId: string) => post<void>('/admin/denuncias/remover', { alvo, alvoId })
