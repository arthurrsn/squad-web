import { useEffect, useState, type FormEvent } from 'react'
import { codigoDoErro } from '../../core/api/erros.ts'
import { navegar, useCaminho } from '../../core/caminho.ts'
import { banir, buscarConta, encerrarSuspensao, suspender } from './api.ts'
import {
  buscaDoEndereco,
  enderecoDaBusca,
  fimDaPunicao,
  lerConta,
  linhaDaPunicao,
  nomeDaConta,
  rotuloDoPapel,
  textoDaSituacao,
  textoDoEncerramento,
  type Conta,
  type DadosDaPunicao,
} from './contas.ts'
import { bloqueios, mensagemDoErro } from './fila.ts'
import { Punir } from './Punir.tsx'

/** {@code vistaEm} separa, no histórico, a suspensão que ainda vale da que já terminou. */
type Resultado = { busca: string; conta: Conta | null; vistaEm: Date } | { busca: string; erro: string }

type Acao = 'suspender' | 'banir' | 'encerrar'

/** A página Contas do /admin: acha a conta pelo @ ou pelo e-mail e a equipe suspende, encerra ou bane (ADR-042). */
type ContasProps = {
  aoPerderAcesso: () => void
  /** Uma punição pode resolver cartões da fila: a fila é buscada de novo na volta. */
  aoPunir: () => void
}

export function Contas({ aoPerderAcesso, aoPunir }: ContasProps) {
  const busca = buscaDoEndereco(useCaminho())
  const [termo, setTermo] = useState(busca)
  const [erroDoTermo, setErroDoTermo] = useState<string>()
  const [resultado, setResultado] = useState<Resultado>()
  const [tentativa, setTentativa] = useState(0)
  const [acao, setAcao] = useState<Acao>()
  const [enviando, setEnviando] = useState(false)
  const [erroDaAcao, setErroDaAcao] = useState<string>()
  const [aviso, setAviso] = useState<string>()

  useEffect(() => {
    if (!busca) return
    const controle = new AbortController()
    buscarConta(busca, controle.signal)
      .then((corpo) => {
        const conta = lerConta(corpo)
        setResultado(conta ? { busca, conta, vistaEm: new Date() } : { busca, erro: 'Algo deu errado. Tenta de novo.' })
      })
      .catch((e: unknown) => {
        if (controle.signal.aborted) return
        const codigo = codigoDoErro(e)
        if (codigo === 'SO_ADMIN') aoPerderAcesso()
        else if (codigo === 'CONTA_NAO_ENCONTRADA') setResultado({ busca, conta: null, vistaEm: new Date() })
        else setResultado({ busca, erro: mensagemDoErro(e) })
      })
    return () => controle.abort()
  }, [busca, tentativa, aoPerderAcesso])

  function buscar(e: FormEvent) {
    e.preventDefault()
    if (!termo.trim()) {
      setErroDoTermo('Informe o @ ou o e-mail.')
      return
    }
    setErroDoTermo(undefined)
    navegar(enderecoDaBusca(termo))
  }

  async function agir(conta: Conta, escolhida: Acao, dados?: DadosDaPunicao) {
    setErroDaAcao(undefined)
    setEnviando(true)
    try {
      if (escolhida === 'encerrar') await encerrarSuspensao(conta.userId)
      else if (escolhida === 'suspender' && dados) await suspender(conta.userId, dados)
      else if (dados) await banir(conta.userId, dados)
      setAcao(undefined)
      aoPunir()
      setAviso(
        escolhida === 'encerrar' ? 'Suspensão encerrada.' : escolhida === 'suspender' ? 'Conta suspensa.' : 'Conta banida.',
      )
      // O banimento apaga o @: a conta banida só se acha pelo e-mail, que ainda está na mão.
      const proxima = escolhida === 'banir' && conta.email ? conta.email : busca
      if (proxima === busca) setTentativa((t) => t + 1)
      else {
        setTermo(proxima)
        navegar(enderecoDaBusca(proxima), true)
      }
    } catch (e) {
      if (codigoDoErro(e) === 'SO_ADMIN') aoPerderAcesso()
      else setErroDaAcao(mensagemDoErro(e))
    } finally {
      setEnviando(false)
    }
  }

  const atual = resultado?.busca === busca ? resultado : undefined
  const conta = atual && 'conta' in atual ? atual.conta : null
  const vistaEm = atual && 'vistaEm' in atual ? atual.vistaEm : undefined

  return (
    <>
      <h1>Contas</h1>
      <form onSubmit={buscar} noValidate>
        <label htmlFor="busca-conta">
          @ ou e-mail
          <input id="busca-conta" type="search" value={termo} onChange={(e) => setTermo(e.target.value)} maxLength={100} />
        </label>
        {erroDoTermo && <p className="erro" role="alert">{erroDoTermo}</p>}
        <button type="submit">Buscar</button>
      </form>
      {aviso && <p role="status">{aviso}</p>}
      {busca &&
        (!atual ? (
          <p role="status">Carregando…</p>
        ) : 'erro' in atual ? (
          <>
            <p className="erro" role="alert">{atual.erro}</p>
            <button type="button" onClick={() => setTentativa((t) => t + 1)}>Tentar de novo</button>
          </>
        ) : !conta || !vistaEm ? (
          <p>Nenhuma conta com esse @ ou e-mail.</p>
        ) : (
          <FichaDaConta
            conta={conta}
            vistaEm={vistaEm}
            acao={acao}
            enviando={enviando}
            erro={erroDaAcao}
            aoEscolher={(a) => {
              setAviso(undefined)
              setErroDaAcao(undefined)
              setAcao(a)
            }}
            aoAgir={(a, dados) => void agir(conta, a, dados)}
          />
        ))}
    </>
  )
}

