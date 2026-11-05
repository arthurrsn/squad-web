import assert from 'node:assert/strict'
import { test } from 'node:test'
import { daApi, opcoesDeHora, paraApi, periodoNovo, previaDoDia, problemaDoDia } from './grade.ts'

test('a grade vai e volta da API, inclusive até 24:00', () => {
  const janelas = [
    { diaDaSemana: 1, abre: '18:00', fecha: '24:00' },
    { diaDaSemana: 6, abre: '14:00', fecha: '22:00' },
    { diaDaSemana: 6, abre: '08:00', fecha: '12:00' },
  ]
  const grade = daApi(janelas)
  assert.deepEqual(grade[0], [{ abre: 1080, fecha: 1440 }])
  assert.deepEqual(grade[5], [{ abre: 480, fecha: 720 }, { abre: 840, fecha: 1320 }])
  assert.deepEqual(grade[6], [])
  assert.deepEqual(paraApi(grade), [
    { diaDaSemana: 1, abre: '18:00', fecha: '24:00' },
    { diaDaSemana: 6, abre: '08:00', fecha: '12:00' },
    { diaDaSemana: 6, abre: '14:00', fecha: '22:00' },
  ])
})

test('a prévia mostra os horários e a sobra', () => {
  assert.deepEqual(previaDoDia([{ abre: 1080, fecha: 1380 }], 90), [
    '3 horários: 18:00, 19:30 e 21:00',
    'Sobram 30 min no fim do período das 18:00 às 23:00.',
  ])
  assert.deepEqual(previaDoDia([{ abre: 1320, fecha: 1380 }], 90), ['Nenhum horário cabe no período das 22:00 às 23:00.'])
  assert.deepEqual(previaDoDia([{ abre: 1080, fecha: 1200 }, { abre: 480, fecha: 600 }], 60), [
    '4 horários: 08:00, 09:00, 18:00 e 19:00',
  ])
  assert.deepEqual(previaDoDia([{ abre: 1380, fecha: 1440 }], 60), ['1 horário: 23:00'])
  assert.deepEqual(previaDoDia([], 60), [])
})

test('períodos que se sobrepõem são recusados; os que se tocam passam', () => {
  assert.equal(problemaDoDia([{ abre: 600, fecha: 600 }]), 'O horário de abrir vem antes do de fechar.')
  assert.equal(
    problemaDoDia([{ abre: 480, fecha: 720 }, { abre: 660, fecha: 900 }]),
    'Os horários de um mesmo dia não podem se sobrepor.',
  )
  assert.equal(problemaDoDia([{ abre: 480, fecha: 720 }, { abre: 720, fecha: 900 }]), undefined)
})

test('período novo e lista de horas', () => {
  assert.deepEqual(periodoNovo([]), { abre: 480, fecha: 1320 })
  assert.deepEqual(periodoNovo([{ abre: 480, fecha: 720 }]), { abre: 720, fecha: 1440 })
  assert.deepEqual(periodoNovo([{ abre: 480, fecha: 1440 }]), { abre: 1410, fecha: 1440 })
  const opcoes = opcoesDeHora(0, 1410, 495)
  assert.equal(opcoes.length, 49)
  assert.ok(opcoes.includes(495))
  assert.equal(opcoesDeHora(30, 1440, 60).length, 48)
})
