# Decisões Tecnológicas — UatiAppy

## 1. Objetivo

Registrar a stack tecnológica proposta para a implementação do UatiAppy como aplicativo mobile, mantendo rastreabilidade das decisões e evitando iniciar o desenvolvimento com tecnologias presumidas.

**Status:** proposta técnica registrada para validação da equipe e do orientador. Este documento não declara aprovação formal que ainda não tenha sido confirmada.

## 2. Plataforma e linguagem

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Plataforma principal | Aplicativo mobile | Entrega principal do MVP |
| Linguagem | JavaScript | Implementação da lógica da aplicação |
| Framework mobile | React Native | Construção da interface e integração com recursos do dispositivo |
| Ferramentas mobile | Expo | Criação, execução, testes e preparação de builds |
| Editor | Visual Studio Code (VS Code) | Edição e organização do código-fonte |

## 3. Backend e dados

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Backend como serviço | Supabase | Serviços de backend utilizados pelo aplicativo |
| Banco de dados | PostgreSQL gerenciado pelo Supabase | Persistência dos dados |
| Autenticação | Supabase Auth, se confirmado pelos requisitos | Cadastro e autenticação de usuários |
| Comunicação em tempo real | Supabase Realtime, se confirmado para os fluxos do MVP | Atualização de mensagens sem recarregar a tela |
| Integração | SDK/API do Supabase no aplicativo | Comunicação entre o aplicativo em execução e os serviços Supabase |

O VS Code será utilizado como editor e **não será conectado diretamente ao painel do Supabase**. Isso não elimina a comunicação necessária entre o aplicativo em execução e o Supabase: essa integração será feita pelo código, utilizando SDK/API e variáveis de ambiente apropriadas.

As tabelas, relacionamentos, políticas de segurança (RLS), canais realtime e demais recursos deverão ser definidos conforme os requisitos aprovados. Não se deve presumir que todos os recursos serão necessários.

## 4. Repositório, automação e distribuição

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Versionamento | Git e GitHub | Histórico, branches, Issues e Pull Requests |
| Integração contínua | GitHub Actions | Execução automatizada de verificações e testes |
| Hospedagem web complementar | Vercel | Hospedagem de eventual página web ou serviço web compatível |

A Vercel não será considerada, por padrão, o mecanismo de distribuição do aplicativo mobile nativo. Builds e distribuição mobile deverão ser planejados com as ferramentas compatíveis com Expo/React Native, após definição do fluxo de entrega.

## 5. Visão simplificada da arquitetura

1. O aplicativo React Native, desenvolvido com JavaScript e Expo, executa no dispositivo móvel.
2. O aplicativo comunica-se com os serviços Supabase por SDK/API.
3. O Supabase fornece os recursos de backend e persistência necessários ao MVP.
4. GitHub mantém o código-fonte e o fluxo de revisão; GitHub Actions executa verificações automatizadas.
5. Vercel poderá hospedar uma entrega web complementar, caso exista necessidade e compatibilidade.

## 6. Decisões ainda pendentes de validação

**Atualização documental:** a documentação e o PDF de arquitetura foram alinhados à direção mobile na PR #99, já integrada à `main`. Isso não equivale à aprovação formal da stack pelo orientador.

- [ ] Validar formalmente a escolha de JavaScript, React Native e Expo com a equipe e o orientador.
- [x] Substituir o PDF do diagrama de arquitetura por uma versão alinhada à direção mobile. A validação formal da stack permanece pendente.
- [ ] Confirmar quais recursos do Supabase serão efetivamente utilizados (Auth, Realtime, RLS e demais recursos).
- [ ] Definir a estratégia de builds, testes em dispositivos e distribuição do aplicativo.
- [ ] Confirmar se haverá uma aplicação web complementar que justifique o uso da Vercel; a Vercel não faz parte do fluxo de distribuição do aplicativo mobile nativo.

## 7. Restrições e cuidados

- Não criar um backend Java separado sem necessidade identificada e decisão técnica registrada.
- Não armazenar chaves privadas ou segredos no repositório.
- Configurar apenas variáveis públicas apropriadas no aplicativo mobile; credenciais privilegiadas do Supabase nunca devem ser incluídas no app.
- Aplicar autorização e políticas de acesso no backend; não confiar apenas em validações da interface.
- Não considerar a integração do editor VS Code com o painel Supabase como requisito de desenvolvimento.

## 8. Relação com o planejamento

Este registro complementa a Issue #55 — [Definir arquitetura e padrões técnicos do UatiAppy](https://github.com/daviwanziler/uatiappy-vdois/issues/55) — e deve ser lido em conjunto com o escopo do MVP e o diagrama de arquitetura.

A implementação do código-fonte deverá começar após a validação das decisões pendentes e a conferência de consistência do diagrama.
