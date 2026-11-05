const COM_PONTO = /^(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/
const COM_VIRGULA = /^(-?\d{1,3},\d+)\s*[;\s]\s*(-?\d{1,3},\d+)$/

export function lerCoordenada(texto: string): { latitude: number; longitude: number } | { erro: string } {
  const limpo = texto.trim()
  const achado = COM_PONTO.exec(limpo) ?? COM_VIRGULA.exec(limpo)
  if (!achado) return { erro: 'Cole a coordenada como -25.4284, -49.2733.' }
  const latitude = Number(achado[1].replace(',', '.'))
  const longitude = Number(achado[2].replace(',', '.'))
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return { erro: 'A latitude vai de -90 a 90 e a longitude de -180 a 180.' }
  }
  return { latitude, longitude }
}

export function textoDaCoordenada(latitude: number, longitude: number): string {
  return `${latitude}, ${longitude}`
}

export function linkDoMapa(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}
