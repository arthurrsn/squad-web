import { useEffect, useState } from 'react'
import { codigoDoErro } from '../../core/api/erros.ts'
import { navegar, useCaminho } from '../../core/caminho.ts'
import { Link } from '../../core/Link'
import { limparSessao, quandoPerderSessao, tokenDaSessao } from '../../core/sessao.ts'
import { meusLocais, sair, type Local } from './api.ts'
import { EntrarPage } from './EntrarPage'
import { mensagemDoErro } from './erros.ts'
import { LocalForm } from './LocalForm'
import { MeusLocais } from './MeusLocais'
import { QuadraForm } from './QuadraForm'
import { rotaDoPainel, type Rota } from './rotas.ts'

const NAO_E_DONO =
  'Esta conta não é de dono de quadra. Se você tem uma quadra e quer receber reservas pela Squad, fale com a gente.'
const SESSAO_ACABOU = 'Sua sessão acabou. Entre de novo.'

export function Painel() {
  const rota = rotaDoPainel(useCaminho())
  const [logado, setLogado] = useState(() => tokenDaSessao() !== null)
  const [aviso, setAviso] = useState<string>()
  const [locais, setLocais] = useState<Local[]>()
  const [erro, setErro] = useState<string>()
  const [tentativa, setTentativa] = useState(0)
  const [saindo, setSaindo] = useState(false)

  useEffect(
    () =>
      quandoPerderSessao(() => {
        setLogado(false)
        setLocais(undefined)
        setAviso(SESSAO_ACABOU)
      }),
    [],
  )

  useEffect(() => {
    if (logado && rota.tela === 'entrar') navegar('/painel', true)
    if (!logado && rota.tela !== 'entrar') navegar('/painel/entrar', true)
  }, [logado, rota.tela])

  useEffect(() => {
    if (!logado || locais) return
    const controle = new AbortController()
    meusLocais(controle.signal)
      .then((resposta) => setLocais(Array.isArray(resposta) ? resposta : []))
      .catch((e: unknown) => {
        if (controle.signal.aborted) return
        if (codigoDoErro(e) === 'SO_O_DONO') void encerrar(NAO_E_DONO)
        else setErro(mensagemDoErro(e))
      })
    return () => controle.abort()
  }, [logado, locais, tentativa])

  async function encerrar(novoAviso?: string) {
    setSaindo(true)
    await sair().catch(() => undefined)
    limparSessao()
    setLogado(false)
    setLocais(undefined)
    setErro(undefined)
    setAviso(novoAviso)
    setSaindo(false)
  }

  function aoEntrar() {
    setAviso(undefined)
    setErro(undefined)
    setLogado(true)
  }

  function aoSalvar() {
    setLocais(undefined)
    navegar('/painel')
  }

  function tentarDeNovo() {
    setErro(undefined)
    setTentativa((t) => t + 1)
  }

  if (!logado) return <EntrarPage aviso={aviso} aoEntrar={aoEntrar} />

  return (
    <main className="painel">
      <header className="topo">
        <strong>Squad · Painel</strong>
        <button type="button" onClick={() => void encerrar()} disabled={saindo}>
          {saindo ? 'Saindo…' : 'Sair'}
        </button>
      </header>
      {erro ? (
        <>
          <p className="erro" role="alert">{erro}</p>
          <button type="button" onClick={tentarDeNovo}>Tentar de novo</button>
        </>
      ) : locais ? (
        <Tela rota={rota} locais={locais} aoSalvar={aoSalvar} />
      ) : (
        <p role="status">Carregando…</p>
      )}
    </main>
  )
}

function Tela({ rota, locais, aoSalvar }: { rota: Rota; locais: Local[]; aoSalvar: () => void }) {
  switch (rota.tela) {
    case 'locais':
      return <MeusLocais locais={locais} />
    case 'novoLocal':
      return <LocalForm key="novo" aoSalvar={aoSalvar} />
    case 'local': {
      const local = locais.find((l) => l.id === rota.localId)
      return local ? <LocalForm key={local.id} local={local} aoSalvar={aoSalvar} /> : <NaoEncontrada />
    }
    case 'novaQuadra': {
      const local = locais.find((l) => l.id === rota.localId)
      return local ? <QuadraForm key={`nova-${local.id}`} local={local} aoSalvar={aoSalvar} /> : <NaoEncontrada />
    }
    case 'quadra': {
      const local = locais.find((l) => l.id === rota.localId)
      const quadra = local?.quadras.find((q) => q.id === rota.quadraId)
      return local && quadra ? (
        <QuadraForm key={quadra.id} local={local} quadra={quadra} aoSalvar={aoSalvar} />
      ) : (
        <NaoEncontrada />
      )
    }
    case 'entrar':
      return null
    default:
      return <NaoEncontrada />
  }
}

function NaoEncontrada() {
  return (
    <>
      <h1>Não encontramos essa página.</h1>
      <Link para="/painel">Voltar aos meus locais</Link>
    </>
  )
}
