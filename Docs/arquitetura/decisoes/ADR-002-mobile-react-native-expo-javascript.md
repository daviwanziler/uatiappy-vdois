# ADR-002 — Aplicativo mobile com React Native, Expo e JavaScript

- **Status:** aprovado pelo responsável pelo projeto para orientar o bootstrap mobile.
- **Data:** 25/11/2026.
- **Contexto:** a Issue #55 recebeu adendo indicando uma proposta mobile. A decisão posterior do responsável pelo projeto confirma que o produto principal será um aplicativo mobile.
- **Decisão:** utilizar React Native com Expo e JavaScript.
- **Versão inicial de referência:** Expo SDK 58, React Native 0.88 e React 19.3, conforme a documentação oficial consultada em 25/11/2026.
- **Ambientes:** Android e iOS, com Expo Go para desenvolvimento inicial quando compatível; builds de distribuição serão avaliados posteriormente.
- **Backend e persistência:** Supabase e PostgreSQL, conforme a arquitetura proposta. A integração não faz parte do bootstrap.
- **Versionamento e CI:** GitHub e GitHub Actions.
- **Vercel:** não será utilizada como plataforma de distribuição do aplicativo nativo; poderá hospedar eventual página web complementar.

## Consequências

- O ponto de entrada visual será App.js.
- A configuração do aplicativo ficará em app.json.
- Os comandos de desenvolvimento serão fornecidos pelo Expo CLI via npm scripts.
- Dependências nativas e bibliotecas do ecossistema Expo deverão ser instaladas preferencialmente com npx expo install para preservar compatibilidade com o SDK.

## Relação com o bootstrap web anterior

A PR #98 contém uma estrutura React + Vite para web. Ela não representa o aplicativo mobile e não deve ser integrada à main como bootstrap principal. Esta ADR substitui a decisão anterior de frontend web para o escopo do aplicativo principal. A PR web será encerrada como supersedida, preservando seu histórico.

## Fora do escopo

Cadastro, login, logout, persistência de sessão, integração Supabase, esquema de dados, políticas RLS, conversas e mensagens serão implementados em entregas próprias, respeitando as issues do projeto.
