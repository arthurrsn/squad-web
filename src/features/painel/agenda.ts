import type { Agenda, Bloqueio, Pessoa, ReservaNaAgenda } from './api.ts'
import { dataHoraCurta, diaEMes, diaEmSaoPaulo, horaEmSaoPaulo, somarDias } from './datas.ts'

export type Item = { tipo: 'reserva'; reserva: ReservaNaAgenda } | { tipo: 'bloqueio'; bloqueio: Bloqueio }

export function diasDaSemana(agenda: Agenda, segunda: string): { dia: string; itens: Item[] }[] {
  const dias = Array.from({ length: 7 }, (_, i) => ({ dia: somarDias(segunda, i), itens: [] as Item[] }))
  const doDia = (dia: string) => dias.find((d) => d.dia === dia)
  for (const reserva of agenda.reservas) {
    doDia(diaEmSaoPaulo(reserva.inicio))?.itens.push({ tipo: 'reserva', reserva })
  }
  for (const bloqueio of agenda.bloqueios) {
    const dia = diaEmSaoPaulo(bloqueio.inicio)
    doDia(dia < segunda ? segunda : dia)?.itens.push({ tipo: 'bloqueio', bloqueio })
  }
  const inicio = (item: Item) => Date.parse(item.tipo === 'reserva' ? item.reserva.inicio : item.bloqueio.inicio)
  for (const dia of dias) dia.itens.sort((a, b) => inicio(a) - inicio(b))
  return dias
}

export function quemReservou(pessoa: Pessoa): string {
  const nome = [pessoa.nome, pessoa.sobrenome].filter(Boolean).join(' ')
  if (!nome) return 'Conta apagada'
  return pessoa.arroba ? `${nome} (@${pessoa.arroba})` : nome
}

export function textoDaReserva(reserva: ReservaNaAgenda): string {
  const origem = reserva.origem === 'JOGO' ? 'Jogo de campeonato' : 'Partida'
  const horario = `${horaEmSaoPaulo(reserva.inicio)} às ${horaFinal(reserva.inicio, reserva.fim)}`
  return `${horario} · ${origem} · ${quemReservou(reserva.reservadoPor)}`
}

export function textoDoCancelamento(reserva: ReservaNaAgenda): string {
  if (!reserva.canceladaEm) return ''
  const quando = dataHoraCurta(reserva.canceladaEm)
  if (reserva.canceladaPor === 'DONO') return `pela quadra em ${quando}${reserva.motivo ? `: ${reserva.motivo}` : ''}`
  if (reserva.canceladaPor === 'TROCA') return `remarcada pelo organizador em ${quando}`
  return `pelo organizador em ${quando}`
}

export function intervaloDoBloqueio(bloqueio: Bloqueio): string {
  const { inicio, fim } = bloqueio
  const final = horaFinal(inicio, fim)
  if (diaEmSaoPaulo(inicio) === diaEmSaoPaulo(fim) || final === '24:00') {
    return `${horaEmSaoPaulo(inicio)} às ${final}`
  }
  return `${diaEMes(inicio)} ${horaEmSaoPaulo(inicio)} até ${diaEMes(fim)} ${horaEmSaoPaulo(fim)}`
}

function horaFinal(inicio: string, fim: string): string {
  const meiaNoiteSeguinte = diaEmSaoPaulo(fim) === somarDias(diaEmSaoPaulo(inicio), 1) && horaEmSaoPaulo(fim) === '00:00'
  return meiaNoiteSeguinte ? '24:00' : horaEmSaoPaulo(fim)
}
