# ADR-002 — Aplicação Web responsiva com HTML, CSS e JavaScript puro

- **Status:** direção técnica escolhida para a adaptação inicial; validar com PO/equipe e orientador antes de tratar como decisão institucional definitiva.
- **Data:** 26/11/2026.
- **Contexto:** o UatiAppy será uma aplicação Web Mobile First, acessada por um único endereço no navegador de celulares e computadores. Não será um aplicativo nativo Android/iOS.
- **Decisão inicial:** construir a interface com HTML, CSS e JavaScript puro (Vanilla JavaScript), sem React, React Native, Expo, Vite ou outro framework/bundler nesta etapa.
- **Editor:** Visual Studio Code. O editor não é linguagem, framework, runtime ou serviço de hospedagem.
- **Backend e persistência:** Supabase com PostgreSQL. A necessidade de autenticação, tabelas, relacionamentos, políticas RLS, funções e APIs será definida conforme os requisitos; nenhuma integração é declarada como implementada por esta decisão.
- **Hospedagem e deploy:** Vercel para publicar a aplicação Web e gerenciar os ambientes de implantação.
- **Versionamento e automação:** GitHub para código e gestão do trabalho; GitHub Actions para verificações e CI/CD.
- **Acesso:** navegador moderno em dispositivos móveis e desktops, com layout responsivo e abordagem Mobile First.

## Consequências

- A estrutura inicial da interface deve usar arquivos HTML, CSS e JavaScript estáticos, organizados de forma simples e compatível com a arquitetura atual do repositório.
- A aplicação será acessada por URL; não haverá instalação via loja, APK, IPA, Expo Go ou distribuição nativa.
- O layout deverá priorizar telas pequenas e adaptar-se a telas maiores.
- Os testes devem cobrir navegação, responsividade e comportamento nos navegadores/dispositivos suportados, a serem definidos pela equipe.
- Segredos nunca devem ser enviados ao navegador ou versionados. A chave administrativa/secret do Supabase não pode ser exposta no frontend. A autorização deve ser aplicada no backend, incluindo RLS quando pertinente.
- Variáveis de ambiente da Vercel devem ser configuradas nos ambientes apropriados, sem registrar valores secretos em documentação ou no Git.

## Relação com implementações anteriores

As propostas baseadas em React Native/Expo e em React/Vite não representam a direção atual escolhida para o produto. Esta ADR registra a adaptação para Web e não significa que a implementação Web esteja concluída. O código nativo/Expo deve permanecer fora da linha principal; o bootstrap Web deverá ser implementado e validado em entrega própria.

## Fora do escopo desta decisão

Esta ADR não implementa cadastro, login, gestão de sessão, integração com Supabase, esquema de banco, políticas RLS, conversas ou mensagens. Essas funcionalidades devem ser planejadas em issues próprias, com critérios de aceite e revisão.

## Pendências de validação

- [ ] PO e equipe confirmarem o escopo Web Mobile First e a stack inicial.
- [ ] Orientador validar a direção, se necessário.
- [ ] Definir navegadores e versões mínimas suportadas.
- [ ] Confirmar estrutura de pastas e estratégia de publicação na Vercel.
- [ ] Detalhar variáveis de ambiente e integrações sem expor segredos.
