# Decisões Tecnológicas — UatiAppy

## 1. Objetivo e status

Registrar as decisões tecnológicas adotadas para o UatiAppy e separar o que já foi definido pela equipe das decisões de implementação que ainda precisam ser detalhadas.

**Decisão de plataforma atualizada em 25/11/2026:** aplicação Web responsiva, acessível por um único link no navegador em celulares e computadores.

**Decisões confirmadas:** JavaScript, Supabase/PostgreSQL, Visual Studio Code, GitHub, GitHub Actions e Vercel para hospedagem Web.

**Direção técnica definida para o frontend:** HTML para estrutura, CSS para apresentação e JavaScript puro (Vanilla JavaScript) para lógica e interações. A equipe tentará essa abordagem no MVP, sem adotar React, Vite ou outro framework neste momento.

As decisões anteriores de aplicativo nativo com React Native e Expo ficam **superadas** pela definição Web registrada nesta atualização. A aplicação não será PWA e não exigirá instalação.

## 2. Plataforma e desenvolvimento

| Elemento | Tecnologia / decisão | Responsabilidade |
|---|---|---|
| Plataforma principal | Aplicação Web responsiva | Um único sistema para celular e computador |
| Acesso | Navegador por URL | Acesso sem instalação |
| Linguagem | JavaScript | Lógica e interface da aplicação |
| Estrutura e interface | HTML e CSS | Estruturação e apresentação das páginas Web |\n| Lógica da aplicação | JavaScript puro (Vanilla JavaScript) | Interações e funcionalidades sem framework |
| Editor | Visual Studio Code (VS Code) | Edição e organização do código-fonte |

A interface deve adaptar-se a diferentes larguras de tela e permanecer utilizável em navegadores de celulares e computadores. Não incluir recursos de instalação PWA, service worker ou distribuição em lojas como requisito do MVP.

## 3. Backend e dados — tecnologias definidas, recursos a detalhar

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Backend como serviço | Supabase | Serviços de backend consumidos pela aplicação Web |
| Banco de dados | PostgreSQL gerenciado pelo Supabase | Persistência dos dados |
| Integração | SDK/API do Supabase | Comunicação entre a aplicação e os serviços Supabase |

O VS Code será utilizado como editor e **não será conectado diretamente ao painel do Supabase**. A aplicação Web em execução comunicará-se com o Supabase por SDK/API, usando HTTPS e configuração apropriada de variáveis de ambiente.

A seleção e configuração dos recursos específicos do Supabase ainda devem ser detalhadas conforme os requisitos aprovados. Isso inclui decidir o uso de Supabase Auth, Realtime, políticas de Row Level Security (RLS), funções e demais recursos. Não se deve presumir que todos serão necessários.

**Segurança no navegador:** somente configurações/chaves apropriadas para cliente podem ser disponibilizadas à aplicação Web. Chaves privilegiadas, como `service_role`, nunca podem ser incluídas no bundle, no navegador ou em variáveis públicas. Operações administrativas privilegiadas devem ocorrer em ambiente seguro no servidor, com mecanismo a definir. A autorização e as políticas de acesso devem ser aplicadas no backend/banco de dados, e não apenas na interface.

## 4. Repositório, automação e hospedagem

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Versionamento e gestão | Git e GitHub | Código-fonte, branches, Issues e Pull Requests |
| Automação | GitHub Actions | Testes, verificações e etapas de CI/CD conforme workflows configurados |
| Hospedagem Web | Vercel | Publicação da aplicação Web e gestão dos ambientes de deploy |

A Vercel será utilizada para hospedar a aplicação Web. O fluxo de deploy deverá ser integrado ao repositório e aos workflows definidos pela equipe. Ambientes e variáveis de ambiente devem ser configurados sem registrar valores secretos na documentação ou no GitHub.

## 5. Visão simplificada da arquitetura

1. Usuários Administradores e Funcionários acessam a mesma aplicação Web responsiva por um navegador em celular ou computador.
2. A aplicação Web é publicada pela Vercel e disponibilizada por um único endereço.
3. A aplicação comunica-se com os serviços selecionados do Supabase por SDK/API, usando HTTPS.
4. Os serviços Supabase interagem com o PostgreSQL; políticas de acesso/RLS devem ser aplicadas no banco quando adotadas.
5. Operações administrativas privilegiadas, como provisionar usuários ou redefinir credenciais, devem ocorrer em ambiente seguro no servidor. Segredos não podem ser enviados ao navegador.
6. GitHub mantém o código e o fluxo de revisão; GitHub Actions automatiza testes e verificações configuradas.

## 6. Pontos ainda pendentes

- [ ] TechLead definir e registrar o framework/biblioteca de interface Web e sua justificativa.
- [ ] Definir a estrutura de pastas, organização dos módulos JavaScript, navegação entre páginas e convenções de código para a aplicação Web.
- [ ] Definir quais recursos do Supabase serão utilizados no MVP (por exemplo, Auth, Realtime e RLS) e documentar suas configurações.
- [ ] Definir a implementação segura das operações administrativas de contas, sem expor credenciais privilegiadas no navegador.
- [ ] Definir ambientes de desenvolvimento, teste e produção e suas variáveis de ambiente, sem registrar valores secretos.
- [ ] Definir a matriz inicial de navegadores e tamanhos de tela suportados.
- [ ] Atualizar e regenerar o PDF do diagrama de arquitetura para a visão Web antes de considerá-lo sincronizado.
- [ ] Registrar eventual validação formal do orientador, se exigida pelo processo acadêmico.

## 7. Restrições e cuidados

- Não desenvolver aplicativo mobile nativo com React Native/Expo para o escopo atual.
- Não tratar a aplicação como PWA nem adicionar instalação na tela inicial como requisito.
- Não incluir chaves privadas, tokens administrativos ou segredos no repositório ou no código executado no navegador.
- Não expor credenciais privilegiadas do Supabase (como `service_role`) no bundle Web ou em variáveis públicas.
- Aplicar autorização e políticas de acesso no backend/banco de dados; não confiar apenas em validações da interface.
- Não considerar serviços Supabase, workflows, ambientes ou funcionalidades como implementados apenas por constarem nesta arquitetura.
- Não introduzir React, Vite ou outro framework sem uma decisão posterior registrada e justificada pela equipe.

## 8. Relação com o planejamento

Este registro complementa a Issue #55 — [Definir arquitetura e padrões técnicos do UatiAppy](https://github.com/daviwanziler/uatiappy-vdois/issues/55) — e deve ser lido em conjunto com o escopo do MVP, o README e o diagrama de arquitetura.

A plataforma Web responsiva, o acesso por navegador, JavaScript, Supabase/PostgreSQL, Vercel, GitHub e GitHub Actions estão definidos. O framework Web e os detalhes específicos de implementação continuam pendentes e devem ser decididos antes do bootstrap e do início das implementações dependentes.
