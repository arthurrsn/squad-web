import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { CampoSenha } from '../../core/CampoSenha'
import { Link } from '../../core/Link.tsx'
import { codigoDoErro } from '../../core/api/erros.ts'
import { navegar, useCaminho } from '../../core/caminho.ts'
import { guardarSessao, limparSessao, quandoPerderSessao, tokenDaSessao } from '../../core/sessao.ts'
import { arquivar, banirPelaFila, buscarFila, entrar, remover, sair, suspenderPelaFila } from './api.ts'
import { Contas } from './Contas.tsx'
import { enderecoDaBusca, type DadosDaPunicao } from './contas.ts'
import {
  autorPodeSerPunido,
  bloqueios,
  fotoDaCopia,
  lerFila,
  mensagemDoErro,
  nomeDoAutor,
  quando,
  rotuloDoMotivo,
  textoDaConfirmacao,
  textoDaRemocaoDoPerfil,
  textosDaCopia,
  tipoDoAlvo,
  tituloDaFila,
  tituloDoCartao,
  type Cartao,
  type Decisao,
  type Parte,
} from './fila.ts'
import { PartesDoPerfil, Punir } from './Punir.tsx'

const NAO_E_DA_EQUIPE = 'Esta conta não é da equipe da Squad.'
const SESSAO_ACABOU = 'Sua sessão acabou. Entre de novo.'
const PAGINAS = ['/admin', '/admin/contas']

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
    if (logado && !PAGINAS.includes(caminho)) navegar('/admin', true)
    if (!logado && caminho !== '/admin/entrar') navegar('/admin/entrar', true)
  }, [logado, caminho])

  useEffect(() => {
    if (!logado || cartoes || caminho !== '/admin') return
    const controle = new AbortController()
    buscarFila(controle.signal)
      .then((corpo) => setCartoes(lerFila(corpo)))
      .catch((e: unknown) => {
        if (controle.signal.aborted) return
        if (codigoDoErro(e) === 'SO_ADMIN') void encerrar(NAO_E_DA_EQUIPE)
        else setErro(mensagemDoErro(e))
      })
    return () => controle.abort()
  }, [logado, cartoes, tentativa, caminho])

  // Estável entre renderizações: a página Contas busca a conta num efeito que depende dela.
  const perderAcesso = useCallback(() => void encerrar(NAO_E_DA_EQUIPE), [])

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

  // A fila volta ao servidor só quando esvazia: pode haver mais alvos além dos que vieram. O banimento resolve
  // também os outros cartões da mesma pessoa, então depois dele a fila é buscada de novo.
  function aoResolver(cartao: Cartao, novoAviso?: string, recarregar = false) {
    if (recarregar) {
      setAvisoDaFila(novoAviso)
      setCartoes(undefined)
      return
    }
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
      <nav className="acoes" aria-label="Áreas da equipe">
        <Link para="/admin">Denúncias</Link>
        <Link para="/admin/contas">Contas</Link>
      </nav>
      {caminho === '/admin/contas' ? (
        <Contas aoPerderAcesso={perderAcesso} aoPunir={() => setCartoes(undefined)} />
      ) : erro ? (
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
                <CartaoDaFila
                  key={`${c.alvo}-${c.alvoId}`}
                  cartao={c}
                  aoResolver={(a, recarregar) => aoResolver(c, a, recarregar)}
                />
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

type CartaoProps = { cartao: Cartao; aoResolver: (aviso?: string, recarregar?: boolean) => void }

function CartaoDaFila({ cartao, aoResolver }: CartaoProps) {
  const [decisao, setDecisao] = useState<Decisao>()
  const [partes, setPartes] = useState<Parte[]>(['BIO_E_FOTO'])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string>()
  const foto = fotoDaCopia(cartao.copia)
  const textos = textosDaCopia(cartao.copia)
  const total = cartao.denuncias.length
  const perfil = cartao.alvo === 'PERFIL'
  const id = `cartao-${cartao.alvo}-${cartao.alvoId}`
  const autor = [nomeDoAutor(cartao.autor), bloqueios(cartao.autor.bloqueadaPor)].filter(Boolean).join(' · ')

  function escolher(escolhida?: Decisao) {
    setErro(undefined)
    setDecisao(escolhida)
  }

  async function confirmar(escolhida: Decisao, dados?: DadosDaPunicao) {
    setErro(undefined)
    setEnviando(true)
    try {
      if (escolhida === 'arquivar') await arquivar(cartao.alvo, cartao.alvoId)
      else if (escolhida === 'remover') await remover(cartao.alvo, cartao.alvoId, perfil ? partes : undefined)
      else if (escolhida === 'suspender' && dados) await suspenderPelaFila(cartao.alvo, cartao.alvoId, dados)
      else if (dados) await banirPelaFila(cartao.alvo, cartao.alvoId, dados)
      aoResolver(undefined, escolhida === 'banir')
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
        {autor} · {total === 1 ? '1 denúncia' : `${total} denúncias`}
      </p>
      {cartao.autor.arroba && <Link para={enderecoDaBusca(cartao.autor.arroba)}>Ver conta</Link>}
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
      {decisao === 'suspender' || decisao === 'banir' ? (
        <Punir
          id={`${id}-${decisao}`}
          tipo={decisao}
          arroba={cartao.autor.arroba}
          peloCartao={{ perfil }}
          enviando={enviando}
          aoConfirmar={(dados) => void confirmar(decisao, dados)}
          aoVoltar={() => escolher(undefined)}
        />
      ) : decisao ? (
        <>
          {decisao === 'remover' && perfil && (
            <PartesDoPerfil id={`${id}-partes`} partes={partes} aoMudar={setPartes} desligado={enviando} />
          )}
          <p>
            {decisao === 'remover' && perfil ? textoDaRemocaoDoPerfil(partes) : textoDaConfirmacao(decisao, cartao.alvo)}
          </p>
          <div className="acoes">
            <button
              type="button"
              className={decisao === 'remover' ? 'perigo' : undefined}
              onClick={() => void confirmar(decisao)}
              disabled={enviando || (decisao === 'remover' && perfil && partes.length === 0)}
            >
              {decisao === 'remover'
                ? enviando ? 'Removendo…' : 'Confirmar remoção'
                : enviando ? 'Arquivando…' : 'Confirmar arquivamento'}
            </button>
            <button type="button" onClick={() => escolher(undefined)} disabled={enviando}>Voltar</button>
          </div>
        </>
      ) : (
        <div className="acoes">
          <button type="button" onClick={() => escolher('arquivar')}>Arquivar</button>
          <button type="button" className="perigo" onClick={() => escolher('remover')}>Remover</button>
          {autorPodeSerPunido(cartao.autor) && (
            <>
              <button type="button" className="perigo" onClick={() => escolher('suspender')}>Suspender</button>
              <button type="button" className="perigo" onClick={() => escolher('banir')}>Banir</button>
            </>
          )}
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
