# Arquitetura do UatiAppy

Esta pasta reúne a documentação da arquitetura do UatiAppy, uma aplicação Web responsiva de comunicação institucional, acessível por um único link em celulares e computadores.

## Diagrama de arquitetura

- [Fonte PlantUML da arquitetura Web](./diagrama-arquitetura-web.puml) — visão lógica editável dos navegadores, hospedagem, backend e persistência.
- [Diagrama de Arquitetura UatiAppy (PDF)](./Diagrama%20de%20Arquitetura%20UatiAppy.pdf) — **precisa ser regenerado a partir da arquitetura Web atualizada**; a versão anterior representa a arquitetura mobile e está desatualizada.

A fonte PlantUML é a referência editável atual. Não considerar o PDF sincronizado até que ele seja regenerado, revisado e substituído.

## Stack tecnológica

| Camada / finalidade | Tecnologia / decisão |
|---|---|
| Tipo de aplicação | Web responsiva |
| Acesso | Um único link no navegador |
| Estrutura das páginas | HTML |
| Estilos e responsividade | CSS |
| Linguagem e interações | JavaScript puro (Vanilla JavaScript) |
| Editor | Visual Studio Code |
| Backend e banco de dados | Supabase / PostgreSQL |
| Hospedagem Web | Vercel |
| Versionamento e gestão | Git e GitHub |
| Automação CI/CD | GitHub Actions |

A aplicação funcionará em navegadores de celulares e computadores, adaptando a interface ao tamanho da tela. Não será aplicativo nativo, PWA ou instalação de loja.

A proposta para o MVP é desenvolver a interface com HTML, CSS e JavaScript puro, sem React, Vite ou outro framework. O VS Code será o editor de código; não é uma tecnologia de execução da aplicação.

O Supabase será utilizado como backend e banco de dados. A aplicação Web deverá consumir seus recursos por SDK/API, com configurações adequadas para cliente. Chaves privilegiadas nunca podem ser incluídas no bundle Web ou expostas ao navegador. A seleção e configuração efetiva de Auth, RLS, Realtime, tabelas, relacionamentos, funções e políticas devem seguir os requisitos aprovados.

A Vercel hospedará a aplicação Web. GitHub Actions executará as verificações e etapas de CI/CD configuradas no repositório. Ambientes e variáveis de ambiente devem ser configurados sem expor valores secretos.

## Modelo de acesso e gerenciamento de contas

O sistema possui dois perfis documentados:

- **Administrador:** responsável por cadastrar e gerenciar contas de funcionários, definir a senha inicial, redefinir senhas e bloquear ou desativar contas.
- **Funcionário:** recebe as credenciais da administração e utiliza a conta para entrar na aplicação Web.

Não há autocadastro nem alteração ou redefinição autônoma de senha pelo funcionário. Contas bloqueadas ou desativadas não devem acessar o sistema. A autorização deve ser aplicada no backend/serviço de dados, e não apenas pela ocultação de opções na interface.

Os procedimentos de provisionamento inicial do Administrador, entrega segura de credenciais, reativação e revogação de sessões permanecem como pontos de validação.

## Coerência documental

Esta documentação deve permanecer alinhada a [Requisitos e escopo do MVP](../requisitos/escopo-mvp.md) e a [Decisões Tecnológicas](./decisoes-tecnologicas.md). A plataforma Web, HTML, CSS, JavaScript puro, VS Code, Supabase/PostgreSQL, Vercel, GitHub e GitHub Actions compõem a direção técnica registrada. Os serviços Supabase efetivamente necessários e os ambientes ainda devem ser detalhados em Issues e decisões técnicas.
