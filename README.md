# Squad Web

Front-end web simples da Squad (React + TypeScript + Vite). Hoje serve às páginas abertas por link de e-mail (verificação de e-mail e redefinição de senha). Consome a API do `squad-backend`.

```bash
cp .env.example .env   # ajuste VITE_API_URL
npm install
npm run dev
```

Hospedagem: Vercel (`vercel.json` já reescreve todas as rotas para o `index.html`). A variável `VITE_API_URL` é configurada no painel da Vercel.
