import { useEffect, useState, type FormEvent } from 'react'
import { codigoDoErro, erroDoCampo } from '../../core/api/erros.ts'
import { navegar } from '../../core/caminho.ts'
import { Link } from '../../core/Link'
import { diasDaSemana, intervaloDoBloqueio, textoDaReserva, textoDoCancelamento } from './agenda.ts'
import {
  agendaDaSemana,
  bloquear,
  cancelarReserva,
  desbloquear,
  type Agenda,
  type Bloqueio,
  type Local,
  type Quadra,
  type ReservaNaAgenda,
} from './api.ts'
import { Campo } from './Campo'
import { diaValido, hojeEmSaoPaulo, nomeDoDia, paraInstante, segundaDaSemana, somarDias, tituloDaSemana } from './datas.ts'
import { mensagemDoErro } from './erros.ts'

type Props = { local: Local; quadra: Quadra; de: string | null }

export function AgendaPage({ local, quadra, de }: Props) {
  const [hoje] = useState(() => hojeEmSaoPaulo(new Date()))
  const [agora, setAgora] = useState(() => Date.now())
  const segunda = segundaDaSemana(diaValido(de) ? de : hoje)
  const [carregada, setCarregada] = useState<{ segunda: string; agenda: Agenda }>()
  const [falha, setFalha] = useState<{ segunda: string; mensagem: string }>()
  const [versao, setVersao] = useState(0)
  const [bloqueando, setBloqueando] = useState(false)
  const agenda = carregada?.segunda === segunda ? carregada.agenda : undefined
  const erro = falha?.segunda === segunda ? falha.mensagem : undefined

  useEffect(() => {
    if (de !== segunda) navegar(enderecoDaSemana(quadra.id, segunda), true)
  }, [de, segunda, quadra.id])

  useEffect(() => {
    if (de !== segunda) return
    const controle = new AbortController()
    agendaDaSemana(quadra.id, segunda, controle.signal)
      .then((resposta) =>
        setCarregada({
          segunda,
          agenda: {
            reservas: Array.isArray(resposta?.reservas) ? resposta.reservas : [],
            bloqueios: Array.isArray(resposta?.bloqueios) ? resposta.bloqueios : [],
          },
        }),
      )
      .catch((e: unknown) => {
        if (!controle.signal.aborted) setFalha({ segunda, mensagem: mensagemDoErro(e) })
      })
    return () => controle.abort()
  }, [quadra.id, segunda, de, versao])

  function recarregar() {
    setFalha(undefined)
    setAgora(Date.now())
    setVersao((v) => v + 1)
  }

  return (
    <>
      <h1>{local.nome} · {quadra.nome}</h1>
      <p>{tituloDaSemana(segunda)}</p>
      <nav className="acoes" aria-label="Semanas">
        <Link para={enderecoDaSemana(quadra.id, somarDias(segunda, -7))}>Semana anterior</Link>
        <Link para={enderecoDaSemana(quadra.id, segundaDaSemana(hoje))}>Esta semana</Link>
        <Link para={enderecoDaSemana(quadra.id, somarDias(segunda, 7))}>Próxima semana</Link>
      </nav>
      {bloqueando ? (
        <BloqueioForm
          quadraId={quadra.id}
          aoFechar={() => setBloqueando(false)}
          aoBloquear={() => {
            setBloqueando(false)
            recarregar()
          }}
        />
      ) : (
        <div className="acoes">
          <button type="button" onClick={() => setBloqueando(true)}>Bloquear horário</button>
        </div>
      )}
      {erro ? (
        <>
          <p className="erro" role="alert">{erro}</p>
          <button type="button" onClick={recarregar}>Tentar de novo</button>
        </>
      ) : !agenda ? (
        <p role="status">Carregando…</p>
      ) : (
        diasDaSemana(agenda, segunda).map(({ dia, itens }) => (
          <section key={dia} className="dia-agenda">
            <h2>{nomeDoDia(dia)}</h2>
            {itens.length === 0 ? (
              <p>Nada marcado.</p>
            ) : (
              <ul className="lista">
                {itens.map((item) =>
                  item.tipo === 'reserva' ? (
                    <ItemReserva key={item.reserva.id} reserva={item.reserva} agora={agora} aoMudar={recarregar} />
                  ) : (
                    <ItemBloqueio
                      key={item.bloqueio.id}
                      quadraId={quadra.id}
                      bloqueio={item.bloqueio}
                      agora={agora}
                      aoMudar={recarregar}
                    />
                  ),
                )}
              </ul>
            )}
          </section>
        ))
      )}
    </>
  )
}

function enderecoDaSemana(quadraId: string, segunda: string): string {
  return `/painel/quadras/${quadraId}/agenda?de=${segunda}`
}

type ItemReservaProps = { reserva: ReservaNaAgenda; agora: number; aoMudar: () => void }

