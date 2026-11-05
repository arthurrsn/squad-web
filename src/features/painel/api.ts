import { get, post, put } from '../../core/api/http.ts'

export type Esporte = 'FUTEBOL' | 'VOLEI' | 'FUTEVOLEI'

export type Janela = { diaDaSemana: number; abre: string; fecha: string }

export type Quadra = {
  id: string
  localId: string
  nome: string
  esportes: Esporte[]
  duracaoMinutos: number
  valorHoraCentavos: number | null
  grade: Janela[]
}

export type Local = { id: string; nome: string; endereco: string; latitude: number; longitude: number; quadras: Quadra[] }

export const entrar = (email: string, senha: string) => post<{ token?: unknown } | null>('/auth/login', { email, senha })

export const sair = () => post<void>('/auth/logout', {})

export const meusLocais = (sinal?: AbortSignal) => get<Local[]>('/locais/meus', sinal)

export type LocalInformado = { nome: string; endereco: string; latitude: number; longitude: number }

export type QuadraInformada = {
  nome: string
  esportes: Esporte[]
  duracaoMinutos: number
  valorHoraCentavos: number | null
  grade: Janela[]
}

export const criarLocal = (local: LocalInformado) => post<unknown>('/locais', local)

export const editarLocal = (localId: string, local: LocalInformado) => put<unknown>(`/locais/${localId}`, local)

export const criarQuadra = (localId: string, quadra: QuadraInformada) =>
  post<unknown>(`/locais/${localId}/quadras`, quadra)

export const editarQuadra = (localId: string, quadraId: string, quadra: QuadraInformada) =>
  put<unknown>(`/locais/${localId}/quadras/${quadraId}`, quadra)
