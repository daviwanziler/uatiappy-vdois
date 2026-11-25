# Arquitetura do UatiAppy

Esta pasta contém os documentos e diagramas relacionados à arquitetura de software do UatiAppy.

## Diagrama de Arquitetura

O diagrama apresenta a organização dos componentes do sistema, suas responsabilidades e as relações entre a aplicação, os serviços de backend, o banco de dados e a infraestrutura de desenvolvimento e implantação.

## Documentação complementar

Os documentos desta pasta devem manter coerência com os requisitos funcionais, não funcionais e o escopo do MVP.


## Modelo de acesso e gerenciamento de contas

O UatiAppy está sendo documentado como aplicativo mobile. A administração possui um perfil próprio (**Administrador**) e uma área exclusiva para gerenciar contas de funcionários. A criação de contas, definição da senha inicial, redefinição de senha e bloqueio/desativação são responsabilidades administrativas.

Funcionários recebem as credenciais da administração e utilizam o sistema por login. Não há autocadastro nem alteração/redefinição de senha pelo funcionário. Contas bloqueadas ou desativadas não devem acessar o sistema.

A autorização deve ser aplicada no backend/serviço de dados, e não apenas por ocultação de opções na interface. A stack mobile proposta é JavaScript, React Native e Expo, com Supabase/PostgreSQL como backend e persistência. Os serviços Supabase efetivamente necessários, as políticas de autorização, os ambientes, builds e a distribuição ainda dependem de validação da equipe e do orientador. Vercel não será tratada como mecanismo de distribuição do aplicativo mobile nativo.

## Fonte de arquitetura mobile

O arquivo [diagrama-arquitetura-mobile.puml](./diagrama-arquitetura-mobile.puml) registra a visão lógica da aplicativo mobile, os dois perfis e os fluxos administrativos e de comunicação. Ele é uma fonte editável inicial; deve ser renderizado, revisado e comparado com o diagrama visual exportado do Miro antes da aprovação final.


## Plataforma e stack mobile

A direção atual do produto é um aplicativo mobile. A proposta tecnológica registrada é JavaScript, React Native e Expo, com Supabase (PostgreSQL e serviços necessários ao MVP), Git/GitHub e GitHub Actions. O VS Code é o editor de código e não precisa estar conectado diretamente ao painel do Supabase. A comunicação entre o aplicativo em execução e o Supabase ocorre pelo SDK/API apropriado.

A Vercel não é considerada mecanismo de distribuição do aplicativo mobile nativo. Builds e distribuição devem ser planejados com ferramentas compatíveis com Expo/React Native, após validação do fluxo de entrega.

## Fonte de arquitetura mobile

O arquivo [diagrama-arquitetura-mobile.puml](./diagrama-arquitetura-mobile.puml) registra a visão lógica mobile, os perfis e os fluxos administrativos e de comunicação. É uma fonte editável inicial; deve ser renderizada, revisada e comparada com o diagrama visual do Miro antes da aprovação final.
