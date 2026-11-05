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
