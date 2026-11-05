import { Link } from '../../core/Link'
import type { Local, Quadra } from './api.ts'
import { nomeDoEsporte, valorPorHora } from './formato.ts'

export function MeusLocais({ locais }: { locais: Local[] }) {
  if (locais.length === 0) {
    return (
      <>
        <h1>Meus locais</h1>
        <p>Você ainda não cadastrou um local.</p>
        <Link para="/painel/locais/novo">Cadastrar local</Link>
      </>
    )
  }

  return (
    <>
      <h1>Meus locais</h1>
      {locais.map((local) => (
        <section key={local.id} className="local">
          <h2>{local.nome}</h2>
          <p>{local.endereco}</p>
          <Link para={`/painel/locais/${local.id}`}>Editar local</Link>
          {local.quadras.length === 0 ? (
            <p>Nenhuma quadra ainda.</p>
          ) : (
            <ul className="lista">
              {local.quadras.map((quadra) => (
                <li key={quadra.id}>
                  <strong>{quadra.nome}</strong>
                  <span>{resumo(quadra)}</span>
                  <span className="acoes">
                    <Link para={`/painel/quadras/${quadra.id}/agenda`}>Agenda</Link>
                    <Link para={`/painel/locais/${local.id}/quadras/${quadra.id}`}>Editar</Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link para={`/painel/locais/${local.id}/quadras/nova`}>Nova quadra</Link>
        </section>
      ))}
      <Link para="/painel/locais/novo">Novo local</Link>
    </>
  )
}

function resumo(quadra: Quadra): string {
  const partes = [quadra.esportes.map(nomeDoEsporte).join(', '), `${quadra.duracaoMinutos} min`]
  if (quadra.valorHoraCentavos) partes.push(valorPorHora(quadra.valorHoraCentavos))
  return partes.join(' · ')
}
