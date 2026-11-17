import { useEffect, useState, type FormEvent } from 'react'
import { CampoSenha } from '../../core/CampoSenha'
import { codigoDoErro } from '../../core/api/erros.ts'
import { navegar, useCaminho } from '../../core/caminho.ts'
import { guardarSessao, limparSessao, quandoPerderSessao, tokenDaSessao } from '../../core/sessao.ts'
import { arquivar, buscarFila, entrar, remover, sair } from './api.ts'
import {
  fotoDaCopia,
  lerFila,
  mensagemDoErro,
  nomeDoAutor,
  quando,
  rotuloDoMotivo,
  textoDaConfirmacao,
  textosDaCopia,
  tipoDoAlvo,
  tituloDaFila,
  tituloDoCartao,
  type Cartao,
  type Decisao,
} from './fila.ts'

const NAO_E_DA_EQUIPE = 'Esta conta não é da equipe da Squad.'
const SESSAO_ACABOU = 'Sua sessão acabou. Entre de novo.'

export function Admin() {
  const caminho = useCaminho().split('?')[0].replace(/\/+$/, '')
  const [logado, setLogado] = useState(() => tokenDaSessao() !== null)
  const [aviso, setAviso] = useState<string>()
  const [cartoes, setCartoes] = useState<Cartao[]>()
  const [avisoDaFila, setAvisoDaFila] = useState<string>()
  const [erro, setErro] = useState<string>()
  const [tentativa, setTentativa] = useState(0)
  const [saindo, setSaindo] = useState(false)

  useEffect(
    () =>
      quandoPerderSessao(() => {
        setLogado(false)
        setCartoes(undefined)
        setAviso(SESSAO_ACABOU)
      }),
    [],
  )

  useEffect(() => {
    if (logado && caminho !== '/admin') navegar('/admin', true)
    if (!logado && caminho !== '/admin/entrar') navegar('/admin/entrar', true)
  }, [logado, caminho])

  useEffect(() => {
    if (!logado || cartoes) return
    const controle = new AbortController()
    buscarFila(controle.signal)
      .then((corpo) => setCartoes(lerFila(corpo)))
      .catch((e: unknown) => {
        if (controle.signal.aborted) return
        if (codigoDoErro(e) === 'SO_ADMIN') void encerrar(NAO_E_DA_EQUIPE)
        else setErro(mensagemDoErro(e))
      })
    return () => controle.abort()
  }, [logado, cartoes, tentativa])

  async function encerrar(novoAviso?: string) {
    setSaindo(true)
    await sair().catch(() => undefined)
    limparSessao()
    setLogado(false)
    setCartoes(undefined)
    setAvisoDaFila(undefined)
    setErro(undefined)
    setAviso(novoAviso)
    setSaindo(false)
  }

  function aoEntrar() {
    setAviso(undefined)
    setErro(undefined)
    setLogado(true)
  }

  // A fila volta ao servidor só quando esvazia: pode haver mais alvos além dos que vieram.
  function aoResolver(cartao: Cartao, novoAviso?: string) {
    setAvisoDaFila(novoAviso)
    setCartoes((atuais) => {
      const resto = atuais?.filter((c) => c.alvo !== cartao.alvo || c.alvoId !== cartao.alvoId)
      return resto?.length ? resto : undefined
    })
  }

  function tentarDeNovo() {
    setErro(undefined)
    setTentativa((t) => t + 1)
  }

  if (!logado) return <EntrarNaEquipe aviso={aviso} aoEntrar={aoEntrar} />

  return (
    <main className="admin">
      <header className="topo">
        <strong>Squad · Equipe</strong>
        <button type="button" onClick={() => void encerrar()} disabled={saindo}>
          {saindo ? 'Saindo…' : 'Sair'}
        </button>
      </header>
      {erro ? (
        <>
          <p className="erro" role="alert">{erro}</p>
          <button type="button" onClick={tentarDeNovo}>Tentar de novo</button>
        </>
      ) : cartoes ? (
        <>
          <h1>{tituloDaFila(cartoes)}</h1>
          {avisoDaFila && <p role="status">{avisoDaFila}</p>}
          {cartoes.length === 0 ? (
            <p>Nenhuma denúncia aberta.</p>
          ) : (
            <ul className="lista">
              {cartoes.map((c) => (
                <CartaoDaFila key={`${c.alvo}-${c.alvoId}`} cartao={c} aoResolver={(a) => aoResolver(c, a)} />
              ))}
            </ul>
          )}
        </>
      ) : (
        <p role="status">Carregando…</p>
      )}
    </main>
  )
}

