# Arquitetura do UatiAppy

Esta pasta contém os documentos e diagramas relacionados à arquitetura de software do UatiAppy.

## Diagrama de Arquitetura

O diagrama apresenta a organização dos componentes do sistema, suas responsabilidades e as relações entre a aplicação, os serviços de backend, o banco de dados e a infraestrutura de desenvolvimento e implantação.

## Documentação complementar

Os documentos desta pasta devem manter coerência com os requisitos funcionais, não funcionais e o escopo do MVP.


## Modelo de acesso e gerenciamento de contas

O UatiAppy está sendo documentado como aplicação web. A administração possui um perfil próprio (**Administrador**) e uma área exclusiva para gerenciar contas de funcionários. A criação de contas, definição da senha inicial, redefinição de senha e bloqueio/desativação são responsabilidades administrativas.

Funcionários recebem as credenciais da administração e utilizam o sistema por login. Não há autocadastro nem alteração/redefinição de senha pelo funcionário. Contas bloqueadas ou desativadas não devem acessar o sistema.

A autorização deve ser aplicada no backend/serviço de dados, e não apenas por ocultação de opções na interface. A tecnologia concreta de frontend e a configuração final dos serviços de autenticação permanecem sujeitas à validação da equipe e do orientador.

## Fonte de arquitetura web

O arquivo [diagrama-arquitetura-web.puml](./diagrama-arquitetura-web.puml) registra a visão lógica da aplicação web, os dois perfis e os fluxos administrativos e de comunicação. Ele é uma fonte editável inicial; deve ser renderizado, revisado e comparado com o diagrama visual exportado do Miro antes da aprovação final.
