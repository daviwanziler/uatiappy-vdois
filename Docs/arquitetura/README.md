# Arquitetura do UatiAppy

Esta pasta reúne a documentação da arquitetura do UatiAppy, um aplicativo mobile de comunicação institucional.

## Diagrama de arquitetura

- [Diagrama de Arquitetura UatiAppy (PDF)](./Diagrama%20de%20Arquitetura%20UatiAppy.pdf) — representação visual da arquitetura mobile.
- [Fonte PlantUML da arquitetura mobile](./diagrama-arquitetura-mobile.puml) — visão lógica editável dos perfis, aplicativo, backend e persistência.

O diagrama deve representar o aplicativo mobile desenvolvido com React Native e Expo. Sempre que a arquitetura mudar, atualize a fonte PlantUML e gere novamente o PDF correspondente antes de considerar o artefato visual sincronizado.

## Stack tecnológica definida

A equipe confirmou a seguinte stack para o projeto:

| Camada / finalidade | Tecnologia |
|---|---|
| Aplicativo | Mobile |
| Linguagem | JavaScript |
| Framework mobile | React Native |
| Ferramenta/plataforma de desenvolvimento mobile | Expo |
| Editor | Visual Studio Code |
| Backend e banco de dados | Supabase / PostgreSQL |
| Versionamento e gestão | Git e GitHub |
| Automação CI/CD | GitHub Actions |
| Serviços web complementares (se necessários) | Vercel |

O aplicativo será executado nos dispositivos móveis. React Native fornece a camada de interface multiplataforma e Expo apoia o desenvolvimento, testes e geração de builds. A distribuição Android/iOS deverá utilizar um fluxo compatível com Expo/React Native (por exemplo, EAS Build/Submit, quando adotado pela equipe).

O Supabase será utilizado como backend e banco de dados. A aplicação mobile deverá consumir seus recursos por SDK/API, com credenciais e políticas configuradas de forma segura. A seleção e configuração efetiva de Auth, RLS, Realtime, tabelas, relacionamentos, funções e políticas devem seguir os requisitos aprovados; não considerar serviços como implementados apenas por constarem nesta arquitetura.

GitHub Actions será a base prevista para automações e CI/CD, conforme workflows que forem configurados no repositório. A Vercel poderá hospedar serviços web complementares, caso necessários, mas **não hospeda nem distribui diretamente o aplicativo mobile nativo**.

## Modelo de acesso e gerenciamento de contas

O sistema possui dois perfis documentados:

- **Administrador:** responsável por cadastrar e gerenciar contas de funcionários, definir a senha inicial, redefinir senhas e bloquear ou desativar contas.
- **Funcionário:** recebe as credenciais da administração e utiliza a conta para entrar no aplicativo.

Não há autocadastro nem alteração ou redefinição autônoma de senha pelo funcionário. Contas bloqueadas ou desativadas não devem acessar o sistema. A autorização deve ser aplicada no backend/serviço de dados, e não apenas pela ocultação de opções na interface.

Os procedimentos de provisionamento inicial do Administrador, entrega segura de credenciais, reativação e revogação de sessões permanecem como pontos de validação.

## Coerência documental

Esta documentação deve permanecer alinhada a [Requisitos e escopo do MVP](../requisitos/escopo-mvp.md). A stack acima está definida pela equipe; detalhes de implementação e serviços específicos ainda devem ser refinados em Issues e decisões técnicas. Componentes e serviços ainda não implementados não devem ser tratados como funcionalidades prontas.
