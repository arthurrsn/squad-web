import type { MouseEvent, ReactNode } from 'react'
import { navegar } from './caminho.ts'

export function Link({ para, children }: { para: string; children: ReactNode }) {
  function abrir(e: MouseEvent) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navegar(para)
  }
  return <a href={para} onClick={abrir}>{children}</a>
}
