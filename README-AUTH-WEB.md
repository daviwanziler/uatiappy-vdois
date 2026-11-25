# UatiAppy — autenticação web (Issues #90 e #91)

## Stack
React + JavaScript + Vite + Supabase Auth.

## Configuração local
1. Execute `npm install`.
2. Copie `.env.example` para `.env`.
3. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores públicos do projeto Supabase.
4. Execute `npm run dev`.

Nunca coloque a chave `service_role` em variáveis `VITE_*`, no navegador ou no repositório.

## Issue #90 — provisionamento administrativo
Não existe autocadastro público. Um Administrador autenticado cria contas de funcionários pela tela administrativa. A criação ocorre pela Edge Function `admin-create-user`, que valida o JWT e o papel `ADMINISTRADOR` no servidor antes de usar a chave service role.

Para implantar a função, configure os segredos do projeto Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`) no ambiente de Functions e execute:

```bash
supabase functions deploy admin-create-user
```

A primeira conta Administrador precisa ser provisionada de forma segura fora da aplicação, com `app_metadata.role = ADMINISTRADOR`.

## Issue #91 — login, logout e sessão
O Supabase Auth autentica e mantém a sessão no navegador. O AppGate separa a tela de login, a área administrativa e a área do funcionário com base no papel gravado em `app_metadata`.

## Premissas e pendências
- O PO ainda precisa aprovar os campos obrigatórios e o identificador único. O e-mail está sendo usado provisoriamente como identificador por ser o identificador nativo do fluxo email/senha do Supabase Auth.
- Política de senha inicial, troca obrigatória no primeiro acesso e canal de entrega das credenciais precisam de validação do PO/administrador.
- O papel deve ser gravado apenas por operação confiável no backend; não aceitar papel enviado pelo cliente.
- O bloqueio/desativação de contas e revogação administrativa de sessões dependem de regra e modelagem de backend ainda não fornecidas.
- A proteção visual do AppGate não substitui políticas RLS e autorização no backend para os dados do sistema.
- Testes automatizados atuais cobrem validações puras; testes integrados exigem projeto Supabase configurado.

## Testes
```bash
npm test
npm run build
```
