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

A primeira conta Administrador precisa ser provisionada de forma segura fora da aplicação, com `app_metadata.role = ADMINISTRADOR`.\n\nA Edge Function restringe CORS às origens configuradas em `ALLOWED_ORIGINS`, separadas por vírgula. Em desenvolvimento, na ausência dessa variável, somente `http://localhost:5173` e `http://127.0.0.1:5173` são aceitas. Em produção, configure explicitamente os domínios HTTPS autorizados no ambiente da Edge Function; não mantenha o fallback de desenvolvimento.

## Issue #91 — login, logout e sessão
O Supabase Auth autentica e mantém a sessão no navegador. O AppGate separa a tela de login, a área administrativa e a área do funcionário com base no papel gravado em `app_metadata`.

## Premissas e pendências
- O PO ainda precisa aprovar os campos obrigatórios e o identificador único. O e-mail está sendo usado provisoriamente como identificador por ser o identificador nativo do fluxo email/senha do Supabase Auth.
- Política de senha inicial, troca obrigatória no primeiro acesso e canal de entrega das credenciais precisam de validação do PO/administrador.
- O papel deve ser gravado apenas por operação confiável no backend; não aceitar papel enviado pelo cliente.
- A Issue #106 exige decisão do PO sobre tamanho mínimo/máximo, complexidade e troca obrigatória no primeiro acesso. A validação atual de 8 caracteres continua provisória e não deve ser tratada como política aprovada.\n- As Issues #107 e #110 dependem de definição do modelo de dados de funcionários/contas, estado de bloqueio, tabelas acessíveis ao cliente e matriz de permissões. Não foram criadas policies RLS genéricas sem esse contrato.\n- A Issue #109 depende de decidir o mecanismo persistente de rate limiting e auditoria (por exemplo, tabela/funcão RPC transacional ou serviço externo). Limites em memória da Edge Function não seriam confiáveis entre instâncias.
- A proteção visual do AppGate não substitui políticas RLS e autorização no backend para os dados do sistema.
- Testes automatizados atuais cobrem validações puras; testes integrados exigem projeto Supabase configurado.

## Testes
```bash
npm test
npm run build
```
