# Squad Web

Front-end web simples da Squad (React + TypeScript + Vite). Serve à página aberta pelo link de verificação de e-mail, aos documentos legais e ao painel do dono de quadra (`/painel`). Consome a API do `squad-backend`.

```bash
cp .env.example .env.local   # ajuste VITE_API_URL; o .gitignore ignora *.local
npm install
npm run dev
```

Hospedagem: Vercel (`vercel.json` já reescreve todas as rotas para o `index.html`). A variável `VITE_API_URL` é configurada no painel da Vercel.
