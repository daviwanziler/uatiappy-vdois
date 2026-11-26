# UatiAppy 📱

## Sobre o projeto

O **UatiAppy** é um projeto acadêmico de aplicação institucional de comunicação e troca de mensagens, inspirado em plataformas como o WhatsApp.

A aplicação será Web, Mobile First e acessível por navegador em celulares, tablets e computadores.

## Arquitetura atual

- **Frontend:** HTML5, CSS3 e JavaScript puro (módulos ES nativos).
- **Backend e banco:** Supabase Auth, Edge Functions e PostgreSQL.
- **Segurança:** Row Level Security (RLS), validações server-side e auditoria.
- **Hospedagem:** Vercel como site estático.
- **CI:** GitHub Actions.
- **Desenvolvimento:** Node.js para scripts e testes; Visual Studio Code como editor.

React, React Native, Expo, Vite e bundlers não são utilizados nesta etapa. O SDK Supabase é carregado via CDN com versão fixada. O script de build gera a configuração pública do cliente a partir de variáveis de ambiente.

Consulte [README-DEV.md](README-DEV.md) para executar localmente e [README-AUTH-WEB.md](README-AUTH-WEB.md) para os fluxos de autenticação e segurança.

## Documentação do projeto

A documentação funcional e o limite da primeira entrega estão centralizados em:

- **[Requisitos e escopo do MVP](Docs/requisitos/escopo-mvp.md)** — RFs, RNFs, regras de negócio, funcionalidades dentro e fora do MVP, critérios gerais de aceite, rastreabilidade e pendências de validação.

Consulte esse documento antes de implementar funcionalidades ou criar/alterar Issues. Em caso de divergência, registre a dúvida e alinhe com o PO, o TechLead e o orientador; não assuma que uma funcionalidade futura faz parte do MVP.

## Funcionalidades previstas para o MVP

- Cadastro administrativo, login e logout.
- Identificação básica dos usuários.
- Conversas individuais entre dois participantes.
- Envio e recebimento de mensagens de texto.
- Armazenamento e histórico de mensagens.
- Exibição cronológica e estado das mensagens.
- Tratamento de falhas de envio e controle de acesso.

A interface atual desta PR cobre autenticação e administração de contas. A experiência de conversas/mensagens ainda depende de implementação posterior.

Funcionalidades como grupos, anexos, edição/exclusão de mensagens e notificações push estão fora do MVP inicial e dependem de priorização futura.

## Etapas de desenvolvimento

1. Planejamento e requisitos.
2. Modelagem.
3. UX/UI.
4. Arquitetura e desenvolvimento.
5. Persistência.
6. Testes e validação.
7. Documentação e entrega.

## Organização da equipe

As atividades são acompanhadas por meio das **GitHub Issues** e pull requests. Antes de abrir uma nova Issue, verifique se já existe uma tarefa equivalente e consulte a documentação de requisitos para manter o trabalho alinhado ao MVP.

---

**UatiAppy — Conectando pessoas através da comunicação!** 🚀
