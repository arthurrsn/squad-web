import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError } from '../../core/api/http.ts'
import {
  ALVOS_POR_VEZ,
  SEM_SERVIDOR,
  fotoDaCopia,
  lerFila,
  mensagemDoErro,
  nomeDoAutor,
  quando,
  textoDaConfirmacao,
  textosDaCopia,
  tituloDaFila,
  tituloDoCartao,
  type Cartao,
} from './fila.ts'

const perfil = {
  alvo: 'PERFIL',
  alvoId: 'u1',
  titulo: 'Ana Souza',
  autor: { userId: 'u1', nome: 'Ana', sobrenome: 'Souza', arroba: 'ana', fotoUrl: null },
  copia: { nome: 'Ana', sobrenome: 'Souza', arroba: 'ana', bio: 'Bio ruim', foto: 'https://fotos.squad/p/1.jpg' },
  denuncias: [
    { motivo: 'OFENSA', comentario: null, criadaEm: '2026-11-12T13:00:00Z' },
    { motivo: 'OUTRO', comentario: 'Xingou no chat', criadaEm: '2026-11-12T14:30:00Z' },
  ],
}

test('lê a fila e deixa de fora o que não dá para mostrar', () => {
  const fila = lerFila({
    alvos: [perfil, { alvo: 'ESTRANHO', alvoId: 'x' }, { alvo: 'TIME' }, null, { alvo: 'TIME', alvoId: 't1', copia: 3 }],
  })
  assert.equal(fila.length, 2)
  assert.equal(fila[0].denuncias.length, 2)
  assert.deepEqual(fila[1], {
    alvo: 'TIME',
    alvoId: 't1',
    titulo: null,
    autor: { nome: null, sobrenome: null, arroba: null, fotoUrl: null },
    copia: {},
    denuncias: [],
  })
  assert.deepEqual(lerFila(null), [])
  assert.deepEqual(lerFila({ alvos: 'nada' }), [])
})

test('o título da fila soma as denúncias e marca quando pode haver mais alvos', () => {
  const [cartao] = lerFila({ alvos: [perfil] })
  assert.equal(tituloDaFila([cartao]), 'Denúncias abertas (2)')
  assert.equal(tituloDaFila(Array.from({ length: ALVOS_POR_VEZ }, () => cartao)), 'Denúncias abertas (100+)')
  assert.equal(tituloDaFila([]), 'Denúncias abertas (0)')
})

test('o cartão mostra o @ do perfil, o autor ou Conta apagada, e a cópia sem os vazios', () => {
  const [cartao] = lerFila({ alvos: [perfil] })
  assert.equal(tituloDoCartao(cartao), 'Ana Souza · @ana')
  const time: Cartao = { ...cartao, alvo: 'TIME', titulo: '  ' }
  assert.equal(tituloDoCartao(time), 'Sem nome')
  assert.equal(nomeDoAutor(cartao.autor), 'Ana Souza (@ana)')
  assert.equal(nomeDoAutor({ nome: null, sobrenome: null, arroba: null, fotoUrl: null }), 'Conta apagada')
  assert.deepEqual(textosDaCopia({ nome: 'Racha', localNome: 'Arena', observacao: null, pagamento: ' ', foto: 'x' }), [
    { rotulo: 'Nome', valor: 'Racha' },
    { rotulo: 'Local', valor: 'Arena' },
  ])
  assert.equal(fotoDaCopia(cartao.copia), 'https://fotos.squad/p/1.jpg')
  assert.equal(fotoDaCopia({ foto: 'javascript:alert(1)' }), null)
  assert.equal(fotoDaCopia({}), null)
})

test('a data sai no fuso de São Paulo', () => {
  assert.equal(quando('2026-11-12T13:00:00Z'), '12/11/2026 às 10:00')
  assert.equal(quando('ontem'), '')
})

test('a confirmação diz o que acontece em cada alvo', () => {
  assert.equal(textoDaConfirmacao('arquivar', 'PARTIDA'), 'As denúncias saem da fila e nada muda no conteúdo.')
  assert.equal(textoDaConfirmacao('remover', 'PERFIL'), 'A bio e a foto saem do perfil. O nome e o @ continuam.')
  assert.match(textoDaConfirmacao('remover', 'PARTIDA'), /^Se a partida ainda não começou, ela é cancelada/)
  assert.match(textoDaConfirmacao('remover', 'CAMPEONATO'), /^Se o campeonato está em inscrições ou em andamento/)
  assert.match(textoDaConfirmacao('remover', 'TIME'), /^Nas inscrições, o time sai do campeonato/)
})

test('erros: a mensagem do servidor nos de negócio, e nada técnico nos outros', () => {
  const resolvida = new ApiError(404, { codigo: 'SEM_DENUNCIA_ABERTA', mensagem: 'Essas denúncias já foram resolvidas.' })
  assert.equal(mensagemDoErro(resolvida), 'Essas denúncias já foram resolvidas.')
  assert.equal(mensagemDoErro(new ApiError(429, null)), 'Muitas tentativas. Espera um pouco e tenta de novo.')
  assert.equal(mensagemDoErro(new ApiError(500, { mensagem: 'NullPointerException' })), SEM_SERVIDOR)
  assert.equal(mensagemDoErro(new TypeError('Failed to fetch')), SEM_SERVIDOR)
})
