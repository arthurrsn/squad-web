import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nomeDoEsporte, valorPorHora } from './formato.ts'

test('valor por hora em reais', () => {
  assert.equal(valorPorHora(12000), 'R$ 120/h')
  assert.equal(valorPorHora(12050), 'R$ 120,50/h')
  assert.equal(valorPorHora(100000), 'R$ 1.000/h')
  assert.equal(valorPorHora(1), 'R$ 0,01/h')
})

test('nome dos esportes', () => {
  assert.equal(nomeDoEsporte('FUTEBOL'), 'Futebol')
  assert.equal(nomeDoEsporte('VOLEI'), 'Vôlei')
  assert.equal(nomeDoEsporte('FUTEVOLEI'), 'Futevôlei')
})
