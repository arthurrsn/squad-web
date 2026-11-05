const FUSO = 'America/Sao_Paulo'
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]
const DIAS_DA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const formato = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function partes(instante: Date): Record<string, string> {
  return Object.fromEntries(formato.formatToParts(instante).map((p) => [p.type, p.value]))
}

function meioDia(dia: string): Date {
  return new Date(`${dia}T12:00:00Z`)
}

export function hojeEmSaoPaulo(agora: Date): string {
  const p = partes(agora)
  return `${p.year}-${p.month}-${p.day}`
}

export function diaValido(texto: string | null): texto is string {
  if (!texto || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false
  const data = new Date(`${texto}T00:00:00Z`)
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === texto
}

export function somarDias(dia: string, dias: number): string {
  const data = meioDia(dia)
  data.setUTCDate(data.getUTCDate() + dias)
  return data.toISOString().slice(0, 10)
}

export function segundaDaSemana(dia: string): string {
  return somarDias(dia, -((meioDia(dia).getUTCDay() + 6) % 7))
}

export function diaEmSaoPaulo(instante: string): string {
  return hojeEmSaoPaulo(new Date(instante))
}

export function horaEmSaoPaulo(instante: string): string {
  const p = partes(new Date(instante))
  return `${p.hour}:${p.minute}`
}

export function diaEMes(instante: string): string {
  const p = partes(new Date(instante))
  return `${Number(p.day)}/${p.month}`
}

export function dataHoraCurta(instante: string): string {
  return `${diaEMes(instante)} às ${horaEmSaoPaulo(instante)}`
}

export function nomeDoDia(dia: string): string {
  return `${DIAS_DA_SEMANA[meioDia(dia).getUTCDay()]}, ${Number(dia.slice(8, 10))}/${dia.slice(5, 7)}`
}

export function tituloDaSemana(segunda: string): string {
  const domingo = somarDias(segunda, 6)
  const mesInicio = MESES[Number(segunda.slice(5, 7)) - 1]
  const mesFim = MESES[Number(domingo.slice(5, 7)) - 1]
  const diaInicio = Number(segunda.slice(8, 10))
  const diaFim = Number(domingo.slice(8, 10))
  if (mesInicio === mesFim) return `${diaInicio} a ${diaFim} de ${mesFim}`
  return `${diaInicio} de ${mesInicio} a ${diaFim} de ${mesFim}`
}

export function paraInstante(dataHoraLocal: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dataHoraLocal)) return undefined
  return `${dataHoraLocal}:00-03:00`
}
