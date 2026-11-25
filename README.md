# UatiAppy 📱

## Sobre o projeto

O **UatiAppy** é um projeto acadêmico de aplicativo mobile institucional de comunicação e troca de mensagens, inspirado em plataformas como o WhatsApp.

A proposta é permitir que usuários se comuniquem de maneira simples e intuitiva, com foco inicial em conversas individuais, mensagens de texto e histórico de comunicação.

## 🎯 Objetivo do trabalho

Aplicar, na prática, conhecimentos de engenharia de software, análise de requisitos, modelagem de sistemas, desenvolvimento, testes, controle de versão e trabalho colaborativo.

## 📚 Documentação do projeto

- **[Requisitos e escopo do MVP](Docs/requisitos/escopo-mvp.md)** — RFs, RNFs, regras de negócio, funcionalidades dentro e fora do MVP, critérios gerais de aceite, rastreabilidade e pendências de validação.
- **[Arquitetura do UatiAppy](Docs/arquitetura/README.md)** — stack tecnológica, decisões arquiteturais, diagrama e responsabilidades dos componentes.

Consulte esses documentos antes de implementar funcionalidades ou criar/alterar Issues. Em caso de divergência, registre a dúvida e alinhe com o PO, o TechLead e o orientador; não assuma que uma funcionalidade futura faz parte do MVP.

## 🛠️ Stack tecnológica definida

| Item | Tecnologia |
|---|---|
| Tipo de aplicação | Mobile |
| Linguagem | JavaScript |
| Framework | React Native |
| Plataforma de desenvolvimento | Expo |
| Editor | Visual Studio Code |
| Backend e banco de dados | Supabase / PostgreSQL |
| Versionamento e gestão | GitHub |
| CI/CD | GitHub Actions |
| Serviços web complementares, se necessários | Vercel |

O aplicativo será executado em dispositivos móveis. A Vercel não será utilizada para hospedar ou distribuir diretamente o aplicativo mobile nativo; builds e distribuição deverão seguir um fluxo compatível com Expo/React Native.

## 💡 Funcionalidades previstas para o MVP

- Cadastro/provisionamento de contas conforme o modelo administrativo definido.
- Login e logout.
- Identificação básica dos usuários.
- Conversas individuais entre dois participantes.
- Envio e recebimento de mensagens de texto.
- Armazenamento e histórico de mensagens.
- Exibição cronológica e estado das mensagens.
- Tratamento de falhas de envio e controle de acesso.

Funcionalidades como grupos, anexos, edição/exclusão de mensagens e notificações push estão fora do MVP inicial e dependem de priorização futura.

## 🛠️ Etapas de desenvolvimento

1. **Planejamento e requisitos:** levantamento, priorização e validação do escopo.
2. **Modelagem:** elaboração dos diagramas UML necessários.
3. **UX/UI:** desenho dos fluxos e interfaces dos casos de uso prioritários.
4. **Arquitetura e desenvolvimento:** implementação mobile com React Native e Expo.
5. **Persistência:** estruturação do armazenamento e integração com Supabase.
6. **Testes e validação:** verificação dos requisitos funcionais e não funcionais.
7. **Documentação e entrega:** consolidação dos artefatos e preparação da demonstração acadêmica.

## 👥 Organização da equipe

As atividades são acompanhadas por meio das **GitHub Issues** e pull requests. Antes de abrir uma nova Issue, verifique se já existe uma tarefa equivalente e consulte a documentação de requisitos e arquitetura para manter o trabalho alinhado ao MVP e à stack definida.

## 📌 Resultados esperados

Entregar uma aplicação mobile funcional que demonstre a comunicação textual individual entre usuários, além de evidenciar a aplicação prática de engenharia de software, modelagem UML, testes e colaboração em equipe.

---

**UatiAppy — Conectando pessoas através da comunicação!** 🚀
