# ADR-001 — Frontend com HTML, CSS e JavaScript puro

- **Status:** aprovado
- **Data:** 26/11/2026
- **Contexto:** o UatiAppy será uma aplicação Web responsiva, Mobile First, acessível pelo navegador em celulares e computadores.
- **Decisão:** utilizar HTML semântico, CSS e JavaScript nativo (Vanilla JS), com módulos ES nativos do navegador.
- **SDK Supabase:** carregar `@supabase/supabase-js@2.81.1` por CDN com versão fixada, sem bundler.
- **Configuração de produção:** gerar `public/js/config.js` durante o deploy por script Node.js a partir das variáveis públicas `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- **Hospedagem:** Vercel como site estático, com diretório de saída `public`; o script de build apenas gera a configuração pública e não compila ou empacota o frontend.
- **Consequências:** não utilizar React, React Native, JSX, Vite, Expo ou bundlers nesta etapa.
- **Segurança:** somente URL e chave anon/publicável podem chegar ao navegador. A chave `service_role` permanece exclusivamente no ambiente server-side das Edge Functions. Autorização e permissões são verificadas no backend e reforçadas por RLS.
- **Preservação:** migrations, PostgreSQL, RLS, RPCs, Supabase Auth, Edge Functions e testes de segurança permanecem independentes da escolha de frontend.

## Escopo

A decisão não afirma que funcionalidades de conversas/mensagens estejam implementadas na interface. A área do funcionário permanece uma tela inicial até uma entrega específica de chat.
