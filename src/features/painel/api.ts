import { get, post } from '../../core/api/http.ts'

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
