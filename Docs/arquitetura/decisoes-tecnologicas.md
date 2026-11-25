# Decisões Tecnológicas — UatiAppy

## 1. Objetivo e status

Registrar as decisões tecnológicas adotadas para o UatiAppy e separar o que já foi definido pela equipe das decisões de implementação que ainda precisam ser detalhadas.

**Status da stack principal:** definida e confirmada pela equipe.

**Validação acadêmica:** eventual validação formal pelo orientador deve ser registrada separadamente; ela não altera o fato de que a equipe já confirmou a direção tecnológica.

## 2. Plataforma e linguagem — decisões confirmadas

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Plataforma principal | Aplicativo mobile | Entrega principal do projeto |
| Linguagem | JavaScript | Implementação da lógica da aplicação |
| Framework mobile | React Native | Construção da interface e integração com recursos do dispositivo |
| Ferramentas mobile | Expo | Desenvolvimento, execução e preparação de builds |
| Editor | Visual Studio Code (VS Code) | Edição e organização do código-fonte |

## 3. Backend e dados — tecnologias definidas, recursos a detalhar

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Backend como serviço | Supabase | Serviços de backend consumidos pelo aplicativo |
| Banco de dados | PostgreSQL gerenciado pelo Supabase | Persistência dos dados |
| Integração | SDK/API do Supabase | Comunicação entre o aplicativo e os serviços Supabase |

O VS Code será utilizado como editor e **não será conectado diretamente ao painel do Supabase**. A comunicação necessária entre o aplicativo em execução e o Supabase ocorrerá pelo código, utilizando SDK/API e configuração apropriada de variáveis de ambiente.

A seleção e configuração dos recursos específicos do Supabase ainda devem ser detalhadas conforme os requisitos aprovados. Isso inclui decidir o uso de Supabase Auth, Realtime, políticas de Row Level Security (RLS), funções e demais recursos. Não se deve presumir que todos serão necessários.

As políticas de autorização e acesso aos dados devem ser aplicadas no backend/banco de dados. A interface mobile não pode ser a única camada de proteção.

## 4. Repositório, automação e entrega

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Versionamento e gestão | Git e GitHub | Código-fonte, branches, Issues e Pull Requests |
| Automação | GitHub Actions | Verificações, testes e etapas de CI/CD conforme workflows configurados |
| Hospedagem web complementar | Vercel | Hospedagem de eventual página ou serviço web complementar compatível |

A Vercel não será utilizada como mecanismo de hospedagem ou distribuição do aplicativo mobile nativo. O fluxo de build e distribuição para dispositivos deverá ser definido com ferramentas compatíveis com React Native/Expo. Expo Application Services (EAS) é uma alternativa a avaliar, ainda não uma decisão de implementação registrada.

## 5. Visão simplificada da arquitetura

1. O aplicativo mobile é desenvolvido em JavaScript com React Native e Expo e executa no dispositivo.
2. O aplicativo comunica-se com os serviços do Supabase por SDK/API, usando comunicação segura (HTTPS).
3. Os serviços selecionados do Supabase interagem com o PostgreSQL, onde devem ser aplicadas as políticas de acesso/RLS quando adotadas.
4. Operações administrativas privilegiadas, como provisionar usuários ou redefinir credenciais, devem ocorrer em ambiente seguro no servidor. Chaves privilegiadas nunca podem ser incluídas no aplicativo mobile. O mecanismo específico para essas operações ainda precisa ser definido.
5. GitHub mantém o código e o fluxo de revisão; GitHub Actions automatiza as etapas configuradas.
6. Vercel poderá ser utilizada para uma entrega web complementar, se houver necessidade; ela não faz parte do caminho de distribuição do app nativo.

## 6. Pontos ainda pendentes

- [ ] Registrar eventual validação formal do orientador, se exigida pelo processo acadêmico. A equipe já confirmou a stack principal.
- [ ] Definir quais recursos do Supabase serão utilizados no MVP (por exemplo, Auth, Realtime e RLS) e documentar suas configurações.
- [ ] Definir a implementação segura das operações administrativas de contas, sem expor credenciais privilegiadas no aplicativo.
- [ ] Definir o fluxo de build, testes em dispositivos e distribuição do aplicativo mobile; avaliar EAS sem tratá-lo como adotado antes da decisão.
- [ ] Confirmar se haverá uma aplicação ou serviço web complementar que justifique o uso da Vercel.

A documentação e o PDF de arquitetura foram alinhados à direção mobile na PR #99, já integrada à `main`. Esta atualização corrige a distinção entre a stack confirmada pela equipe e os detalhes técnicos que continuam pendentes.

## 7. Restrições e cuidados

- Não criar um backend Java separado sem necessidade identificada e decisão técnica registrada.
- Não armazenar chaves privadas ou segredos no repositório.
- No aplicativo mobile, utilizar somente configurações e chaves apropriadas para cliente. Credenciais privilegiadas do Supabase (como service_role) nunca devem ser incluídas no app.
- Aplicar autorização e políticas de acesso no backend/banco de dados; não confiar apenas em validações da interface.
- Não considerar a integração do editor VS Code com o painel Supabase como requisito.
- Não tratar recursos, serviços ou fluxos ainda pendentes como se já estivessem implementados.

## 8. Relação com o planejamento

Este registro complementa a Issue #55 — [Definir arquitetura e padrões técnicos do UatiAppy](https://github.com/daviwanziler/uatiappy-vdois/issues/55) — e deve ser lido em conjunto com o escopo do MVP e o diagrama de arquitetura.

A stack principal está definida pela equipe. O início de cada implementação deve respeitar os requisitos aprovados e as decisões específicas ainda pendentes, sem presumir serviços ou configurações não confirmados.
