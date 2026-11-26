# Validação da migração Vanilla JS

## Escopo já adaptado

- Frontend em HTML, CSS e módulos JavaScript nativos.
- SDK Supabase carregado por CDN com versão fixada.
- Configuração pública gerada durante o build.
- Deploy estático Vercel sem Vite.
- CI separado em validação frontend, testes Deno e testes Supabase/pgTAP.

## Evidências de CI observadas

Na execução `45832254079`, referente ao commit `7728f171f1b7ee604273f6859060491ed25eb29b`:

- O job `frontend` concluiu com sucesso: verificação estática, testes JavaScript e geração da configuração.
- O job `deno-security` concluiu com sucesso.
- O job `supabase-security` aplicou todas as cinco migrations em banco local limpo, mas o pgTAP falhou na seção de rate limit.

## Correção de fixture

O teste reutilizava `user_a`, que já possuía uma linha de auditoria criada pela verificação de reconciliação anterior. Essa linha era corretamente contabilizada pelo rate limit e fazia o teste esperar cinco novas reservas quando só havia quatro disponíveis.

A fixture de rate limit foi isolada para usar `user_b`, sem histórico de auditoria anterior. A alteração é exclusivamente de teste; nenhuma migration, função de produção, política RLS ou limite de segurança foi enfraquecido.

## Pendências antes de aprovação

- Obter nova execução verde de `supabase db reset` e `supabase test db` após a correção da fixture.
- Testar autenticação, cadastro administrativo e gestão de contas contra projeto Supabase de staging.
- Confirmar variáveis públicas e saída estática na Vercel.
- Validar visualmente em viewport mobile e desktop.
- Revisão e aprovação do TechLead.

A PR deve permanecer em Draft até essas verificações serem concluídas.
