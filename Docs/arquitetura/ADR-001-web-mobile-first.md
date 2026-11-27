# ADR-001 — Aplicação Web responsiva Mobile First

- **Status:** Aceita para a entrega atual, conforme decisão do responsável pelo projeto em 27/11/2026.
- **Decisores a registrar na governança do projeto:** PO, TechLead e equipe; validação do orientador, se exigida pela disciplina.
- **Substitui:** decisão/documentação anterior que descrevia aplicativo nativo React Native + Expo.

## Contexto
A documentação da branch principal descrevia React Native + Expo, enquanto a implementação da PR #103 utiliza HTML, CSS e JavaScript no navegador, com Supabase e Vercel. Essa divergência impedia uma avaliação coerente da arquitetura e do escopo técnico.

## Decisão
Para a entrega atual, o UatiAppy será uma **aplicação Web responsiva com abordagem Mobile First**.

- Frontend: HTML5, CSS3 e JavaScript Vanilla.
- Backend e dados: Supabase e PostgreSQL.
- Autenticação: Supabase Auth.
- Operações privilegiadas: Supabase Edge Functions.
- Hospedagem do frontend: Vercel.
- Versionamento e CI: GitHub e GitHub Actions.

Mobile First significa projetar e validar primeiro a experiência em telas pequenas e expandi-la responsivamente para telas maiores. O produto será acessado por navegador. Não significa React Native, aplicativo nativo ou PWA automaticamente.

## Regras de segurança obrigatórias
1. A chave Supabase `service_role` nunca pode chegar ao navegador.
2. Operações administrativas privilegiadas devem ocorrer em Edge Functions ou outro backend confiável.
3. Edge Functions devem validar autenticação, papel administrativo e estado ativo da conta.
4. PostgreSQL/RLS deve restringir acesso a conversas e mensagens conforme a identidade e participação do usuário.
5. CORS deve permitir somente origens explicitamente autorizadas em produção.
6. Variáveis públicas do frontend podem conter apenas valores destinados a clientes, como URL Supabase e chave anon/public com RLS corretamente configurada.
7. Bloqueio/desativação deve ser aplicado no backend e não apenas pela interface.

## Consequências
- README, arquitetura, diagramas, requisitos e pipelines devem refletir a stack Web.
- Referências a Android/iOS como plataformas nativas e a builds Expo/EAS deixam de ser aplicáveis.
- Testes de compatibilidade passam a cobrir navegadores, viewports, acessibilidade e comportamento responsivo.
- O PDF antigo que retrata arquitetura mobile deve ser substituído por uma versão renderizada do diagrama Web antes da entrega final.
- A implementação existente deve passar por CI e homologação; a decisão arquitetural, por si só, não comprova que todas as funcionalidades do MVP estejam concluídas.

## Fora desta decisão
PWA, funcionamento offline, instalação na tela inicial, notificações push e distribuição em lojas não estão incluídos sem requisitos, implementação e testes específicos.
