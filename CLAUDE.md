# Squad Web

## Contexto

Squad é um app social de esportes. Este repositório é o front-end web, feito em React + TypeScript (Vite), hospedado na Vercel. Ele consome a API do backend (`squad\squad-backend`). Por enquanto é pequeno: serve às páginas abertas por links de e-mail (verificação de e-mail e redefinição de senha), que o app mobile (`squad\squad-mobile`) não atende. O projeto está em fase de MVP, mas pode ter crescimento exponencial de usuários. Por isso performance, segurança e a carga que o front gera no backend são tratadas com cuidado desde o início.

## Stack

```
React + TypeScript (strict) / Vite
Organização: feature first
Requisições: fetch nativo (src/core/api/http.ts)
```

## Antes de começar qualquer tarefa

1. Leia a wiki, que fica em repositório separado: `squad\squad-wiki`. Comece pelo `README.md` e siga só os links relevantes para a tarefa; não leia tudo. Para você a wiki é somente leitura: não a edite, quem a atualiza sou eu.
2. Em tarefas maiores que um ajuste pontual, diga em poucas linhas o que entendeu e o que pretende alterar, antes de escrever código.
3. A wiki é a fonte confiável do projeto. Se o código contradisser a wiki, pare e me avise antes de seguir, para decidirmos o rumo (corrigir o código ou atualizar a wiki). Não decida sozinho qual dos dois está certo.
4. Se o pedido for ambíguo, pergunte antes de implementar. Reúna as dúvidas numa única mensagem.

## Simplicidade: o necessário, nunca o luxo

Faça o que é necessário, no menor nível de implementação possível. Antes de incluir qualquer coisa, pergunte: "o que quebra ou degrada se eu não fizer isso?". Se houver uma resposta concreta (um risco de segurança, um gargalo previsível, um bug de concorrência), é necessário e deve ser feito, mesmo que seja sofisticado. Se a resposta for só "fica mais elegante", "pode ser útil no futuro" ou "é boa prática", é luxo: não faça.

Na prática, evite overengineering:

- Não crie abstração, camada, hook ou componente genérico "para o futuro". Abstração só quando houver pelo menos dois usos reais.
- Não adicione funcionalidade, parâmetro, flag ou configuração que não foi pedida.
- Reaproveite o que já existe no projeto, no React e no navegador (fetch, `<form>`, validação nativa do HTML) antes de escrever código novo ou adicionar dependência.
- Mantenha o diff pequeno e focado. Não refatore o que não faz parte da tarefa; se achar algo que merece refatoração, aponte no fim.
- Entre duas soluções que atendem, escolha a mais simples e diga em uma linha por quê.

O necessário inclui segurança, o básico de performance e o tratamento de erros (seções abaixo). Isso vale em toda tarefa e não conta como overengineering.

## Estrutura (feature first)

```
src/
├── core/          # o que é compartilhado: cliente HTTP, tema, utilitários
│   └── api/
└── features/
    └── <feature>/ # ex.: auth (verificar e-mail, redefinir senha)
```

- Cada feature guarda suas próprias páginas, componentes, chamadas à API e tipos. Uma feature não importa de dentro de outra; o que for usado por duas vai para `core`.
- Não crie pastas ou camadas vazias antecipadamente. A pasta nasce quando o primeiro arquivo precisar dela.

## Design e UI

Cada elemento gráfico precisa servir à identidade, à hierarquia ou à interação. Se não serve a nenhum dos três, não entra. Evite gradientes genéricos, blobs, glassmorphism, excesso de cards, estética genérica de SaaS e referências literais a esportes.

- Siga a identidade do design system da wiki (`squad-wiki/design/design-system.md`) e o que já existe no projeto. Cores, tipografia e espaçamentos ficam centralizados (CSS variables), não espalhados pelos componentes.
- Na dúvida sobre a direção visual, pergunte em vez de improvisar.
- Acessibilidade básica: `label` em todo campo, contraste legível, foco visível, navegação por teclado, áreas de toque adequadas. As páginas são abertas principalmente no celular: layout responsivo.
- Toda tela que depende de dados trata os estados de carregando, sucesso e erro.
- Mensagens de erro em vermelho, junto ao campo quando forem de validação, claras e sem detalhe técnico.

