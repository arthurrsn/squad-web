import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rotaDoPainel } from './rotas.ts'

test('reconhece os caminhos do painel', () => {
  assert.deepEqual(rotaDoPainel('/painel'), { tela: 'locais' })
  assert.deepEqual(rotaDoPainel('/painel/'), { tela: 'locais' })
  assert.deepEqual(rotaDoPainel('/painel/entrar'), { tela: 'entrar' })
  assert.deepEqual(rotaDoPainel('/painel/locais/novo'), { tela: 'novoLocal' })
  assert.deepEqual(rotaDoPainel('/painel/locais/a1'), { tela: 'local', localId: 'a1' })
  assert.deepEqual(rotaDoPainel('/painel/locais/a1/quadras/nova'), { tela: 'novaQuadra', localId: 'a1' })
  assert.deepEqual(rotaDoPainel('/painel/locais/a1/quadras/q1'), { tela: 'quadra', localId: 'a1', quadraId: 'q1' })
  assert.deepEqual(rotaDoPainel('/painel/quadras/q1/agenda?de=2026-11-09'), {
    tela: 'agenda',
    quadraId: 'q1',
    de: '2026-11-09',
  })
  assert.deepEqual(rotaDoPainel('/painel/quadras/q1/agenda'), { tela: 'agenda', quadraId: 'q1', de: null })
})

test('caminho desconhecido vira página não encontrada', () => {
  for (const caminho of ['/painel/x', '/painel/locais', '/painel/locais/a1/quadras', '/painel/quadras/q1', '/painel/entrar/x']) {
    assert.deepEqual(rotaDoPainel(caminho), { tela: 'naoEncontrada' }, caminho)
  }
})
