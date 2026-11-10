import marca from '../../assets/marca-squad.png'
import { LINK_ANDROID, LINK_IPHONE, MENSAGEM_DO_DONO, WHATSAPP_DA_EQUIPE, linkDoWhatsApp } from './lancamento.ts'

const PARA_QUEM_JOGA = [
  'Crie sua partida ou entre numa perto de você.',
  'Faltou gente? Abra as vagas e complete o time.',
  'Reserve a quadra na hora em que cria a partida.',
  'Monte campeonatos de pontos corridos, mata-mata ou grupos.',
  'Veja quem mais jogou no ranking do mês e compartilhe o resultado no Stories.',
]

const PARA_QUEM_TEM_QUADRA = [
  'Cadastre seus locais, quadras e horários de funcionamento.',
  'As reservas feitas pelo app caem direto na sua agenda.',
  'Bloqueie horários e cancele uma reserva quando precisar.',
  'Tudo pelo navegador, no computador ou no celular.',
]

const WHATSAPP = linkDoWhatsApp(WHATSAPP_DA_EQUIPE, MENSAGEM_DO_DONO)

function LinkExterno({ para, children }: { para: string; children: string }) {
  return <a className="botao" href={para} target="_blank" rel="noopener noreferrer">{children}</a>
}

function Lojas() {
  if (LINK_ANDROID === null && LINK_IPHONE === null) {
    return <p><span className="etiqueta">EM BREVE</span> Para Android e iPhone.</p>
  }
  return (
    <div className="acoes">
      {LINK_ANDROID === null ? <p>Em breve para Android.</p> : <LinkExterno para={LINK_ANDROID}>Baixar para Android</LinkExterno>}
      {LINK_IPHONE === null ? <p>Em breve para iPhone.</p> : <LinkExterno para={LINK_IPHONE}>Baixar para iPhone</LinkExterno>}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-topo">
        <img src={marca} alt="Squad" width={120} height={25} />
        <a href="/painel">Entrar no painel</a>
      </header>
      <main>
        <section className="landing-abertura">
          <h1>A resenha começa aqui.</h1>
          <p>Ache uma partida perto de você, complete o time e jogue com gente nova. Futebol, vôlei e futevôlei.</p>
          <Lojas />
        </section>
        <div className="landing-publicos">
          <section aria-labelledby="quem-joga">
            <h2 id="quem-joga">Para quem joga</h2>
            <ul>{PARA_QUEM_JOGA.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="landing-dono" aria-labelledby="quem-tem-quadra">
            <h2 id="quem-tem-quadra">Para quem tem quadra</h2>
            <ul>{PARA_QUEM_TEM_QUADRA.map((item) => <li key={item}>{item}</li>)}</ul>
            <p>Quer sua quadra na Squad? Fale com a gente.</p>
            {WHATSAPP === null
              ? <p>Em breve você vai poder falar com a gente por aqui.</p>
              : <LinkExterno para={WHATSAPP}>Falar no WhatsApp</LinkExterno>}
            <p>Já é dono na Squad? <a href="/painel">Entrar no painel</a></p>
          </section>
        </div>
      </main>
      <footer className="landing-rodape">
        <nav aria-label="Documentos">
          <a href="/termos">Termos de Uso</a>
          <a href="/privacidade">Política de Privacidade</a>
        </nav>
        <p>A Squad é para maiores de 18 anos.</p>
      </footer>
    </div>
  )
}
