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
- **#113:** plano pgTAP atualizado para 23 asserções; a contagem foi conferida no arquivo SQL e deve ser confirmada pela execução de `supabase test db`.
- **#114:** `email_sha256` recebe SHA-256 de `trim().toLowerCase()` do e-mail alvo; `actor_id` continua sendo o UUID do administrador.
- **#115:** todos os caminhos após reserva finalizam a tentativa; JSON/dados inválidos usam `VALIDATION_FAILURE`; exceções geram `FAILURE`, logs estruturados e timeout de pendências após 15 minutos pela rotina de manutenção.
- **#116:** migration cria conversas, participantes, mensagens, índices, constraints, RLS e RPC `create_direct_conversation`, com bloqueio de criação direta e prevenção de duplicidade.
- **#117:** teste de autoelevação verifica ausência do privilégio SQL `UPDATE`, rejeição de atualização direta e persistência do papel `FUNCIONARIO`.
- **#118:** migration `20261125000400_audit_cleanup_schedule.sql` instala job diário no Supabase Cron às 03:17 UTC, registra sucesso/falha e restringe execução da rotina a identidades confiáveis.
- **#119:** contagem documentada sincronizada com `extensions.plan(19)` e com as 19 chamadas de asserção; instruções operacionais e limitações do ambiente hospedado foram separadas.

## Testes
```bash
npm test
npm run build
deno test --allow-env supabase/functions/tests/security_test.ts
supabase test db
```

Os testes SQL usam pgTAP e devem ser executados em ambiente local/descartável com as migrations aplicadas: `supabase start`, `supabase db reset` e `supabase test db`. O arquivo `supabase/tests/security_rls.test.sql` declara `extensions.plan(23)` e contém 23 chamadas de asserção. A execução bem-sucedida de `supabase test db` no CI é a evidência necessária para considerar a suíte validada.

### Limpeza automática da auditoria

A migration `20261125000400_audit_cleanup_schedule.sql` habilita `pg_cron` e instala idempotentemente o job `uatiappy-cleanup-employee-creation-audit`, diariamente às 03:17 UTC. A rotina finaliza reservas `PENDING` com mais de 15 minutos como `FAILURE/AUDIT_FINALIZATION_TIMEOUT` e remove registros com mais de 90 dias. Cada execução grava início, término, quantidade de pendências finalizadas, quantidade removida e estado em `employee_creation_audit_cleanup_runs`; erros são registrados e relançados para que o Supabase Cron também registre falha.

Para verificar no banco de destino:

```sql
select jobid, jobname, schedule, command, active
from cron.job
where jobname = 'uatiappy-cleanup-employee-creation-audit';

select *
from cron.job_run_details
where jobid = (
  select jobid from cron.job
  where jobname = 'uatiappy-cleanup-employee-creation-audit'
)
order by start_time desc
limit 20;

select *
from public.employee_creation_audit_cleanup_runs
order by started_at desc
limit 20;
```

A migration configura o agendamento no banco em que for aplicada. Em Supabase hospedado, a instalação e a primeira execução precisam ser confirmadas no projeto de destino; o código versionado e os testes locais não comprovam, por si só, que a migration já foi aplicada remotamente. Em caso de falha, consulte `cron.job_run_details` e `employee_creation_audit_cleanup_runs`, corrija a causa e execute manualmente `select public.cleanup_employee_creation_audit();` com uma identidade administrativa confiável. A função não pode ser executada por `anon` ou `authenticated`.

Antes de produção, revisar o esquema final, executar os testes integrados e confirmar Auth, CORS, segredos e agendamento no projeto hospedado.

## Observações operacionais
- A tela administrativa permite criar, bloquear, desativar e reativar contas de funcionários.
- Administradores não podem bloquear a própria conta nem alterar outra conta administrativa por esta função; essa operação exige procedimento de recuperação separado.
- O MVP não inclui redefinição de senha nem fluxo de troca obrigatória no primeiro acesso.


### Reconciliação da criação de funcionários — Issue #120

A migration `20261125000500_employee_creation_audit_reconciliation.sql` adiciona `account_user_id` à auditoria e funções server-side para reconciliar tentativas pendentes com usuários reais do Supabase Auth pelo hash SHA-256 do e-mail normalizado. A limpeza diária tenta reconciliar antes de marcar uma tentativa antiga como falha. A Edge Function grava o ID do usuário criado; se a gravação falhar, responde HTTP 202 com `PENDING_RECONCILIATION`, não comunica falha de criação e instrui o administrador a não repetir a operação. Uma nova solicitação verifica/reconcilia uma conta já existente antes de chamar `createUser`. A tela administrativa exibe esse estado explicitamente.

A resposta HTTP 202 indica que a conta foi criada, mas a auditoria ainda depende de reconciliação. Confirme a reconciliação consultando `employee_creation_audit.account_user_id`, `outcome` e `detail_code`; não solicite um novo cadastro enquanto o estado estiver pendente.
