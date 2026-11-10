export const WHATSAPP_DA_EQUIPE: string | null = null
export const LINK_ANDROID: string | null = null
export const LINK_IPHONE: string | null = null
export const MENSAGEM_DO_DONO = 'Olá! Tenho uma quadra e quero receber reservas pela Squad.'

export function numeroValido(numero: string): boolean {
  return /^55\d{10,11}$/.test(numero)
}

export function linkDoWhatsApp(numero: string | null, mensagem: string): string | null {
  if (numero === null || !numeroValido(numero)) return null
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}
