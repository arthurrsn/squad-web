import { del, get, post, put } from '../../core/api/http.ts'

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

export type Pessoa = { userId: string; nome: string | null; sobrenome: string | null; arroba: string | null }

export type ReservaNaAgenda = {
  id: string
  inicio: string
  fim: string
  origem: 'PARTIDA' | 'JOGO'
  partidaId: string | null
  jogoId: string | null
  reservadoPor: Pessoa
  criadaEm: string
  canceladaEm: string | null
  canceladaPor: 'ORGANIZADOR' | 'DONO' | 'TROCA' | null
  motivo: string | null
}

export type Bloqueio = { id: string; inicio: string; fim: string; motivo: string | null }

export type Agenda = { reservas: ReservaNaAgenda[]; bloqueios: Bloqueio[] }

export const agendaDaSemana = (quadraId: string, segunda: string, sinal?: AbortSignal) =>
  get<Partial<Agenda> | null>(`/quadras/${quadraId}/agenda?de=${segunda}&dias=7`, sinal)

export const bloquear = (quadraId: string, bloqueio: { inicio: string; fim: string; motivo: string | null }) =>
  post<unknown>(`/quadras/${quadraId}/bloqueios`, bloqueio)

export const desbloquear = (quadraId: string, bloqueioId: string) => del(`/quadras/${quadraId}/bloqueios/${bloqueioId}`)

export const cancelarReserva = (reservaId: string, motivo: string | null) =>
  post<unknown>(`/reservas/${reservaId}/cancelamento`, { motivo })
