# UatiAppy 💬

## Sobre o projeto

O **UatiAppy** é um projeto acadêmico de aplicação Web responsiva para comunicação institucional e troca de mensagens, inspirado em plataformas como o WhatsApp.

A aplicação será acessada por um único link no navegador, tanto em celulares quanto em computadores. A interface deverá adaptar-se aos diferentes tamanhos de tela.

## 🎯 Objetivo do trabalho

Aplicar, na prática, conhecimentos de engenharia de software, análise de requisitos, modelagem de sistemas, desenvolvimento Web, testes, controle de versão e trabalho colaborativo.

## 📚 Documentação do projeto

- **[Requisitos e escopo do MVP](Docs/requisitos/escopo-mvp.md)** — RFs, RNFs, regras de negócio, funcionalidades dentro e fora do MVP, critérios gerais de aceite, rastreabilidade e pendências de validação.
- **[Arquitetura do UatiAppy](Docs/arquitetura/README.md)** — stack tecnológica, decisões arquiteturais, diagrama e responsabilidades dos componentes.

Consulte esses documentos antes de implementar funcionalidades ou criar/alterar Issues. Em caso de divergência, registre a dúvida e alinhe com o PO, o TechLead e o orientador; não assuma que uma funcionalidade futura faz parte do MVP.

## 🛠️ Stack tecnológica e plataforma

| Item | Tecnologia / definição |
|---|---|
| Tipo de aplicação | Web responsiva |
| Acesso | Um único link pelo navegador em celular ou computador |
| Linguagem | JavaScript |
| Framework de interface Web | A definir pelo TechLead; React pode ser avaliado, mas ainda não está aprovado |
| Editor | Visual Studio Code |
| Backend e banco de dados | Supabase / PostgreSQL |
| Hospedagem da aplicação Web | Vercel |
| Versionamento e gestão | GitHub |
| CI/CD | GitHub Actions |

O UatiAppy **não será um aplicativo mobile nativo nem uma PWA**. Não exigirá instalação: o usuário abrirá o endereço da aplicação no navegador. A interface será responsiva para celulares e computadores.

O Supabase será consumido pela aplicação por SDK/API, conforme os serviços necessários ao MVP. Credenciais privilegiadas não podem ser incluídas no código executado no navegador; autorização e políticas de acesso devem ser aplicadas no backend/banco de dados.

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
3. **UX/UI:** desenho dos fluxos e interfaces dos casos de uso prioritários, considerando celular e computador.
4. **Arquitetura e desenvolvimento:** implementação da aplicação Web responsiva em JavaScript, com framework a definir.
5. **Persistência:** estruturação do armazenamento e integração com Supabase.
6. **Hospedagem e automação:** publicação Web na Vercel e verificações de CI/CD pelo GitHub Actions.
7. **Testes e validação:** verificação dos requisitos funcionais e não funcionais em navegadores e tamanhos de tela acordados.
8. **Documentação e entrega:** consolidação dos artefatos e preparação da demonstração acadêmica.

## 👥 Organização da equipe

As atividades são acompanhadas por meio das **GitHub Issues** e pull requests. Antes de abrir uma nova Issue, verifique se já existe uma tarefa equivalente e consulte a documentação de requisitos e arquitetura para manter o trabalho alinhado ao MVP e à stack definida.

## 📌 Resultados esperados

Entregar uma aplicação Web responsiva funcional, acessível por um único link em celulares e computadores, que demonstre a comunicação textual individual entre usuários, além de evidenciar a aplicação prática de engenharia de software, modelagem UML, testes e colaboração em equipe.

---

**UatiAppy — Conectando pessoas através da comunicação!** 🚀
