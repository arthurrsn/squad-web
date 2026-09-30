import { Mensagem, VerificarEmailPage } from './features/auth/VerificarEmailPage'
import { RedefinirSenhaPage } from './features/auth/RedefinirSenhaPage'
import { DocumentoLegal } from './features/legal/DocumentoLegal'

// Quatro páginas fixas: o caminho da URL basta, sem roteador.
export default function App() {
  switch (location.pathname) {
    case '/verificar-email':
      return <VerificarEmailPage />
    case '/redefinir-senha':
      return <RedefinirSenhaPage />
    case '/termos':
      return <DocumentoLegal titulo="Termos de Uso" />
    case '/privacidade':
      return <DocumentoLegal titulo="Política de Privacidade" />
    default:
      return <Mensagem titulo="Squad" texto="Baixe o app para entrar na Squad." />
  }
}
