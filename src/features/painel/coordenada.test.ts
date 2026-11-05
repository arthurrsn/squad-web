import assert from 'node:assert/strict'
import { test } from 'node:test'
import { lerCoordenada, linkDoMapa, textoDaCoordenada } from './coordenada.ts'

test('aceita a coordenada como o Google Maps copia e com vírgula decimal', () => {
  const esperada = { latitude: -25.4284, longitude: -49.2733 }
  assert.deepEqual(lerCoordenada('-25.4284, -49.2733'), esperada)
  assert.deepEqual(lerCoordenada('  -25.4284 -49.2733 '), esperada)
  assert.deepEqual(lerCoordenada('-25,4284 -49,2733'), esperada)
  assert.deepEqual(lerCoordenada('-25,4284; -49,2733'), esperada)
})

test('recusa texto que não é coordenada e coordenada fora da faixa', () => {
  assert.deepEqual(lerCoordenada('Rua XV, 700'), { erro: 'Cole a coordenada como -25.4284, -49.2733.' })
  assert.deepEqual(lerCoordenada(''), { erro: 'Cole a coordenada como -25.4284, -49.2733.' })
  assert.deepEqual(lerCoordenada('91, -49.2733'), { erro: 'A latitude vai de -90 a 90 e a longitude de -180 a 180.' })
})

test('texto e link a partir dos números', () => {
  assert.equal(textoDaCoordenada(-25.4284, -49.2733), '-25.4284, -49.2733')
  assert.equal(linkDoMapa(-25.4284, -49.2733), 'https://www.google.com/maps?q=-25.4284,-49.2733')
})
