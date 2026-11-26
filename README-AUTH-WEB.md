# UatiAppy — autenticação e segurança Web

## Stack

HTML + CSS + JavaScript puro, Supabase Auth/PostgreSQL/Edge Functions e hospedagem estática na Vercel. O SDK `@supabase/supabase-js@2.81.1` é carregado por CDN; não há React, JSX ou Vite.

## Configuração local

1. Copie `.env.example` para `.env`.
2. Defina `SUPABASE_URL` e `SUPABASE_ANON_KEY` com valores públicos.
3. Execute `npm run dev`.

O script gera `public/js/config.js`. Não edite nem versione valores reais desse arquivo.

## Configuração Vercel

Configure as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_ANON_KEY` no projeto Vercel para os ambientes Preview e Production. O comando `npm run build` gera o arquivo público `public/js/config.js`. A chave anon é intencionalmente pública; jamais configure `SUPABASE_SERVICE_ROLE_KEY` na Vercel para este frontend.

O `vercel.json` define build sem framework e saída estática em `public`.

## Segurança e regras preservadas

- Senha de funcionário: 12–128 caracteres, maiúscula, minúscula, número e símbolo.
- Não existe autocadastro público. A criação ocorre exclusivamente por Edge Function administrativa.
- Novas contas sem metadado server-side `provisioned_by_admin=true` permanecem `DISABLED`.
- Papéis confiáveis são derivados de `auth.users.raw_app_meta_data`; `user_metadata` do cliente não concede privilégios.
- Contas possuem estados `ACTIVE`, `BLOCKED` e `DISABLED`.
- Administradores autenticados e ativos são validados novamente no servidor para ações privilegiadas.
- RLS protege perfis, conversas, participantes e mensagens.
- A chave `service_role` permanece exclusivamente no ambiente server-side das Edge Functions.

## Edge Functions

Implante `admin-create-user` e `admin-set-account-status`. Configure `ALLOWED_ORIGINS` com a origem HTTPS publicada na Vercel. Em produção, CORS falha fechado sem allowlist.

## Migrations e testes

As migrations existentes em `supabase/migrations`, testes Deno e pgTAP são preservados. Execute os testes em banco local descartável:

```bash
deno test --allow-env supabase/functions/tests/security_test.ts
supabase start
supabase db reset
supabase test db
```

A configuração local `auth.enable_signup = false` não altera automaticamente o projeto hospedado. Confirme também no Dashboard do Supabase que o cadastro público está desabilitado.

## Escopo funcional desta interface

- Login de funcionários e administradores.
- Persistência e observação da sessão Supabase Auth.
- Roteamento por `app_metadata.role`.
- Tela de acesso não autorizado com logout.
- Cadastro administrativo por Edge Function.
- Listagem e alteração de estado de contas por Edge Function.
- Logout com tratamento de falhas.

A tela do funcionário é uma página inicial. A interface de conversas e mensagens não está incluída nesta adaptação.
