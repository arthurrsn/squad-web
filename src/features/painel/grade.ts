import type { Janela } from './api.ts'

export type Periodo = { abre: number; fecha: number }
export type GradeDaSemana = Periodo[][]

export const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
export const MAX_PERIODOS = 6
export const FIM_DO_DIA = 24 * 60
const PASSO = 30

export function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function hora(minutosDoDia: number): string {
  const h = Math.floor(minutosDoDia / 60)
  const m = minutosDoDia % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function daApi(janelas: Janela[]): GradeDaSemana {
  const grade: GradeDaSemana = DIAS.map(() => [])
  for (const janela of janelas) {
    grade[janela.diaDaSemana - 1]?.push({ abre: minutos(janela.abre), fecha: minutos(janela.fecha) })
  }
  return grade.map((dia) => dia.sort((a, b) => a.abre - b.abre))
}

export function paraApi(grade: GradeDaSemana): Janela[] {
  return grade.flatMap((dia, i) =>
    dia.map((periodo) => ({ diaDaSemana: i + 1, abre: hora(periodo.abre), fecha: hora(periodo.fecha) })),
  )
}

export function periodoNovo(dia: Periodo[]): Periodo {
  if (dia.length === 0) return { abre: 8 * 60, fecha: 22 * 60 }
  const ultimo = Math.max(...dia.map((p) => p.fecha))
  return { abre: Math.min(ultimo, FIM_DO_DIA - PASSO), fecha: FIM_DO_DIA }
}

export function opcoesDeHora(de: number, ate: number, atual: number): number[] {
  const opcoes: number[] = []
  for (let m = de; m <= ate; m += PASSO) opcoes.push(m)
  if (!opcoes.includes(atual)) opcoes.push(atual)
  return opcoes.sort((a, b) => a - b)
}

export function problemaDoDia(dia: Periodo[]): string | undefined {
  if (dia.some((p) => p.abre >= p.fecha)) return 'O horário de abrir vem antes do de fechar.'
  const ordenados = [...dia].sort((a, b) => a.abre - b.abre)
  for (let i = 1; i < ordenados.length; i++) {
    if (ordenados[i].abre < ordenados[i - 1].fecha) return 'Os horários de um mesmo dia não podem se sobrepor.'
  }
  return undefined
}

export function previaDoDia(dia: Periodo[], duracao: number): string[] {
  const linhas: string[] = []
  const inicios: number[] = []
  for (const periodo of [...dia].sort((a, b) => a.abre - b.abre)) {
    const doPeriodo: number[] = []
    for (let m = periodo.abre; m + duracao <= periodo.fecha; m += duracao) doPeriodo.push(m)
    inicios.push(...doPeriodo)
    const sobra = periodo.fecha - periodo.abre - doPeriodo.length * duracao
    const nome = `das ${hora(periodo.abre)} às ${hora(periodo.fecha)}`
    if (doPeriodo.length === 0) linhas.push(`Nenhum horário cabe no período ${nome}.`)
    else if (sobra > 0) linhas.push(`Sobram ${sobra} min no fim do período ${nome}.`)
  }
  if (inicios.length > 0) {
    const nomes = inicios.map(hora)
    const lista = nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
    linhas.unshift(`${nomes.length} ${nomes.length === 1 ? 'horário' : 'horários'}: ${lista}`)
  }
  return linhas
}
