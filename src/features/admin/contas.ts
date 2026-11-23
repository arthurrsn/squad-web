import { quando, quantos, rotuloDoMotivo, texto, type Parte } from './fila.ts'

export type Situacao = 'ATIVA' | 'SUSPENSA' | 'BANIDA'

export type PunicaoNaConta = {
  tipo: 'SUSPENSAO' | 'BANIMENTO'
  motivo: string
  nota: string | null
  aplicadaPor: string | null
  aplicadaEm: string
  terminaEm: string | null
  encerradaPor: string | null
  encerradaEm: string | null
}

/** A banida vem sem nome, @, foto e e-mail, como "Conta apagada" (ADR-042). */
export type Conta = {
  userId: string
  nome: string | null
  sobrenome: string | null
  arroba: string | null
  fotoUrl: string | null
  email: string | null
  papel: string
  situacao: Situacao
  suspensaAte: string | null
  bloqueadaPor: number
  punicoes: PunicaoNaConta[]
}

/** O que a equipe escolhe ao suspender ou banir. {@code dias} não conta no banimento; {@code partes}, fora do perfil. */
export type DadosDaPunicao = { dias: number; motivo: string; nota: string; partes: Parte[] }

/** As mesmas durações que o backend aceita (NovaPunicao). */
export const DURACOES = [1, 7, 30]

/** Os motivos da denúncia, na ordem do app. */
export const MOTIVOS = ['OFENSA', 'GOLPE', 'PERFIL_FALSO', 'NAO_EXISTE', 'MENOR_DE_IDADE', 'CONTEUDO_IMPROPRIO', 'OUTRO']

const SITUACOES: Situacao[] = ['ATIVA', 'SUSPENSA', 'BANIDA']

const PAPEIS: Record<string, string> = { PADRAO: 'Jogador', DONO_QUADRA: 'Dono de quadra', ADMIN: 'Equipe' }

const DIA_EM_MS = 24 * 60 * 60 * 1000

function lerPunicao(item: unknown): PunicaoNaConta | null {
  if (!item || typeof item !== 'object') return null
  const p = item as Record<string, unknown>
  const tipo = texto(p.tipo)
  const motivo = texto(p.motivo)
  const aplicadaEm = texto(p.aplicadaEm)
  if ((tipo !== 'SUSPENSAO' && tipo !== 'BANIMENTO') || !motivo || !aplicadaEm) return null
  return {
    tipo,
    motivo,
    nota: texto(p.nota),
    aplicadaPor: texto(p.aplicadaPor),
    aplicadaEm,
    terminaEm: texto(p.terminaEm),
    encerradaPor: texto(p.encerradaPor),
    encerradaEm: texto(p.encerradaEm),
  }
}

/** A resposta de GET /admin/contas, sem confiar no formato. Nula quando não dá para mostrar a conta. */
export function lerConta(corpo: unknown): Conta | null {
  if (!corpo || typeof corpo !== 'object') return null
  const c = corpo as Record<string, unknown>
  const userId = texto(c.userId)
  const situacao = texto(c.situacao) as Situacao | null
  if (!userId || !situacao || !SITUACOES.includes(situacao)) return null
  return {
    userId,
    nome: texto(c.nome),
    sobrenome: texto(c.sobrenome),
    arroba: texto(c.arroba),
    fotoUrl: texto(c.fotoUrl),
    email: texto(c.email),
    papel: texto(c.papel) ?? '',
    situacao,
    suspensaAte: texto(c.suspensaAte),
    bloqueadaPor: quantos(c.bloqueadaPor),
    punicoes: (Array.isArray(c.punicoes) ? c.punicoes : [])
      .map(lerPunicao)
      .filter((p): p is PunicaoNaConta => p !== null),
  }
}

/** A busca fica no endereço, para o "Ver conta" da fila e o recarregar da página. */
export function enderecoDaBusca(termo: string): string {
  return `/admin/contas?busca=${encodeURIComponent(termo.trim())}`
}

