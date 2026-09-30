import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validarNovaSenha } from './validacao.ts'

test('valida a nova senha como o servidor', () => {
  assert.deepEqual(validarNovaSenha('12345678', '12345678'), {})
  assert.ok(validarNovaSenha('1234567', '1234567').senha)
  assert.ok(validarNovaSenha('ç'.repeat(40), 'ç'.repeat(40)).senha, '40 caracteres, 80 bytes')
  assert.ok(validarNovaSenha('12345678', '12345679').repetida)
})
