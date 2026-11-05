import type { InputHTMLAttributes } from 'react'

type Props = {
  id: string
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  erro?: string
  ajuda?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange'>

export function Campo({ id, rotulo, valor, aoMudar, erro, ajuda, ...resto }: Props) {
  const descricao = [ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(' ') || undefined
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      {ajuda && <span id={`${id}-ajuda`} className="ajuda">{ajuda}</span>}
      <input
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
        {...resto}
      />
      {erro && <span id={`${id}-erro`} className="erro">{erro}</span>}
    </div>
  )
}
