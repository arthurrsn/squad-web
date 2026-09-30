import { useState } from 'react'

type Props = {
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  erro?: string
  autoComplete: string
}

export function CampoSenha({ rotulo, valor, aoMudar, erro, autoComplete }: Props) {
  const [visivel, setVisivel] = useState(false)
  const id = rotulo.replace(/\s/g, '-').toLowerCase()
  return (
    <label htmlFor={id}>
      {rotulo}
      <span className="campo-senha">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
        />
        <button type="button" onClick={() => setVisivel(!visivel)} aria-pressed={visivel}>
          {visivel ? 'Ocultar' : 'Mostrar'}
        </button>
      </span>
      {erro && <p id={`${id}-erro`} className="erro">{erro}</p>}
    </label>
  )
}