function ItemReserva({ reserva, agora, aoMudar }: ItemReservaProps) {
  const [abrindo, setAbrindo] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string>()
  const cancelavel = !reserva.canceladaEm && Date.parse(reserva.inicio) > agora

  async function cancelar(e: FormEvent) {
    e.preventDefault()
    setErro(undefined)
    setEnviando(true)
    try {
      await cancelarReserva(reserva.id, motivo.trim() || null)
      setAbrindo(false)
      aoMudar()
    } catch (err) {
      setErro(erroDoCampo(err, 'motivo') ?? mensagemDoErro(err))
      if (codigoDoErro(err) === 'HORARIO_PASSOU') aoMudar()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <li>
      {reserva.canceladaEm && <span className="etiqueta">CANCELADA</span>}
      <span>{textoDaReserva(reserva)}</span>
      {reserva.canceladaEm && <span className="ajuda">{textoDoCancelamento(reserva)}</span>}
      {cancelavel && !abrindo && (
        <div className="acoes">
          <button type="button" onClick={() => setAbrindo(true)}>Cancelar reserva</button>
        </div>
      )}
      {cancelavel && abrindo && (
        <form onSubmit={cancelar} noValidate>
          <Campo
            id={`motivo-${reserva.id}`}
            rotulo="Motivo (opcional)"
            valor={motivo}
            aoMudar={setMotivo}
            maxLength={120}
            ajuda={reserva.origem === 'JOGO' ? 'Os jogadores veem o motivo.' : 'Quem estava na partida vê o motivo.'}
          />
          <div className="acoes">
            <button type="submit" className="perigo" disabled={enviando}>
              {enviando ? 'Cancelando…' : 'Cancelar reserva'}
            </button>
            <button type="button" onClick={() => setAbrindo(false)} disabled={enviando}>Voltar</button>
          </div>
        </form>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
    </li>
  )
}

type ItemBloqueioProps = { quadraId: string; bloqueio: Bloqueio; agora: number; aoMudar: () => void }

function ItemBloqueio({ quadraId, bloqueio, agora, aoMudar }: ItemBloqueioProps) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string>()

  async function remover() {
    setErro(undefined)
    setEnviando(true)
    try {
      await desbloquear(quadraId, bloqueio.id)
      aoMudar()
    } catch (err) {
      setErro(mensagemDoErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <li>
      <span className="etiqueta">BLOQUEADO</span>
      <span>{intervaloDoBloqueio(bloqueio)}</span>
      {bloqueio.motivo && <span className="ajuda">{bloqueio.motivo}</span>}
      {Date.parse(bloqueio.fim) > agora && (
        <div className="acoes">
          <button type="button" onClick={remover} disabled={enviando}>{enviando ? 'Desbloqueando…' : 'Desbloquear'}</button>
        </div>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
    </li>
  )
}

type BloqueioFormProps = { quadraId: string; aoFechar: () => void; aoBloquear: () => void }
type ErrosDoBloqueio = { inicio?: string; fim?: string; motivo?: string; geral?: string }

function BloqueioForm({ quadraId, aoFechar, aoBloquear }: BloqueioFormProps) {
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [motivo, setMotivo] = useState('')
  const [erros, setErros] = useState<ErrosDoBloqueio>({})
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const de = paraInstante(inicio)
    const ate = paraInstante(fim)
    const novos: ErrosDoBloqueio = {}
    if (!de) novos.inicio = 'Informe o início.'
    if (!ate) novos.fim = 'Informe o fim.'
    else if (de && Date.parse(ate) <= Date.parse(de)) novos.fim = 'O fim vem depois do início.'
    setErros(novos)
    if (!de || !ate || novos.fim) return

    setEnviando(true)
    try {
      await bloquear(quadraId, { inicio: de, fim: ate, motivo: motivo.trim() || null })
      aoBloquear()
    } catch (err) {
      const doServidor: ErrosDoBloqueio = {
        inicio: erroDoCampo(err, 'inicio'),
        fim: erroDoCampo(err, 'fim'),
        motivo: erroDoCampo(err, 'motivo'),
      }
      if (!Object.values(doServidor).some(Boolean)) doServidor.geral = mensagemDoErro(err)
      setErros(doServidor)
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <Campo id="bloqueio-inicio" rotulo="Início" type="datetime-local" valor={inicio} aoMudar={setInicio} erro={erros.inicio} />
      <Campo id="bloqueio-fim" rotulo="Fim" type="datetime-local" valor={fim} aoMudar={setFim} erro={erros.fim} />
      <Campo
        id="bloqueio-motivo"
        rotulo="Motivo (opcional)"
        valor={motivo}
        aoMudar={setMotivo}
        erro={erros.motivo}
        maxLength={120}
        ajuda="Quem reserva não vê o motivo."
      />
      {erros.geral && <p className="erro" role="alert">{erros.geral}</p>}
      <div className="acoes">
        <button type="submit" disabled={enviando}>{enviando ? 'Bloqueando…' : 'Bloquear'}</button>
        <button type="button" onClick={aoFechar} disabled={enviando}>Voltar</button>
      </div>
    </form>
  )
}
