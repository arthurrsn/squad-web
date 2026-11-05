import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError } from '../../core/api/http.ts'
import { SEM_SERVIDOR, mensagemDoErro } from './erros.ts'

test('mostra a mensagem do servidor nos erros de negócio', () => {
  const repetida = new ApiError(409, { codigo: 'QUADRA_REPETIDA', mensagem: 'Já tem uma quadra com esse nome nesse local.' })
  assert.equal(mensagemDoErro(repetida), 'Já tem uma quadra com esse nome nesse local.')
  assert.equal(mensagemDoErro(new ApiError(429, null)), 'Muitas tentativas. Espera um pouco e tenta de novo.')
})

test('esconde o detalhe técnico e a falha de rede', () => {
  assert.equal(mensagemDoErro(new ApiError(500, { mensagem: 'NullPointerException' })), SEM_SERVIDOR)
  assert.equal(mensagemDoErro(new TypeError('Failed to fetch')), SEM_SERVIDOR)
  assert.equal(mensagemDoErro(new ApiError(400, { mensagem: 42 })), 'Algo deu errado. Tenta de novo.')
})
