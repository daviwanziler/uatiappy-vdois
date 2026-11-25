# ADR-001 — Frontend com React e JavaScript

- **Status:** aprovado pelo responsável pelo projeto para iniciar o bootstrap
- **Data:** 25/11/2026
- **Contexto:** o diagrama de arquitetura identifica uma aplicação web frontend,
  mas deixa framework e linguagem pendentes de decisão técnica.
- **Decisão:** utilizar React com JavaScript no frontend do UatiAppy.
- **Ferramenta de build inicial:** Vite, para desenvolvimento local e geração
  da versão de produção. Esta escolha operacional acompanha o bootstrap e não
  altera os requisitos funcionais nem o backend proposto.
- **Consequências:** o código de interface será organizado em componentes React
  e arquivos JavaScript. A aplicação poderá ser compilada por meio dos scripts
  npm definidos no `package.json`.
- **Fora desta decisão:** autenticação, esquema definitivo do banco, políticas
  RLS, mecanismo de comunicação em tempo real, design final e integração com
  Supabase permanecem pendentes de implementação/validação conforme a
  documentação de arquitetura e requisitos.

## Escopo desta entrega

Esta decisão registra a escolha de React e JavaScript e permite iniciar a
estrutura mínima executável. Não significa que funcionalidades de cadastro,
login, conversas ou mensagens já estejam implementadas.
