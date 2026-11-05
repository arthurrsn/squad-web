import { useState, type FormEvent } from 'react'
import { CampoSenha } from '../../core/CampoSenha'
import { codigoDoErro } from '../../core/api/erros.ts'
import { guardarSessao } from '../../core/sessao.ts'
import { entrar } from './api.ts'
import { mensagemDoErro } from './erros.ts'

type Props = { aviso?: string; aoEntrar: () => void }

export function EntrarPage({ aviso, aoEntrar }: Props) {
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
      setErro(
        codigoDoErro(err) === 'EMAIL_NAO_VERIFICADO'
          ? 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
          : mensagemDoErro(err),
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <h1>Painel do dono</h1>
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
