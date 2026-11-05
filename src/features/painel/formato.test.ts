import assert from 'node:assert/strict'
import { test } from 'node:test'
import { lerValor, nomeDoEsporte, textoDoValor, valorPorHora } from './formato.ts'

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

test('lê o valor por hora digitado', () => {
  assert.deepEqual(lerValor(''), { centavos: null })
  assert.deepEqual(lerValor('120'), { centavos: 12000 })
  assert.deepEqual(lerValor('120,5'), { centavos: 12050 })
  assert.deepEqual(lerValor(' 120,00 '), { centavos: 12000 })
  assert.deepEqual(lerValor('R$ 1.000,00'), { centavos: 100000 })
  assert.deepEqual(lerValor('0,01'), { centavos: 1 })
  assert.deepEqual(lerValor('0'), { erro: 'O valor vai de R$ 0,01 a R$ 1.000,00.' })
  assert.deepEqual(lerValor('1000,01'), { erro: 'O valor vai de R$ 0,01 a R$ 1.000,00.' })
  assert.deepEqual(lerValor('cem'), { erro: 'Use o valor como 120,00.' })
  assert.deepEqual(lerValor('120.50'), { erro: 'Use o valor como 120,00.' })
})

test('valor para preencher a edição', () => {
  assert.equal(textoDoValor(12000), '120,00')
  assert.equal(textoDoValor(12050), '120,50')
})
