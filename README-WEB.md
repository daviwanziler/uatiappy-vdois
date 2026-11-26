# UatiAppy — aplicação Web responsiva

Aplicação institucional de comunicação e troca de mensagens, com abordagem **Web Mobile First**. O mesmo endereço será acessado pelo navegador em celulares e computadores.

## Stack definida para a implementação inicial

- **Frontend:** HTML, CSS e JavaScript puro (Vanilla JavaScript), sem framework ou bundler nesta etapa.
- **Editor:** Visual Studio Code.
- **Backend e banco:** Supabase / PostgreSQL, conforme os requisitos e as decisões de segurança.
- **Hospedagem e deploy:** Vercel.
- **Versionamento e gestão:** GitHub.
- **CI/CD:** GitHub Actions.

A direção técnica está sujeita à validação final do PO/equipe e, se necessário, do orientador. O VS Code é apenas o editor de código.

## Pré-requisitos de desenvolvimento

- Navegador moderno.
- Visual Studio Code ou editor equivalente.
- Git.
- Node.js/npm somente se alguma ferramenta de desenvolvimento ou automação adotada pela equipe exigir; a aplicação estática básica não depende de Node.js para ser executada no navegador.

## Executar localmente

Para uma estrutura estática simples, abra o arquivo `index.html` no navegador. Durante o desenvolvimento, a equipe pode utilizar uma extensão de servidor local do editor, desde que documente a configuração escolhida.

## Estrutura esperada

A estrutura concreta deve seguir o repositório e ser confirmada na issue de bootstrap. Como referência inicial:

- `index.html`: documento e estrutura da interface.
- `assets/css/`: folhas de estilo.
- `assets/js/`: módulos e lógica do navegador.
- `assets/img/`: imagens e ícones, quando necessários.

Não criar `App.js`, `app.json` ou configuração Expo para esta arquitetura.

## Publicação

A aplicação será publicada na Vercel a partir do repositório GitHub. Os ambientes de preview e produção e suas variáveis devem ser configurados na plataforma. Não incluir valores secretos nos arquivos versionados.

## Segurança

- Nunca versionar arquivos `.env`, tokens ou credenciais.
- Nunca incluir a chave `service_role` ou qualquer chave administrativa/secret do Supabase no código do navegador.
- Utilizar somente credenciais públicas apropriadas ao cliente, quando a integração for implementada.
- Aplicar autorização no backend e políticas RLS no banco quando pertinentes.
- Não confiar apenas em controles visuais ou validações feitas no navegador.

## Responsividade e compatibilidade

- Projetar primeiro para telas pequenas (Mobile First).
- Adaptar navegação e conteúdo para tablets e desktops.
- Validar os fluxos nos navegadores e versões que forem definidos pela equipe.

## Estado desta entrega

Este documento registra a direção técnica e orientações para adaptação. Não afirma que o bootstrap Web, a integração Supabase, autenticação ou funcionalidades de conversa já estejam implementados.
