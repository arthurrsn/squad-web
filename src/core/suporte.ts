/** O e-mail de suporte (ADR-043). Preenchido perto do lançamento; nulo, nada de suporte aparece. */
export const CONTATO_DE_SUPORTE: string | null = null

export function emailValido(texto: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)
}

/** O assunto vai pelo encodeURIComponent, com o espaço como %20, que todo aplicativo de e-mail lê como espaço. */
export function linkDoSuporte(contato: string | null, assunto: string): string | null {
  if (contato === null || !emailValido(contato)) return null
  return `mailto:${contato}?subject=${encodeURIComponent(assunto)}`
}