export function buscaDoEndereco(endereco: string): string {
  const consulta = endereco.includes('?') ? endereco.slice(endereco.indexOf('?')) : ''
  return (new URLSearchParams(consulta).get('busca') ?? '').trim()
}

export function nomeDaConta(conta: Conta): string {
  const nome = [conta.nome, conta.sobrenome].filter(Boolean).join(' ')
  if (!nome) return 'Conta apagada'
  return conta.arroba ? `${nome} · @${conta.arroba}` : nome
}

export function rotuloDoPapel(papel: string): string {
  return PAPEIS[papel] ?? papel
}

export function textoDaSituacao(conta: Conta): string {
  if (conta.situacao === 'SUSPENSA' && conta.suspensaAte) return `Suspensa até ${quando(conta.suspensaAte)}`
  if (conta.situacao === 'BANIDA') {
    const banimento = conta.punicoes.find((p) => p.tipo === 'BANIMENTO')
    return banimento ? `Banida em ${quando(banimento.aplicadaEm).split(' às ')[0]}` : 'Banida'
  }
  return 'Ativa'
}

/** Quem aparece nas confirmações: o @ quando a conta tem, senão "esta conta". */
function quem(arroba: string | null): string {
  return arroba ? `@${arroba}` : 'esta conta'
}

function duracao(dias: number): string {
  return dias === 1 ? '1 dia' : `${dias} dias`
}

export function linhaDaPunicao(p: PunicaoNaConta): string {
  const inicio = new Date(p.aplicadaEm).getTime()
  const fim = p.terminaEm ? new Date(p.terminaEm).getTime() : NaN
  const dias = Math.round((fim - inicio) / DIA_EM_MS)
  const tipo = p.tipo === 'BANIMENTO' ? 'Banimento' : Number.isFinite(dias) ? `Suspensão de ${duracao(dias)}` : 'Suspensão'
  const por = p.aplicadaPor ? ` por ${p.aplicadaPor}` : ''
  return `${tipo} · ${rotuloDoMotivo(p.motivo)} ·${por} em ${quando(p.aplicadaEm)}`
}

/** O fim da suspensão, ou quem a encerrou antes. Nulo no banimento. */
export function fimDaPunicao(p: PunicaoNaConta, agora: Date): string | null {
  if (p.encerradaEm) {
    return `Encerrada${p.encerradaPor ? ` por ${p.encerradaPor}` : ''} em ${quando(p.encerradaEm)}`
  }
  if (!p.terminaEm) return null
  return `${new Date(p.terminaEm).getTime() > agora.getTime() ? 'Até' : 'Terminou em'} ${quando(p.terminaEm)}`
}

/** A data só mostra a quem confirma; a que vale é a do servidor. */
export function textoDaSuspensao(arroba: string | null, dias: number, agora: Date, peloCartao: boolean): string {
  const volta = quando(new Date(agora.getTime() + dias * DIA_EM_MS).toISOString())
  const texto =
    `Suspender ${quem(arroba)} por ${duracao(dias)}? A pessoa sai da conta agora e só volta a entrar em ${volta}. ` +
    'As partidas que ela organiza até lá são canceladas, e ela sai das partidas de outras pessoas até lá.'
  return peloCartao ? `${texto} O conteúdo denunciado é removido.` : texto
}

export function textoDoBanimento(arroba: string | null): string {
  return (
    `Banir ${quem(arroba)}? A conta é encerrada agora, como numa exclusão: o que ela organiza é cancelado e ela ` +
    'passa a aparecer como "Conta apagada". O e-mail não pode mais ser usado na Squad. Não dá para desfazer.'
  )
}

export function textoDoEncerramento(arroba: string | null): string {
  return `Encerrar a suspensão de ${quem(arroba)}? Ela volta a entrar agora. O que foi cancelado não volta.`
}
