import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  diasDaSemana,
  intervaloDoBloqueio,
  quemReservou,
  textoDaReserva,
  textoDoCancelamento,
  type Item,
} from './agenda.ts'
import type { ReservaNaAgenda } from './api.ts'

const ana = { userId: 'u1', nome: 'Ana', sobrenome: 'Souza', arroba: 'ana.souza' }

function reserva(id: string, inicio: string, fim: string, extra: Partial<ReservaNaAgenda> = {}): ReservaNaAgenda {
  return {
    id,
    inicio,
    fim,
    origem: 'PARTIDA',
    partidaId: 'p1',
    jogoId: null,
    reservadoPor: ana,
    criadaEm: inicio,
    canceladaEm: null,
    canceladaPor: null,
    motivo: null,
    ...extra,
  }
}

const id = (item: Item) => (item.tipo === 'reserva' ? item.reserva.id : item.bloqueio.id)

test('agrupa por dia em São Paulo e ordena pela hora', () => {
  const dias = diasDaSemana(
    {
      reservas: [
        reserva('r2', '2026-11-09T23:00:00Z', '2026-11-10T00:00:00Z'),
        reserva('r1', '2026-11-09T21:00:00Z', '2026-11-09T22:00:00Z'),
        reserva('r3', '2026-11-15T13:00:00Z', '2026-11-15T14:00:00Z'),
      ],
      bloqueios: [{ id: 'b1', inicio: '2026-11-07T11:00:00Z', fim: '2026-11-10T11:00:00Z', motivo: 'Feriado' }],
    },
    '2026-11-09',
  )
  assert.equal(dias.length, 7)
  assert.equal(dias[0].dia, '2026-11-09')
  assert.deepEqual(dias[0].itens.map(id), ['b1', 'r1', 'r2'])
  assert.deepEqual(dias[1].itens, [])
  assert.deepEqual(dias[6].itens.map(id), ['r3'])
})

test('texto da reserva e de quem reservou', () => {
  assert.equal(
    textoDaReserva(reserva('r', '2026-11-09T22:00:00Z', '2026-11-09T23:00:00Z')),
    '19:00 às 20:00 · Partida · Ana Souza (@ana.souza)',
  )
  assert.equal(
    textoDaReserva(reserva('r', '2026-11-10T01:30:00Z', '2026-11-10T03:00:00Z', { origem: 'JOGO' })),
    '22:30 às 24:00 · Jogo de campeonato · Ana Souza (@ana.souza)',
  )
  assert.equal(quemReservou({ userId: 'u2', nome: null, sobrenome: null, arroba: null }), 'Conta apagada')
})

test('quem cancelou a reserva', () => {
  const cancelada = (extra: Partial<ReservaNaAgenda>) =>
    textoDoCancelamento(
      reserva('r', '2026-11-14T22:00:00Z', '2026-11-14T23:00:00Z', { canceladaEm: '2026-11-13T21:40:00Z', ...extra }),
    )
  assert.equal(cancelada({ canceladaPor: 'ORGANIZADOR' }), 'pelo organizador em 13/11 às 18:40')
  assert.equal(
    cancelada({ canceladaPor: 'DONO', motivo: 'manutenção no piso' }),
    'pela quadra em 13/11 às 18:40: manutenção no piso',
  )
  assert.equal(cancelada({ canceladaPor: 'DONO' }), 'pela quadra em 13/11 às 18:40')
  assert.equal(cancelada({ canceladaPor: 'TROCA' }), 'remarcada pelo organizador em 13/11 às 18:40')
  assert.equal(textoDoCancelamento(reserva('r', '2026-11-14T22:00:00Z', '2026-11-14T23:00:00Z')), '')
})

test('intervalo do bloqueio', () => {
  const bloqueio = (inicio: string, fim: string) => intervaloDoBloqueio({ id: 'b', inicio, fim, motivo: null })
  assert.equal(bloqueio('2026-11-09T15:00:00Z', '2026-11-09T17:00:00Z'), '12:00 às 14:00')
  assert.equal(bloqueio('2026-11-15T11:00:00Z', '2026-11-16T03:00:00Z'), '08:00 às 24:00')
  assert.equal(bloqueio('2026-11-15T11:00:00Z', '2026-11-18T02:00:00Z'), '15/11 08:00 até 17/11 23:00')
})
