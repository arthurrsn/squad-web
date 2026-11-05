export type Rota =
  | { tela: 'entrar' }
  | { tela: 'locais' }
  | { tela: 'novoLocal' }
  | { tela: 'local'; localId: string }
  | { tela: 'novaQuadra'; localId: string }
  | { tela: 'quadra'; localId: string; quadraId: string }
  | { tela: 'agenda'; quadraId: string; de: string | null }
  | { tela: 'naoEncontrada' }

export function rotaDoPainel(endereco: string): Rota {
  const [caminho, busca = ''] = endereco.split('?')
  const partes = caminho.replace(/\/+$/, '').split('/').slice(2)
  const [a, b, c, d] = partes
  if (partes.length === 0) return { tela: 'locais' }
  if (partes.length === 1 && a === 'entrar') return { tela: 'entrar' }
  if (a === 'locais' && partes.length === 2) return b === 'novo' ? { tela: 'novoLocal' } : { tela: 'local', localId: b }
  if (a === 'locais' && c === 'quadras' && partes.length === 4) {
    return d === 'nova' ? { tela: 'novaQuadra', localId: b } : { tela: 'quadra', localId: b, quadraId: d }
  }
  if (a === 'quadras' && c === 'agenda' && partes.length === 3) {
    return { tela: 'agenda', quadraId: b, de: new URLSearchParams(busca).get('de') }
  }
  return { tela: 'naoEncontrada' }
}
