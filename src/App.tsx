import { DocumentoLegal } from './features/legal/DocumentoLegal'
import { Painel } from './features/painel/Painel'

// As páginas fixas saem do caminho da URL; o painel trata os caminhos dele em features/painel/rotas.ts.
// A confirmação de e-mail e a troca de senha acontecem no app, por código: o web não tem página de link de e-mail.
export default function App() {
  if (location.pathname === '/painel' || location.pathname.startsWith('/painel/')) return <Painel />
  switch (location.pathname) {
    case '/termos':
      return <DocumentoLegal titulo="Termos de Uso" />
    case '/privacidade':
      return <DocumentoLegal titulo="Política de Privacidade" />
    default:
      return (
        <main>
          <h1>Squad</h1>
          <p role="status">Baixe o app para entrar na Squad.</p>
        </main>
      )
  }
}
