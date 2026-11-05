import { useSyncExternalStore } from 'react'

function assinar(aviso: () => void) {
  addEventListener('popstate', aviso)
  return () => removeEventListener('popstate', aviso)
}

function endereco() {
  return location.pathname + location.search
}

export function useCaminho(): string {
  return useSyncExternalStore(assinar, endereco)
}

export function navegar(para: string, substituir = false) {
  if (substituir) history.replaceState(null, '', para)
  else {
    history.pushState(null, '', para)
    scrollTo(0, 0)
  }
  dispatchEvent(new PopStateEvent('popstate'))
}
