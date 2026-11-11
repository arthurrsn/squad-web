import { useState, type FormEvent } from 'react'
import { CampoSenha } from '../../core/CampoSenha'
import { excluirConta, mensagemDaExclusao } from './excluirConta.ts'

const CONSEQUENCIAS = [
  'Seu nome, @, bio e esportes saem da Squad, e você sai de todos os aparelhos.',
  'As partidas e os campeonatos que você organiza e que ainda não terminaram são cancelados, e quem está neles é avisado.',
  'Você sai das partidas futuras em que está.',
  'Se você tem quadra na Squad, as reservas futuras são canceladas e seus locais saem da busca.',
  'As partidas que já aconteceram continuam no histórico de quem jogou, com "Conta apagada" no seu lugar.',
]

/** O link que o Google Play pede para excluir a conta sem o app. Nada fica guardado no navegador. */
export function ExcluirContaPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string>()
  const [enviando, setEnviando] = useState(false)
  const [excluida, setExcluida] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(undefined)
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }
    setEnviando(true)
    try {
      await excluirConta(email.trim(), senha)
      setSenha('')
      setExcluida(true)
    } catch (err) {
      setErro(mensagemDaExclusao(err))
    } finally {
      setEnviando(false)
    }
  }

  if (excluida) {
    return (
      <main>
        <h1>Excluir conta</h1>
        <p role="status">Sua conta foi excluída.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Excluir conta</h1>
      <p>Ao excluir sua conta:</p>
      <ul>
        {CONSEQUENCIAS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>Não tem volta. Com o mesmo e-mail, você pode criar uma conta nova, do zero.</p>
      <form onSubmit={enviar} noValidate>
        <label htmlFor="email">
          E-mail
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <CampoSenha rotulo="Senha" valor={senha} aoMudar={setSenha} autoComplete="current-password" />
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Excluindo…' : 'Excluir minha conta'}</button>
      </form>
      <p>Esqueceu a senha? Troque no app, em Esqueci minha senha.</p>
    </main>
  )
}
