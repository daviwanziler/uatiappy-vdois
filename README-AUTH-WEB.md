# UatiAppy — autenticação e segurança web

## Stack
React + JavaScript + Vite + Supabase Auth/PostgreSQL/Edge Functions.

## Configuração local
1. Execute `npm install`.
2. Copie `.env.example` para `.env`.
3. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores públicos do projeto.
4. Execute `npm run dev`.

Nunca coloque `service_role` em variáveis `VITE_*`, no navegador, no repositório ou em logs.

## Políticas aprovadas para esta implementação
- Senha de funcionário: 12 a 128 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo.
- Não há troca obrigatória no primeiro acesso nesta versão. A credencial inicial deve ser entregue por canal seguro e o usuário deve alterá-la em fluxo futuro aprovado.
- Limite de criação: 5 tentativas por usuário autenticado em uma janela móvel de 1 hora, inclusive chamadas não autorizadas. Após atingir o limite, novas tentativas não geram novas linhas de auditoria.
- Contas recém-criadas por qualquer fluxo sem metadado server-side `provisioned_by_admin=true` recebem status `DISABLED`; apenas a Edge Function administrativa usa esse marcador. Metadados enviados pelo cliente em `user_metadata` são ignorados.
- Contas: `ACTIVE`, `BLOCKED` e `DISABLED`. Bloqueio/desativação atualiza o estado no banco e aplica banimento no Supabase Auth; RLS bloqueia imediatamente sessões antigas.
- Conversas: somente mensagens diretas entre dois funcionários ativos. Participantes só leem mensagens das conversas das quais fazem parte.
- Papéis confiáveis: `ADMINISTRADOR` e `FUNCIONARIO`, derivados de `auth.users.raw_app_meta_data`; o cliente não pode alterar seu próprio papel.

## Migrações do banco
As migrações `supabase/migrations/20261125000100_security_baseline.sql`, `supabase/migrations/20261125000200_security_hardening.sql` e `supabase/migrations/20261125000300_conversations_and_audit_schema.sql` criam e endurecem:
- `employee_profiles` com papel e estado da conta; novos usuários sem marcador confiável permanecem `DISABLED`;
- `conversations`, `conversation_participants` e `messages`;
- políticas RLS e funções auxiliares para verificar conta ativa e participação;
- RPC `create_direct_conversation`;
- trilha `employee_creation_audit` e reserva atômica de tentativas.

Aplicar somente no projeto Supabase correto, após revisar o ambiente:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

A migração sincroniza perfis para usuários existentes e desativa contas sem marcador confiável de provisionamento. Antes de liberar o uso, confirme que a conta administrativa inicial foi provisionada por canal administrativo seguro com `app_metadata.role = ADMINISTRADOR` e `app_metadata.provisioned_by_admin = true`. Não configure esses valores via formulário público ou `user_metadata`.

## Supabase Auth — cadastro público desabilitado

A configuração local em `supabase/config.toml` define `[auth].enable_signup = false`. No projeto hospedado, confirme também no Dashboard do Supabase:

1. Abra **Authentication → Settings** (ou **Sign In / Providers**, conforme a versão do Dashboard).
2. Desative **Allow new users to sign up / Enable signups**.
3. Salve e teste uma chamada direta a `supabase.auth.signUp()`: ela deve ser recusada.
4. Mantenha o provisionamento de funcionários exclusivamente na Edge Function `admin-create-user`.

A configuração do repositório não altera sozinha as opções de Auth de um projeto hospedado. Essa etapa precisa ser aplicada no Dashboard do projeto de destino.

## Edge Functions
Implantar as funções:

```bash
supabase functions deploy admin-create-user
supabase functions deploy admin-set-account-status
```

Configure `ALLOWED_ORIGINS` como lista separada por vírgula, sem barra final, por exemplo:

```bash
supabase secrets set ALLOWED_ORIGINS="https://app.seudominio.com,https://admin.seudominio.com"
```

Em Supabase hospedado, CORS falha fechado quando a allowlist não está configurada. Em desenvolvimento local, as origens localhost são aceitas automaticamente somente quando a própria `SUPABASE_URL` aponta para localhost. Ambas as funções verificam o JWT, o papel e o estado ativo do administrador no servidor. A chave `SUPABASE_SERVICE_ROLE_KEY` permanece exclusivamente no ambiente server-side da Edge Function.

## Issues SQA cobertas
- **#104:** tela de acesso não autorizado oferece logout e retorna ao login quando a sessão é encerrada.
- **#105:** logout trata erros e mantém a interface consistente com a sessão real.
- **#106:** política de senha definida e aplicada no frontend e na Edge Function, com testes de limites e complexidade.
- **#107:** gestão administrativa de estado de conta; banimento no Auth e bloqueio por RLS para tokens antigos.
- **#108:** CORS com allowlist explícita, preflight e comportamento fail-closed em produção.
- **#109:** rate limiting transacional por administrador e trilha de auditoria sem senha/token/e-mail em texto puro.
- **#110:** RLS para perfis, conversas, participantes e mensagens; testes negativos de isolamento e elevação de privilégio.
- **#111:** sign-up público desabilitado na configuração local; perfis sem marcador server-side ficam DISABLED; metadados de usuário não concedem papel nem ativação.
- **#112:** rate limit executado antes de qualquer registro de auditoria para usuários não administradores; somente as cinco primeiras tentativas por hora geram registros, e tentativas bloqueadas não geram novas linhas.
- **#113:** plano pgTAP atualizado para 15 asserções, incluindo hash de e-mail normalizado e separação do ID do ator.
- **#114:** `email_sha256` recebe SHA-256 de `trim().toLowerCase()` do e-mail alvo; `actor_id` continua sendo o UUID do administrador.
- **#115:** todos os caminhos após reserva finalizam a tentativa; JSON/dados inválidos usam `VALIDATION_FAILURE`; exceções geram `FAILURE`, logs estruturados e timeout de pendências após 15 minutos pela rotina de manutenção.
- **#116:** migration cria conversas, participantes, mensagens, índices, constraints, RLS e RPC `create_direct_conversation`, com bloqueio de criação direta e prevenção de duplicidade.

## Testes
```bash
npm test
npm run build
deno test --allow-env supabase/functions/tests/security_test.ts
supabase test db
```

Os testes SQL usam pgTAP e devem ser executados em ambiente local/descartável com a migração aplicada: `supabase start` e `supabase test db`. A suíte declara e executa 13 asserções. Antes de produção, revisar o esquema final de todas as tabelas públicas, executar os testes integrados e confirmar a configuração de Auth, CORS e segredos no projeto de destino.
A função `public.cleanup_employee_creation_audit()` finaliza reservas `PENDING` com mais de 15 minutos como falha monitorável e remove registros com mais de 90 dias. Agende sua execução diária por Supabase Cron/pg_cron ou por um job server-side confiável. Agende sua execução diária por Supabase Cron/pg_cron ou por um job server-side confiável.

## Observações operacionais
- A tela administrativa permite criar, bloquear, desativar e reativar contas de funcionários.
- Administradores não podem bloquear a própria conta nem alterar outra conta administrativa por esta função; essa operação exige procedimento de recuperação separado.
- O MVP não inclui redefinição de senha nem fluxo de troca obrigatória no primeiro acesso.
