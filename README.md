# Squad Web

Front-end web simples da Squad (React + TypeScript + Vite). Serve à landing page (`/`), aos documentos legais, à exclusão de conta sem o app (`/excluir-conta`) e ao painel do dono de quadra (`/painel`). A confirmação de e-mail e a troca de senha são por código, no app. Consome a API do `squad-backend`. O número do WhatsApp da equipe e os links das lojas ficam em `src/features/landing/lancamento.ts`, até o lançamento valendo `null`.

```bash
cp .env.example .env.local   # ajuste VITE_API_URL; o .gitignore ignora *.local
npm install
npm run dev
```

Hospedagem: Vercel (`vercel.json` já reescreve todas as rotas para o `index.html`). A variável `VITE_API_URL` é configurada no painel da Vercel.
