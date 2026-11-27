# UatiAppy 💬

## Sobre o projeto
O **UatiAppy** é uma aplicação web institucional de comunicação e troca de mensagens, inspirada em plataformas como o WhatsApp. A experiência é **Web Mobile First**: a interface é projetada primeiro para telas pequenas e se adapta a celulares, tablets e computadores, sendo acessada pelo navegador.

## Objetivo
Aplicar conhecimentos de engenharia de software, análise de requisitos, modelagem, desenvolvimento, testes, versionamento e colaboração em equipe.

## Documentação
- [Requisitos e escopo do MVP](Docs/requisitos/escopo-mvp.md)
- [Arquitetura do UatiAppy](Docs/arquitetura/README.md)
- [Decisão arquitetural ADR-001 — Web Mobile First](Docs/arquitetura/ADR-001-web-mobile-first.md)

Consulte esses documentos antes de implementar funcionalidades ou criar/alterar Issues. Em caso de mudança de escopo, registre a decisão e alinhe PO, TechLead, equipe e orientador.

## Stack tecnológica definida

| Camada | Tecnologia |
|---|---|
| Tipo de aplicação | Aplicação Web responsiva — Mobile First |
| Linguagem | JavaScript |
| Interface | HTML5, CSS3 e JavaScript (Vanilla JS) |
| Backend e banco de dados | Supabase / PostgreSQL |
| Autenticação | Supabase Auth |
| Funções privilegiadas | Supabase Edge Functions (servidor) |
| Hospedagem web | Vercel |
| Versionamento e gestão | Git e GitHub |
| CI | GitHub Actions |
| Editor | Visual Studio Code |

A aplicação é executada no navegador. Vercel hospeda a aplicação web estática; Supabase fornece os serviços de backend e persistência. Chaves privilegiadas, especialmente `service_role`, devem permanecer exclusivamente no servidor/ambiente seguro e nunca no JavaScript entregue ao navegador.

## Funcionalidades previstas para o MVP
- Provisionamento administrativo de contas.
- Login e logout.
- Identificação básica dos usuários.
- Conversas individuais entre dois participantes.
- Envio e recebimento de mensagens de texto.
- Armazenamento e histórico de mensagens.
- Exibição cronológica e estado das mensagens.
- Tratamento de falhas de envio e controle de acesso.

Grupos, anexos, edição/exclusão de mensagens e notificações push estão fora do MVP inicial, salvo aprovação formal de mudança de escopo.

## Etapas de desenvolvimento
1. Planejamento e requisitos.
2. Modelagem UML.
3. UX/UI responsiva com abordagem Mobile First.
4. Desenvolvimento da aplicação web.
5. Integração com Supabase.
6. Testes funcionais, segurança, responsividade e acessibilidade.
7. Documentação, homologação e entrega.

## Organização
As atividades são acompanhadas por GitHub Issues e Pull Requests. Mudanças devem seguir a arquitetura e os critérios de aceite documentados.

**UatiAppy — Conectando pessoas através da comunicação!**
