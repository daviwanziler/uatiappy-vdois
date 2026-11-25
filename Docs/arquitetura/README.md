# Arquitetura do UatiAppy

Esta pasta reúne a documentação da arquitetura do UatiAppy, um aplicativo mobile de comunicação institucional.

## Diagrama de arquitetura

- [Diagrama de Arquitetura UatiAppy (PDF)](./Diagrama%20de%20Arquitetura%20UatiAppy.pdf) — representação visual da arquitetura mobile.
- [Fonte PlantUML da arquitetura mobile](./diagrama-arquitetura-mobile.puml) — visão lógica editável dos perfis, aplicativo, backend e persistência.

## Plataforma e stack proposta

A direção atual do produto é um aplicativo mobile desenvolvido com **JavaScript, React Native e Expo**. O **Visual Studio Code** será utilizado como editor. O backend e a persistência estão propostos com **Supabase e PostgreSQL**; o aplicativo em execução deverá comunicar-se com os serviços por SDK/API, conforme a configuração aprovada.

Git e GitHub serão utilizados para versionamento, Issues e Pull Requests. GitHub Actions poderá automatizar verificações e processos de CI/CD, conforme configuração futura.

A stack e os serviços Supabase efetivamente necessários ainda dependem de validação formal da equipe e do orientador. Auth, RLS, Realtime, tabelas, relacionamentos e políticas devem ser definidos conforme os requisitos do MVP. A Vercel não será tratada como mecanismo de hospedagem ou distribuição do aplicativo mobile nativo; builds e distribuição deverão usar ferramentas compatíveis com Expo/React Native, após definição do fluxo de entrega.

## Modelo de acesso e gerenciamento de contas

O sistema possui dois perfis documentados:

- **Administrador:** responsável por cadastrar e gerenciar contas de funcionários, definir a senha inicial, redefinir senhas e bloquear ou desativar contas.
- **Funcionário:** recebe as credenciais da administração e utiliza a conta para entrar no aplicativo.

Não há autocadastro nem alteração ou redefinição autônoma de senha pelo funcionário. Contas bloqueadas ou desativadas não devem acessar o sistema. A autorização deve ser aplicada no backend/serviço de dados, e não apenas pela ocultação de opções na interface.

Os procedimentos de provisionamento inicial do Administrador, entrega segura de credenciais, reativação e revogação de sessões permanecem como pontos de validação.

## Coerência documental

Esta documentação deve permanecer alinhada a [Requisitos e escopo do MVP](../requisitos/escopo-mvp.md). A arquitetura é uma proposta documentada: componentes e serviços ainda não descritos como implementados não devem ser tratados como funcionalidades prontas.
