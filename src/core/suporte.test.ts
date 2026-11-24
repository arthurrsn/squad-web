import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONTATO_DE_SUPORTE, emailValido, linkDoSuporte } from './suporte.ts'

test('sem contato, ou com um contato que não é e-mail, não há link', () => {
  assert.equal(linkDoSuporte(null, 'Ajuda com a Squad'), null)
  assert.equal(linkDoSuporte('suporte', 'Ajuda com a Squad'), null)
})

test('o link do suporte leva o assunto codificado, com o espaço como %20', () => {
  assert.equal(
    linkDoSuporte('suporte@squad.test', 'Revisão & exclusão'),
    'mailto:suporte@squad.test?subject=Revis%C3%A3o%20%26%20exclus%C3%A3o',
  )
})

test('o e-mail tem um @, sem espaço, e ponto no domínio', () => {
  assert.equal(emailValido('suporte@squad.test'), true)
  assert.equal(emailValido('suporte@squad'), false)
  assert.equal(emailValido('suporte @squad.test'), false)
  assert.equal(emailValido('suportesquad.test'), false)
})

test('a configuração do suporte está no formato certo', () => {
  assert.ok(CONTATO_DE_SUPORTE === null || emailValido(CONTATO_DE_SUPORTE))
})