type CartaoProps = { cartao: Cartao; aoResolver: (aviso?: string) => void }

function CartaoDaFila({ cartao, aoResolver }: CartaoProps) {
  const [decisao, setDecisao] = useState<Decisao>()
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string>()
  const foto = fotoDaCopia(cartao.copia)
  const textos = textosDaCopia(cartao.copia)
  const total = cartao.denuncias.length

  async function confirmar(escolhida: Decisao) {
    setErro(undefined)
    setEnviando(true)
    try {
      await (escolhida === 'remover' ? remover : arquivar)(cartao.alvo, cartao.alvoId)
      aoResolver()
    } catch (e) {
      if (codigoDoErro(e) === 'SEM_DENUNCIA_ABERTA') {
        aoResolver(mensagemDoErro(e))
        return
      }
      setErro(mensagemDoErro(e))
      setEnviando(false)
    }
  }

  return (
    <li className="cartao">
      <span className="etiqueta">{tipoDoAlvo(cartao.alvo).toUpperCase()}</span>
      <h2>{tituloDoCartao(cartao)}</h2>
      <p className="ajuda">
        {nomeDoAutor(cartao.autor)} · {total === 1 ? '1 denúncia' : `${total} denúncias`}
      </p>
      {foto && <img className="foto-denunciada" src={foto} alt="Foto do perfil na hora da denúncia" />}
      {textos.length > 0 && (
        <dl className="copia">
          {textos.map((t) => (
            <div key={t.rotulo}>
              <dt>{t.rotulo}</dt>
              <dd>{t.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      <ol className="denuncias">
        {cartao.denuncias.map((d, i) => (
          <li key={`${d.criadaEm}-${i}`}>
            <strong>{rotuloDoMotivo(d.motivo)}</strong> <span className="ajuda">{quando(d.criadaEm)}</span>
            {d.comentario && <p>{d.comentario}</p>}
          </li>
        ))}
      </ol>
      {decisao ? (
        <>
          <p>{textoDaConfirmacao(decisao, cartao.alvo)}</p>
          <div className="acoes">
            <button
              type="button"
              className={decisao === 'remover' ? 'perigo' : undefined}
              onClick={() => void confirmar(decisao)}
              disabled={enviando}
            >
              {decisao === 'remover'
                ? enviando ? 'Removendo…' : 'Confirmar remoção'
                : enviando ? 'Arquivando…' : 'Confirmar arquivamento'}
            </button>
            <button type="button" onClick={() => setDecisao(undefined)} disabled={enviando}>Voltar</button>
          </div>
        </>
      ) : (
        <div className="acoes">
          <button type="button" onClick={() => setDecisao('arquivar')}>Arquivar</button>
          <button type="button" className="perigo" onClick={() => setDecisao('remover')}>Remover</button>
        </div>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
    </li>
  )
}

type EntrarProps = { aviso?: string; aoEntrar: () => void }

function EntrarNaEquipe({ aviso, aoEntrar }: EntrarProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string>()
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(undefined)
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }
    setEnviando(true)
    try {
      const resposta = await entrar(email.trim(), senha)
      if (typeof resposta?.token !== 'string') {
        setErro('Algo deu errado. Tenta de novo.')
        return
      }
      guardarSessao(resposta.token)
      aoEntrar()
    } catch (err) {
      setErro(mensagemDoErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <h1>Equipe da Squad</h1>
      {aviso && <p role="status">{aviso}</p>}
      <form onSubmit={enviar} noValidate>
        <label htmlFor="email">
          E-mail
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <CampoSenha rotulo="Senha" valor={senha} aoMudar={setSenha} autoComplete="current-password" />
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  )
}
