import { useState, type FormEvent } from 'react'
import { post } from '../../core/api/http'
import { CampoSenha } from './CampoSenha'
import { LINK_INVALIDO, erroDoCampo, mensagemGeral } from './erros'
import { tokenDoLink } from './linkToken'
import { Mensagem } from './VerificarEmailPage'
import { validarNovaSenha } from './validacao.ts'

export function RedefinirSenhaPage() {
  const [senha, setSenha] = useState('')
  const [repetida, setRepetida] = useState('')
  const [erros, setErros] = useState<{ senha?: string; repetida?: string }>({})
  const [erro, setErro] = useState<string>()
  const [enviando, setEnviando] = useState(false)
  const [concluido, setConcluido] = useState(false)

  if (!tokenDoLink) return <Mensagem titulo="Link inválido" texto={LINK_INVALIDO} />
  if (concluido) return <Mensagem titulo="Senha alterada" texto="Volte ao app e entre com a nova senha." />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(undefined)
    const validacao = validarNovaSenha(senha, repetida)
    setErros(validacao)
    if (validacao.senha || validacao.repetida) return
    setEnviando(true)
    try {
      await post('/auth/reset-password', { token: tokenDoLink, novaSenha: senha })
      setConcluido(true)
    } catch (err) {
      const doCampo = erroDoCampo(err, 'novaSenha')
      if (doCampo) setErros({ senha: doCampo })
      else setErro(mensagemGeral(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <h1>Nova senha</h1>
      <form onSubmit={enviar} noValidate>
        <CampoSenha rotulo="Nova senha" valor={senha} aoMudar={setSenha} erro={erros.senha} autoComplete="new-password" />
        <CampoSenha rotulo="Repita a senha" valor={repetida} aoMudar={setRepetida} erro={erros.repetida} autoComplete="new-password" />
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar nova senha'}</button>
      </form>
    </main>
  )
}
