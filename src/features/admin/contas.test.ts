import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buscaDoEndereco,
  enderecoDaBusca,
  fimDaPunicao,
  lerConta,
  linhaDaPunicao,
  nomeDaConta,
  rotuloDoPapel,
  textoDaSituacao,
  textoDaSuspensao,
  textoDoBanimento,
  textoDoEncerramento,
  type PunicaoNaConta,
} from './contas.ts'

const suspensa = {
  userId: 'u1',
  nome: 'Ana',
  sobrenome: 'Souza',
  arroba: 'ana',
  fotoUrl: null,
  email: 'ana@exemplo.com',
  papel: 'PADRAO',
  situacao: 'SUSPENSA',
  suspensaAte: '2026-11-26T17:00:00Z',
  bloqueadaPor: 3,
  punicoes: [
    {
      tipo: 'SUSPENSAO',
      motivo: 'OFENSA',
      nota: 'Xingou no nome da partida',
      aplicadaPor: 'Marcos',
      aplicadaEm: '2026-11-19T17:00:00Z',
      terminaEm: '2026-11-26T17:00:00Z',
      encerradaPor: null,
      encerradaEm: null,
    },
    { tipo: 'MULTA', motivo: 'OFENSA', aplicadaEm: '2026-11-01T10:00:00Z' },
  ],
}

test('lê a conta e deixa de fora o que não dá para mostrar', () => {
  const conta = lerConta(suspensa)
  assert.ok(conta)
  assert.equal(conta.situacao, 'SUSPENSA')
  assert.equal(conta.bloqueadaPor, 3)
  assert.equal(conta.punicoes.length, 1)
  assert.equal(lerConta({ ...suspensa, situacao: 'SUMIDA' }), null)
  assert.equal(lerConta({ situacao: 'ATIVA' }), null)
  assert.equal(lerConta('nada'), null)
  assert.equal(lerConta({ ...suspensa, bloqueadaPor: -2, punicoes: 'x' })?.bloqueadaPor, 0)
})

test('a busca vai e volta pelo endereço', () => {
  assert.equal(enderecoDaBusca(' ana@exemplo.com '), '/admin/contas?busca=ana%40exemplo.com')
  assert.equal(buscaDoEndereco('/admin/contas?busca=ana%40exemplo.com'), 'ana@exemplo.com')
  assert.equal(buscaDoEndereco('/admin/contas?busca=%40ana'), '@ana')
  assert.equal(buscaDoEndereco('/admin/contas'), '')
})

test('a ficha mostra o nome, o tipo de conta e a situação', () => {
  const conta = lerConta(suspensa)
  assert.ok(conta)
  assert.equal(nomeDaConta(conta), 'Ana Souza · @ana')
  assert.equal(textoDaSituacao(conta), 'Suspensa até 26/11/2026 às 14:00')
  assert.equal(rotuloDoPapel('DONO_QUADRA'), 'Dono de quadra')

  const banida = lerConta({
    ...suspensa,
    nome: null,
    sobrenome: null,
    arroba: null,
    email: null,
    situacao: 'BANIDA',
    suspensaAte: null,
    punicoes: [{ tipo: 'BANIMENTO', motivo: 'GOLPE', aplicadaPor: 'Marcos', aplicadaEm: '2026-11-19T17:00:00Z' }],
  })
  assert.ok(banida)
  assert.equal(nomeDaConta(banida), 'Conta apagada')
  assert.equal(textoDaSituacao(banida), 'Banida em 19/11/2026')
  assert.equal(textoDaSituacao({ ...banida, situacao: 'ATIVA' }), 'Ativa')
})

test('o histórico diz o que foi, por quê, quem e até quando', () => {
  const suspensao: PunicaoNaConta = {
    tipo: 'SUSPENSAO',
    motivo: 'OFENSA',
    nota: null,
    aplicadaPor: 'Marcos',
    aplicadaEm: '2026-11-19T17:00:00Z',
    terminaEm: '2026-11-26T17:00:00Z',
    encerradaPor: null,
    encerradaEm: null,
  }
  assert.equal(linhaDaPunicao(suspensao), 'Suspensão de 7 dias · Ofensa ou assédio · por Marcos em 19/11/2026 às 14:00')
  assert.equal(fimDaPunicao(suspensao, new Date('2026-11-20T00:00:00Z')), 'Até 26/11/2026 às 14:00')
  assert.equal(fimDaPunicao(suspensao, new Date('2026-12-01T00:00:00Z')), 'Terminou em 26/11/2026 às 14:00')
  const encerrada = { ...suspensao, encerradaPor: 'Bia', encerradaEm: '2026-11-20T12:00:00Z' }
  assert.equal(fimDaPunicao(encerrada, new Date('2026-11-21T00:00:00Z')), 'Encerrada por Bia em 20/11/2026 às 09:00')
  const banimento = { ...suspensao, tipo: 'BANIMENTO' as const, motivo: 'GOLPE', terminaEm: null }
  assert.equal(linhaDaPunicao(banimento), 'Banimento · Golpe ou cobrança suspeita · por Marcos em 19/11/2026 às 14:00')
  assert.equal(fimDaPunicao(banimento, new Date()), null)
})

test('as confirmações dizem o que acontece, com a data de volta', () => {
  const agora = new Date('2026-11-19T17:00:00Z')
  assert.equal(
    textoDaSuspensao('ana', 7, agora, false),
    'Suspender @ana por 7 dias? A pessoa sai da conta agora e só volta a entrar em 26/11/2026 às 14:00. ' +
      'As partidas que ela organiza até lá são canceladas, e ela sai das partidas de outras pessoas até lá.',
  )
  assert.match(textoDaSuspensao(null, 1, agora, true), /^Suspender esta conta por 1 dia\?.*O conteúdo denunciado é removido\.$/)
  assert.match(textoDoBanimento('ana'), /^Banir @ana\? .*Não dá para desfazer\.$/)
  assert.equal(
    textoDoEncerramento('ana'),
    'Encerrar a suspensão de @ana? Ela volta a entrar agora. O que foi cancelado não volta.',
  )
})
