# UatiAppy — Issues #90 e #91

Implementação inicial dos fluxos de provisionamento administrativo, login, logout e sessão para React Native + Expo + JavaScript.

## Dependências e execução

Instale as dependências na branch de implementação:

    npm install

Copie .env.example para .env e preencha:

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

Depois execute:

    npx expo start

## Provisionamento administrativo — Issue #90

O RF-001 e as regras RN-008, RN-009 e RN-010 determinam que não existe autocadastro. Somente Administrador cria contas de funcionários e define a senha inicial.

A tela administrativa chama a Edge Function admin-create-user. A função:
- valida o token de sessão do solicitante;
- exige app_metadata.role = ADMINISTRADOR;
- cria a conta com a API administrativa do Supabase Auth;
- define app_metadata.role = FUNCIONARIO;
- nunca expõe a chave service_role ao aplicativo.

Antes de testar, o usuário Administrador inicial precisa ser provisionado por um procedimento seguro no painel/ambiente administrativo do Supabase, com app_metadata.role = ADMINISTRADOR. Não existe fluxo de promoção de usuário a Administrador no aplicativo.

Configure e publique a função no projeto Supabase. A chave SUPABASE_SERVICE_ROLE_KEY deve existir somente como segredo no ambiente da Edge Function.

## Login, logout e sessão — Issue #91

- Login usa signInWithPassword.
- Sessão é persistida por adaptador do Expo SecureStore.
- onAuthStateChange atualiza o estado global da autenticação.
- Logout usa signOut.
- AppGate impede exibição das telas internas sem sessão e seleciona a tela conforme app_metadata.role.

## Testes

    npm test
    npx expo-doctor
    npx expo export --platform android
    npx expo export --platform ios

Os testes incluídos cobrem validações puras de formulário. A validação de integração com Supabase exige projeto e usuários de teste.

## Decisões e pendências que precisam de confirmação do PO/TechLead

1. O formulário usa e-mail como identificador único e senha inicial porque o Supabase Auth oferece autenticação por e-mail/senha. A Issue #90 diz que os campos e o identificador devem ser aprovados pelo PO; portanto, e-mail como identificador ainda é uma premissa técnica pendente, não uma decisão de negócio confirmada.
2. A Issue #90 não especifica outros dados cadastrais. Nenhum nome, matrícula, telefone ou departamento foi inventado.
3. A role é armazenada em app_metadata, escrita apenas por operação administrativa confiável. A equipe deve confirmar esse modelo de perfil.
4. A Edge Function pressupõe que a chave service_role está configurada como segredo no ambiente Supabase, nunca no aplicativo.
5. A política de senha, expiração/primeiro acesso e entrega segura das credenciais precisam ser definidas pela administração/PO.
6. O bloqueio/desativação e a revogação de sessões exigem uma fonte de estado de conta no backend. O schema de perfis/status não foi fornecido, então não foi inventado neste escopo.
7. A autorização definitiva de dados e operações deve ser aplicada no backend/RLS; ocultar telas no cliente não substitui autorização.

## Limites

Esta entrega não implementa recuperação de senha, provedores externos, edição de perfil, administração de bloqueios/desativações, conversas ou mensagens.