## Segurança (vale em toda tarefa)

- O navegador não é um lugar confiável. Validação no front é só conveniência de UX; a regra de verdade é do servidor.
- Nenhum segredo no front: tudo que entra no bundle (`VITE_*`) é público. Só a URL da API vai em variável de ambiente; documente-a no `.env.example`, sem valores reais. Nunca commite `.env`.
- Tokens vindos de link de e-mail (verificação, redefinição de senha) são sensíveis: não logue, não envie a terceiros (nada de analytics ou fontes externas que recebam a URL), e remova-os da URL (`history.replaceState`) depois de lidos.
- Nunca use `dangerouslySetInnerHTML` com conteúdo que não seja seu. Nunca injete resposta da API como HTML.
- Nunca logue senha, token ou dado pessoal, nem em `console.log` de debug.
- Toda comunicação por HTTPS. Não desabilite validação de certificado nem coloque URL de API fixa no código.
- Não confie cegamente na resposta da API: trate campos ausentes ou formatos inesperados sem quebrar a tela.
- Mensagens de erro exibidas ao usuário são claras e sem detalhe técnico.
- Ao adicionar dependência, prefira uma mantida e amplamente usada; cada uma custa no tamanho do bundle.

## Chamadas à API e concorrência (vale em toda tarefa)

- O contrato da API vem do backend e da wiki. Não invente rotas, campos ou status; se faltar algo, avise em vez de supor (o backend é outro repositório).
- Ações que disparam efeito (ex.: enviar nova senha) impedem duplicidade: desabilite o botão enquanto a requisição está pendente.
- Toda chamada tem timeout, e falhas de rede, timeout e erro de servidor geram feedback ao usuário. Respeite 429 (limite de requisições) e não refaça automaticamente operações com efeito.
- Cancele ou ignore respostas de componentes já desmontados (`AbortController` no `useEffect`), para não misturar respostas de requisições concorrentes. Cuidado com o `StrictMode`, que executa efeitos duas vezes em dev: uma chamada com efeito (ex.: confirmar e-mail) não pode ser disparada por um `useEffect` sem proteção.

## Performance

- Bundle pequeno: sem biblioteca grande para o que o navegador ou poucas linhas resolvem. Carregue código sob demanda (`lazy`) só se o bundle passar a pesar.
- Não gere carga desnecessária no backend: sem chamadas repetidas ou em loop, sem polling, sem refazer a cada renderização uma requisição que já foi feita.
- Sem trabalho pesado durante a renderização. Imagens no tamanho necessário.

## Código e testes

- TypeScript em modo `strict`: sem `any`; tipe as respostas da API na fronteira.
- Siga o estilo e a estrutura que já existem antes de introduzir outros. Não introduza novos avisos do lint (`npm run lint`).
- Trate erros explicitamente, sem engolir exceções em silêncio.
- Escreva testes focados no que custa caro se falhar (fluxos críticos e tratamento de erro da API). Não persiga cobertura total. Se o projeto ainda não tiver ferramenta de teste, proponha uma antes de instalar.
- Sem comentários que só repetem o código. Comente o "porquê" quando não for óbvio.

## Git

- Commits pequenos, uma mudança lógica por commit, mensagem clara. Nunca commite segredos. Não use `push --force` sem eu pedir.

## Peça antes de fazer

- Adicionar dependência nova relevante (roteador, biblioteca de UI, de formulário, de testes...).
- Mudar configuração de build ou de deploy (Vite, Vercel).
- Mudança que dependa de alteração na API do backend.
- Se algo que eu pedir conflitar com segurança ou com estas regras, aponte o conflito e proponha uma alternativa, em vez de seguir em silêncio.

## Ao terminar uma tarefa

1. Rode `npm run build` e `npm run lint` e diga o resultado.
2. Resuma em poucas linhas o que mudou e o que ficou de fora de propósito, destacando o que altera o comportamento visível ou depende da API, para eu documentar na wiki.
