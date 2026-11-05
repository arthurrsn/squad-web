import type { Esporte } from './api.ts'

const ESPORTES: Record<Esporte, string> = { FUTEBOL: 'Futebol', VOLEI: 'Vôlei', FUTEVOLEI: 'Futevôlei' }

export function nomeDoEsporte(esporte: Esporte): string {
  return ESPORTES[esporte] ?? esporte
}

export function valorPorHora(centavos: number): string {
  const reais = (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: centavos % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return `R$ ${reais}/h`
}

const VALOR = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/

export function lerValor(texto: string): { centavos: number | null } | { erro: string } {
  const limpo = texto.trim().replace(/^R\$\s*/, '')
  if (!limpo) return { centavos: null }
  const achado = VALOR.exec(limpo)
  if (!achado) return { erro: 'Use o valor como 120,00.' }
  const centavos = Number(achado[1].replaceAll('.', '')) * 100 + Number((achado[2] ?? '').padEnd(2, '0'))
  if (centavos < 1 || centavos > 100_000) return { erro: 'O valor vai de R$ 0,01 a R$ 1.000,00.' }
  return { centavos }
}

export function textoDoValor(centavos: number): string {
  return (centavos / 100).toFixed(2).replace('.', ',')
}
