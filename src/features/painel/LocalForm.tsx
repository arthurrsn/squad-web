import { useState, type FormEvent } from 'react'
import { erroDoCampo } from '../../core/api/erros.ts'
import { Link } from '../../core/Link'
import { criarLocal, editarLocal, type Local } from './api.ts'
import { Campo } from './Campo'
import { lerCoordenada, linkDoMapa, textoDaCoordenada } from './coordenada.ts'
import { mensagemDoErro } from './erros.ts'

const SEM_POSICAO = 'Não deu pra pegar sua localização. Cole a coordenada do mapa.'
const AJUDA_COORDENADA =
  'No Google Maps, clique com o botão direito no lugar (no celular, toque e segure) e copie a coordenada. Depois cole aqui.'

type Erros = { nome?: string; endereco?: string; coordenada?: string; geral?: string }

type Props = { local?: Local; aoSalvar: () => void }

export function LocalForm({ local, aoSalvar }: Props) {
  const [nome, setNome] = useState(local?.nome ?? '')
  const [endereco, setEndereco] = useState(local?.endereco ?? '')
  const [coordenada, setCoordenada] = useState(local ? textoDaCoordenada(local.latitude, local.longitude) : '')
  const [erros, setErros] = useState<Erros>({})
  const [enviando, setEnviando] = useState(false)
  const [buscandoPosicao, setBuscandoPosicao] = useState(false)
  const lida = lerCoordenada(coordenada)

  function usarMinhaLocalizacao() {
    if (!('geolocation' in navigator)) {
      setErros((atuais) => ({ ...atuais, coordenada: SEM_POSICAO }))
      return
    }
    setBuscandoPosicao(true)
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setCoordenada(textoDaCoordenada(arredondar(posicao.coords.latitude), arredondar(posicao.coords.longitude)))
        setErros((atuais) => ({ ...atuais, coordenada: undefined }))
        setBuscandoPosicao(false)
      },
      () => {
        setErros((atuais) => ({ ...atuais, coordenada: SEM_POSICAO }))
        setBuscandoPosicao(false)
      },
      { timeout: 10_000, enableHighAccuracy: true },
    )
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const nomeLimpo = nome.trim()
    const enderecoLimpo = endereco.trim()
    const novos: Erros = {}
    if (nomeLimpo.length < 1 || nomeLimpo.length > 50) novos.nome = 'Use de 1 a 50 caracteres.'
    if (enderecoLimpo.length < 5 || enderecoLimpo.length > 200) novos.endereco = 'Use de 5 a 200 caracteres.'
    if ('erro' in lida) novos.coordenada = lida.erro
    setErros(novos)
    if (Object.keys(novos).length > 0 || 'erro' in lida) return

    setEnviando(true)
    const dados = { nome: nomeLimpo, endereco: enderecoLimpo, latitude: lida.latitude, longitude: lida.longitude }
    try {
      if (local) await editarLocal(local.id, dados)
      else await criarLocal(dados)
      aoSalvar()
    } catch (err) {
      const doServidor: Erros = {
        nome: erroDoCampo(err, 'nome'),
        endereco: erroDoCampo(err, 'endereco'),
        coordenada: erroDoCampo(err, 'latitude') ?? erroDoCampo(err, 'longitude'),
      }
      if (!doServidor.nome && !doServidor.endereco && !doServidor.coordenada) doServidor.geral = mensagemDoErro(err)
      setErros(doServidor)
      setEnviando(false)
    }
  }

  return (
    <>
      <h1>{local ? 'Editar local' : 'Novo local'}</h1>
      <form onSubmit={enviar} noValidate>
        <Campo id="local-nome" rotulo="Nome" valor={nome} aoMudar={setNome} erro={erros.nome} maxLength={50} />
        <Campo
          id="local-endereco"
          rotulo="Endereço"
          valor={endereco}
          aoMudar={setEndereco}
          erro={erros.endereco}
          maxLength={200}
          autoComplete="street-address"
        />
        <Campo
          id="local-coordenada"
          rotulo="Coordenada"
          valor={coordenada}
          aoMudar={setCoordenada}
          erro={erros.coordenada}
          ajuda={AJUDA_COORDENADA}
          placeholder="-25.4284, -49.2733"
        />
        <div className="acoes">
          <button type="button" onClick={usarMinhaLocalizacao} disabled={buscandoPosicao}>
            {buscandoPosicao ? 'Buscando…' : 'Usar minha localização'}
          </button>
          {!('erro' in lida) && (
            <a href={linkDoMapa(lida.latitude, lida.longitude)} target="_blank" rel="noopener noreferrer">
              Conferir no mapa
            </a>
          )}
        </div>
        {erros.geral && <p className="erro" role="alert">{erros.geral}</p>}
        <div className="acoes">
          <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar'}</button>
          <Link para="/painel">Cancelar</Link>
        </div>
      </form>
    </>
  )
}

function arredondar(grau: number): number {
  return Math.round(grau * 1e6) / 1e6
}
