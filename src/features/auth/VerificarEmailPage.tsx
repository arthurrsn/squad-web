import { useState, type FormEvent } from 'react'
import { post } from '../../core/api/http'
import { CampoSenha } from './CampoSenha'
import { LINK_INVALIDO, codigoDoErro, mensagemGeral } from './erros'
import { tokenDoLink } from './linkToken'

export function VerificarEmailPage() {
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [erroSenha, setErroSenha] = useState<string>()
  const [erro, setErro] = useState<string>()

  if (!tokenDoLink) return <Mensagem titulo="Link inválido" texto={LINK_INVALIDO} />
  if (concluido) return <Mensagem titulo="E-mail verificado" texto="Volte ao app e entre." />

  // Só no envio do formulário, nunca em efeito: confirmar o e-mail tem efeito no servidor.
  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(undefined)
    setErroSenha(senha ? undefined : 'Informe a senha.')
    if (!senha) return
    setEnviando(true)
    try {
      await post('/auth/verify-email', { token: tokenDoLink, senha })
      setConcluido(true)
    } catch (err) {
      if (codigoDoErro(err) === 'CREDENCIAIS_INVALIDAS') {
        setErroSenha('Senha incorreta. Se não lembra, use "Esqueci minha senha" no app.')
      } else {
        setErro(mensagemGeral(err))
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <h1>Confirme seu e-mail</h1>
      <form onSubmit={enviar} noValidate>
        <p>Digite a senha que você criou no app para confirmar que o e-mail é seu.</p>
        <CampoSenha rotulo="Senha" valor={senha} aoMudar={setSenha} erro={erroSenha} autoComplete="current-password" />
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Confirmando…' : 'Confirmar e-mail'}</button>
      </form>
    </main>
  )
}

export function Mensagem({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main>
      <h1>{titulo}</h1>
      <p role="status">{texto}</p>
    </main>
  )
}
