import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError } from '../../core/api/http.ts'
import { SEM_SERVIDOR, mensagemDaExclusao } from './excluirConta.ts'

test('e-mail ou senha errados dão a mesma mensagem, sem dizer qual dos dois', () => {
  const login = new ApiError(401, { codigo: 'CREDENCIAIS_INVALIDAS', mensagem: 'E-mail ou senha inválidos.' })
  const exclusao = new ApiError(400, { codigo: 'SENHA_INCORRETA', campos: { senha: 'Senha incorreta.' } })
  assert.equal(mensagemDaExclusao(login), 'E-mail ou senha inválidos.')
  assert.equal(mensagemDaExclusao(exclusao), 'E-mail ou senha inválidos.')
})

test('conta sem o e-mail confirmado é mandada para o app', () => {
  const erro = new ApiError(403, { codigo: 'EMAIL_NAO_VERIFICADO' })
  assert.match(mensagemDaExclusao(erro), /Confirme o e-mail no app/)
})

test('limite, falha do servidor, falha de rede e erro desconhecido', () => {
  assert.equal(mensagemDaExclusao(new ApiError(429, null)), 'Muitas tentativas. Espera um pouco e tenta de novo.')
  assert.equal(mensagemDaExclusao(new ApiError(500, { mensagem: 'NullPointerException' })), SEM_SERVIDOR)
  assert.equal(mensagemDaExclusao(new TypeError('Failed to fetch')), SEM_SERVIDOR)
  assert.equal(mensagemDaExclusao(new ApiError(400, { codigo: 'OUTRO' })), 'Algo deu errado. Tenta de novo.')
})
