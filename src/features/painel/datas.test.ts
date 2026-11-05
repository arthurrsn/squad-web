import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  dataHoraCurta,
  diaEmSaoPaulo,
  diaValido,
  hojeEmSaoPaulo,
  horaEmSaoPaulo,
  nomeDoDia,
  paraInstante,
  segundaDaSemana,
  somarDias,
  tituloDaSemana,
} from './datas.ts'

process.env.TZ = 'Asia/Tokyo'

test('segunda da semana e soma de dias', () => {
  assert.equal(segundaDaSemana('2026-11-05'), '2026-11-02')
  assert.equal(segundaDaSemana('2026-11-08'), '2026-11-02')
  assert.equal(segundaDaSemana('2026-11-09'), '2026-11-09')
  assert.equal(segundaDaSemana('2026-12-01'), '2026-11-30')
  assert.equal(somarDias('2026-11-30', 7), '2026-12-07')
  assert.equal(somarDias('2026-11-02', -7), '2026-10-26')
})

test('datas inválidas', () => {
  assert.equal(diaValido('2026-11-09'), true)
  assert.equal(diaValido('2026-02-30'), false)
  assert.equal(diaValido('2026-11-9'), false)
  assert.equal(diaValido(null), false)
})

test('dia e hora no fuso de São Paulo, num computador noutro fuso', () => {
  const quaseMeiaNoite = '2026-11-10T02:30:00Z'
  assert.equal(diaEmSaoPaulo(quaseMeiaNoite), '2026-11-09')
  assert.equal(horaEmSaoPaulo(quaseMeiaNoite), '23:30')
  assert.equal(hojeEmSaoPaulo(new Date(quaseMeiaNoite)), '2026-11-09')
  assert.equal(dataHoraCurta('2026-11-13T21:40:00Z'), '13/11 às 18:40')
})

test('nome do dia e título da semana', () => {
  assert.equal(nomeDoDia('2026-11-09'), 'Segunda, 9/11')
  assert.equal(nomeDoDia('2026-11-15'), 'Domingo, 15/11')
  assert.equal(tituloDaSemana('2026-11-09'), '9 a 15 de novembro')
  assert.equal(tituloDaSemana('2026-11-30'), '30 de novembro a 6 de dezembro')
})

test('data e hora do bloqueio vão com -03:00', () => {
  assert.equal(paraInstante('2026-11-15T08:00'), '2026-11-15T08:00:00-03:00')
  assert.equal(paraInstante(''), undefined)
})
