import { Mensagem, VerificarEmailPage } from './features/auth/VerificarEmailPage'
import { DocumentoLegal } from './features/legal/DocumentoLegal'
import { Painel } from './features/painel/Painel'

// As páginas fixas saem do caminho da URL; o painel trata os caminhos dele em features/painel/rotas.ts.
export default function App() {
  if (location.pathname === '/painel' || location.pathname.startsWith('/painel/')) return <Painel />
  switch (location.pathname) {
    case '/verificar-email':
      return <VerificarEmailPage />
    case '/termos':
      return <DocumentoLegal titulo="Termos de Uso" />
    case '/privacidade':
      return <DocumentoLegal titulo="Política de Privacidade" />
    default:
      return <Mensagem titulo="Squad" texto="Baixe o app para entrar na Squad." />
  }
}