type FichaProps = {
  conta: Conta
  vistaEm: Date
  acao?: Acao
  enviando: boolean
  erro?: string
  aoEscolher: (acao?: Acao) => void
  aoAgir: (acao: Acao, dados?: DadosDaPunicao) => void
}

function FichaDaConta({ conta, vistaEm, acao, enviando, erro, aoEscolher, aoAgir }: FichaProps) {
  const daEquipe = conta.papel === 'ADMIN'
  const detalhes = [conta.email, rotuloDoPapel(conta.papel), bloqueios(conta.bloqueadaPor)].filter(Boolean).join(' · ')

  return (
    <section className="cartao">
      <h2>{nomeDaConta(conta)}</h2>
      <p><strong>{textoDaSituacao(conta)}</strong></p>
      {detalhes && <p className="ajuda">{detalhes}</p>}
      {conta.fotoUrl && /^https?:\/\//.test(conta.fotoUrl) && (
        <img className="foto-denunciada" src={conta.fotoUrl} alt="Foto do perfil" />
      )}
      {daEquipe ? (
        <p>Conta da equipe da Squad.</p>
      ) : acao === 'suspender' || acao === 'banir' ? (
        <Punir
          id={`conta-${acao}`}
          tipo={acao}
          arroba={conta.arroba}
          enviando={enviando}
          aoConfirmar={(dados) => aoAgir(acao, dados)}
          aoVoltar={() => aoEscolher(undefined)}
        />
      ) : acao === 'encerrar' ? (
        <>
          <p>{textoDoEncerramento(conta.arroba)}</p>
          <div className="acoes">
            <button type="button" className="perigo" onClick={() => aoAgir('encerrar')} disabled={enviando}>
              {enviando ? 'Encerrando…' : 'Encerrar suspensão'}
            </button>
            <button type="button" onClick={() => aoEscolher(undefined)} disabled={enviando}>Voltar</button>
          </div>
        </>
      ) : conta.situacao === 'BANIDA' ? null : (
        <div className="acoes">
          {conta.situacao === 'SUSPENSA' ? (
            <button type="button" onClick={() => aoEscolher('encerrar')}>Encerrar suspensão</button>
          ) : (
            <button type="button" className="perigo" onClick={() => aoEscolher('suspender')}>Suspender</button>
          )}
          <button type="button" className="perigo" onClick={() => aoEscolher('banir')}>Banir</button>
        </div>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
      <h2>Histórico</h2>
      {conta.punicoes.length === 0 ? (
        <p className="ajuda">Nenhuma punição.</p>
      ) : (
        <ol className="denuncias">
          {conta.punicoes.map((p, i) => {
            const fim = fimDaPunicao(p, vistaEm)
            return (
              <li key={`${p.aplicadaEm}-${i}`}>
                <p>{linhaDaPunicao(p)}</p>
                {fim && <p className="ajuda">{fim}</p>}
                {p.nota && <p className="ajuda">"{p.nota}"</p>}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
