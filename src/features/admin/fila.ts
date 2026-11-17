import { ApiError } from '../../core/api/http.ts'

export type Alvo = 'PERFIL' | 'PARTIDA' | 'CAMPEONATO' | 'TIME'

export type Autor = { nome: string | null; sobrenome: string | null; arroba: string | null; fotoUrl: string | null }

export type Denuncia = { motivo: string; comentario: string | null; criadaEm: string }

export type Cartao = {
  alvo: Alvo
  alvoId: string
  titulo: string | null
  autor: Autor
  copia: Record<string, string | null>
  denuncias: Denuncia[]
}

export type Decisao = 'arquivar' | 'remover'

/** O mesmo limite de alvos por vez do backend (ModeracaoService). */
export const ALVOS_POR_VEZ = 50

export const SEM_SERVIDOR = 'Não deu pra falar com o servidor. Confere a conexão e tenta de novo.'

const ALVOS: Record<Alvo, string> = { PERFIL: 'Perfil', PARTIDA: 'Partida', CAMPEONATO: 'Campeonato', TIME: 'Time' }

const MOTIVOS: Record<string, string> = {
  OFENSA: 'Ofensa ou assédio',
  GOLPE: 'Golpe ou cobrança suspeita',
  PERFIL_FALSO: 'Perfil falso',
  NAO_EXISTE: 'Partida ou campeonato que não existe',
  MENOR_DE_IDADE: 'Menor de idade',
  CONTEUDO_IMPROPRIO: 'Conteúdo sexual ou violento',
  OUTRO: 'Outro',
}

const CAMPOS: Record<string, string> = {
  nome: 'Nome',
  sobrenome: 'Sobrenome',
  arroba: '@',
  bio: 'Bio',
  foto: 'Foto',
  localNome: 'Local',
  observacao: 'Observação',
  pagamento: 'Pagamento',
  regulamento: 'Regulamento',
  campeonato: 'Campeonato',
}

const REMOVER: Record<Alvo, string> = {
  PERFIL: 'A bio e a foto saem do perfil. O nome e o @ continuam.',
  PARTIDA:
    'Se a partida ainda não começou, ela é cancelada, a quadra é liberada e quem está nela é avisado. Se já passou, ' +
    'o nome, a observação e o pagamento saem, e o local vira "Local removido pela equipe".',
  CAMPEONATO:
    'Se o campeonato está em inscrições ou em andamento, ele é cancelado, as quadras dos jogos futuros são liberadas ' +
    'e todos são avisados. Se já terminou, o nome e o local viram "removido pela equipe" e o regulamento sai.',
  TIME: 'Nas inscrições, o time sai do campeonato. Depois do sorteio, o nome vira "Time" com um número.',
}

const texto = (valor: unknown): string | null => (typeof valor === 'string' ? valor : null)

function lerCartao(item: unknown): Cartao | null {
  if (!item || typeof item !== 'object') return null
  const c = item as Record<string, unknown>
  const alvo = texto(c.alvo)
  const alvoId = texto(c.alvoId)
  if (!alvo || !(alvo in ALVOS) || !alvoId) return null
  const autor = (c.autor && typeof c.autor === 'object' ? c.autor : {}) as Record<string, unknown>
  const copia: Record<string, string | null> = {}
  if (c.copia && typeof c.copia === 'object') {
    for (const [chave, valor] of Object.entries(c.copia)) copia[chave] = texto(valor)
  }
  const denuncias: Denuncia[] = []
  for (const d of Array.isArray(c.denuncias) ? c.denuncias : []) {
    const denuncia = (d && typeof d === 'object' ? d : {}) as Record<string, unknown>
    const motivo = texto(denuncia.motivo)
    const criadaEm = texto(denuncia.criadaEm)
    if (motivo && criadaEm) denuncias.push({ motivo, comentario: texto(denuncia.comentario), criadaEm })
  }
  return {
    alvo: alvo as Alvo,
    alvoId,
    titulo: texto(c.titulo),
    autor: {
      nome: texto(autor.nome),
      sobrenome: texto(autor.sobrenome),
      arroba: texto(autor.arroba),
      fotoUrl: texto(autor.fotoUrl),
    },
    copia,
    denuncias,
  }
}

/** A resposta de GET /admin/denuncias, sem confiar no formato: o que não dá para mostrar fica de fora. */
export function lerFila(corpo: unknown): Cartao[] {
  const alvos = corpo && typeof corpo === 'object' ? (corpo as { alvos?: unknown }).alvos : undefined
  if (!Array.isArray(alvos)) return []
  return alvos.map(lerCartao).filter((c): c is Cartao => c !== null)
}

export function tituloDaFila(cartoes: Cartao[]): string {
  const total = cartoes.reduce((soma, c) => soma + c.denuncias.length, 0)
  return `Denúncias abertas (${total}${cartoes.length >= ALVOS_POR_VEZ ? '+' : ''})`
}

export function tipoDoAlvo(alvo: Alvo): string {
  return ALVOS[alvo]
}

export function tituloDoCartao(cartao: Cartao): string {
  const titulo = cartao.titulo?.trim() || 'Sem nome'
  const arroba = cartao.alvo === 'PERFIL' ? cartao.copia.arroba : null
  return arroba ? `${titulo} · @${arroba}` : titulo
}

export function nomeDoAutor(autor: Autor): string {
  const nome = [autor.nome, autor.sobrenome].filter(Boolean).join(' ')
  if (!nome) return 'Conta apagada'
  return autor.arroba ? `${nome} (@${autor.arroba})` : nome
}

/** Os textos da cópia na ordem que o backend mandou, sem os vazios e sem a foto, que aparece como imagem. */
export function textosDaCopia(copia: Record<string, string | null>): { rotulo: string; valor: string }[] {
  return Object.entries(copia)
    .filter((par): par is [string, string] => par[0] !== 'foto' && !!par[1]?.trim())
    .map(([chave, valor]) => ({ rotulo: CAMPOS[chave] ?? chave, valor }))
}

/** Só endereço http(s) vira imagem. */
export function fotoDaCopia(copia: Record<string, string | null>): string | null {
  const foto = copia.foto
  return foto && /^https?:\/\//.test(foto) ? foto : null
}

export function rotuloDoMotivo(motivo: string): string {
  return MOTIVOS[motivo] ?? motivo
}

const formatoDaData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function quando(instante: string): string {
  const data = new Date(instante)
  if (Number.isNaN(data.getTime())) return ''
  return formatoDaData.format(data).replace(', ', ' às ')
}

export function textoDaConfirmacao(decisao: Decisao, alvo: Alvo): string {
  if (decisao === 'arquivar') return 'As denúncias saem da fila e nada muda no conteúdo.'
  return REMOVER[alvo]
}

export function mensagemDoErro(e: unknown): string {
  if (!(e instanceof ApiError) || e.status >= 500) return SEM_SERVIDOR
  if (e.status === 429) return 'Muitas tentativas. Espera um pouco e tenta de novo.'
  const mensagem = (e.body as { mensagem?: unknown } | null)?.mensagem
  return typeof mensagem === 'string' && mensagem ? mensagem : 'Algo deu errado. Tenta de novo.'
}
