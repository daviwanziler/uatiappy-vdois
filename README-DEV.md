# UatiAppy — desenvolvimento

## Stack atual

- HTML5, CSS3 e JavaScript puro (módulos ES)
- Supabase Auth, PostgreSQL, RLS e Edge Functions
- Vercel para hospedagem estática
- Node.js 22+ apenas para scripts de desenvolvimento, configuração e testes
- Visual Studio Code como editor

React, React Native, Expo, Vite e bundlers não fazem parte do frontend nesta etapa.

## Configuração local

1. Instale Node.js 22 ou superior.
2. Copie `.env.example` para `.env`.
3. Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` com a URL e a chave pública/anon do projeto.
4. Execute `npm run dev`.
5. Acesse http://localhost:4173.

O servidor local usa apenas módulos nativos do Node.js. O SDK Supabase é carregado pelo navegador via CDN com versão fixada.

## Testes e validação

```bash
npm test
npm run check:frontend
npm run build
deno test --allow-env supabase/functions/tests/security_test.ts
supabase start
supabase db reset
supabase test db
```

O build não compila o frontend: gera `public/js/config.js` a partir das variáveis de ambiente. Sem variáveis configuradas, o site é gerado em modo sem conexão para permitir validação estática.

## Segurança

- Nunca coloque `service_role` no frontend, em `public/js/config.js`, no repositório ou em variáveis destinadas ao navegador.
- A chave anon é pública e depende das políticas RLS para proteger os dados.
- Cadastro de funcionários e alteração de status usam Edge Functions; o servidor valida JWT, papel e estado da conta.
- Não habilite cadastro público no Supabase Auth.
