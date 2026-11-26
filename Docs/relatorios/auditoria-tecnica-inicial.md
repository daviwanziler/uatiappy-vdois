# Auditoria técnica inicial — UatiAppy

**Data da auditoria inicial:** 25/11/2026  
**Revisão da direção técnica:** 26/11/2026  
**Repositório:** daviwanziler/uatiappy-vdois  
**Branch-base analisada:** `main`  
**Branch desta auditoria:** `chore/auditoria-inicial`  
**Status:** diagnóstico documental; não representa validação de execução da aplicação.

## 1. Objetivo

Registrar o estado verificável do repositório antes do início da implementação, preservando as evidências da auditoria inicial e atualizando as recomendações conforme a definição mais recente da plataforma.

## 2. Evidências verificadas na auditoria inicial (25/11/2026)

- A árvore recursiva da branch `main` consultada continha documentação e licença, mas nenhum código-fonte ou manifesto de dependências identificável.
- Arquivos identificados na raiz: `README.md`, `LICENSE` e diretório `Docs/`.
- Documentação encontrada:
  - `Docs/requisitos/escopo-mvp.md`
  - `Docs/estimativas/proposta-analise-pontos-de-funcao.md`
  - `Docs/arquitetura/README.md`
  - `Docs/arquitetura/Diagrama de Arquitetura UatiAppy.pdf`
- Pull requests documentais #88, #89, #94 e #95 apareciam integrados na consulta.
- A Issue #55 (definição de arquitetura e padrões técnicos) estava fechada, mas o corpo consultado não registrava todos os detalhes da stack.
- As Issues #90 e #91 detalham cadastro e autenticação/sessão; a #92 trata persistência e consulta de mensagens; a #93 trata apresentação cronológica e estados.
- A Issue #58 acompanha a entrega integrada de cadastro/login/logout; a #61 acompanha conversas e histórico; a #62 trata atualização em tempo real.

Estas evidências representam o estado observado na data da auditoria inicial e não devem ser interpretadas como uma descrição imutável do estado atual do repositório.

## 3. Escopo funcional documentado

O MVP documentado contempla cadastro, login/logout, identificação básica, conversas individuais, mensagens de texto, persistência, histórico, ordenação cronológica, estados de mensagem e controle de acesso.

Conversas em grupo, anexos, edição/exclusão de mensagens, notificações push e recursos avançados de perfil estão fora do MVP inicial, salvo mudança de escopo aprovada.

## 4. Diagnóstico da auditoria inicial

**Conclusão em 25/11/2026:** não foi identificado código-fonte da aplicação na branch `main` consultada. Portanto, naquela verificação, não havia evidências suficientes para avaliar compilação, execução, testes, cobertura, segurança implementada ou percentual de conclusão funcional.

A ausência de código na `main` não prova que não exista código em outro repositório, computador ou branch não consultada. Esta conclusão limita-se à árvore da branch principal inspecionada naquela data.

## 5. Pendências levantadas na auditoria inicial

Na data da primeira auditoria, foram levantadas as seguintes pendências:

1. Confirmar e registrar as tecnologias de frontend, backend, banco de dados e hospedagem.
2. Confirmar se existia código em outro local; o responsável informou que, segundo seu conhecimento naquele momento, o código ainda não existia.
3. Recuperar a estrutura de pastas e convenções de desenvolvimento definidas na Issue #55 ou na documentação de arquitetura.
4. Confirmar os campos obrigatórios de cadastro e identificador único com o PO.
5. Confirmar os estados oficiais de mensagem e suas transições.
6. Definir configuração de ambiente e política de segredos antes de qualquer integração.

O status atualizado dessas decisões está registrado na seção 8.

## 6. Diretrizes para o início da implementação

O bootstrap deve ser realizado em branch própria e seguir as decisões arquiteturais aprovadas. A entrega inicial deve incluir, conforme definido pela equipe:

- estrutura de diretórios e convenções do projeto;
- manifesto de dependências e scripts da tecnologia escolhida;
- configuração de ambiente de exemplo, sem credenciais;
- documentação de instalação e execução local;
- uma tela inicial mínima para comprovar a execução da aplicação;
- verificações automatizadas iniciais no GitHub Actions, quando configuradas.

Não introduzir frameworks, serviços ou bibliotecas adicionais sem verificar sua compatibilidade com a arquitetura e registrar a decisão técnica quando necessário.

## 7. Estratégia de versionamento

- Manter `main` como branch de integração, evitando alterações experimentais diretamente nela.
- Criar uma branch por entrega.
- Abrir Pull Request com resumo, requisitos relacionados, critérios de aceite e evidências de validação.
- Integrar somente após revisão e validação.
- Não incluir credenciais, tokens ou segredos nos arquivos versionados.

## 8. Atualização da direção técnica — aplicação Web Mobile First (26/11/2026)

A definição atual do produto é **aplicação Web responsiva com abordagem Mobile First**. O UatiAppy será acessado por um link no navegador, tanto em celulares quanto em computadores. A experiência prioritária será a de dispositivos móveis, mas a aplicação também deverá se adaptar a telas maiores.

A interpretação anterior de que o projeto seria um aplicativo mobile nativo foi incorreta e fica substituída por esta atualização. Portanto, **React Native e Expo não devem ser tratados como a base tecnológica definida para o produto**.

Stack e responsabilidades registradas conforme as decisões atuais:

- **Linguagem:** JavaScript.
- **Editor de desenvolvimento:** Visual Studio Code (ferramenta de trabalho, não tecnologia executada pelo usuário).
- **Frontend:** aplicação Web responsiva, com prioridade Mobile First.
- **Framework/bundler do frontend:** ainda precisa ser formalmente confirmado pela equipe e pelo orientador. React com Vite pode ser avaliado como alternativa, mas não está registrado aqui como decisão aprovada.
- **Backend e banco de dados:** Supabase, com PostgreSQL. Recursos como Auth, Row Level Security (RLS), APIs, funções e políticas devem ser utilizados conforme os requisitos e decisões de segurança, sem presumir que todos serão necessários.
- **Hospedagem e deploy da aplicação Web:** Vercel.
- **Versionamento e gestão do trabalho:** GitHub.
- **Automação CI/CD:** GitHub Actions, integrada ao fluxo de validação e deploy conforme configuração da equipe.

O modelo de acesso documentado contempla os perfis Administrador e Funcionário, com gerenciamento administrativo de contas. As regras de cadastro, provisionamento de credenciais, bloqueio/desativação e permissões devem continuar alinhadas às definições aprovadas pelo PO e às políticas de segurança.

A integração da documentação não significa que as funcionalidades já estejam implementadas. O estado de implementação só poderá ser confirmado por código, execução e evidências de teste.

## 9. Próxima entrega recomendada — bootstrap da aplicação Web

A próxima entrega técnica deve criar a base executável da aplicação Web responsiva, seguindo a abordagem Mobile First. Antes de iniciar, a equipe deve confirmar o framework/bundler do frontend e registrar essa decisão.

O bootstrap deverá contemplar, no mínimo:

- projeto JavaScript para aplicação Web, sem iniciar um projeto React Native/Expo;
- estrutura inicial de diretórios e scripts compatíveis com o framework aprovado;
- layout inicial responsivo, começando pela experiência em telas móveis e adaptando-se a telas maiores;
- instruções de instalação e execução local no Visual Studio Code;
- arquivo de exemplo de variáveis de ambiente, sem valores secretos;
- configuração inicial de build e verificações automatizadas no GitHub Actions;
- preparação da integração de deploy com a Vercel, sem expor credenciais;
- documentação das decisões e dos passos para reproduzir a execução.

A integração com Supabase, autenticação, autorização/RLS e funcionalidades de mensagens deve ocorrer em entregas próprias, orientadas pelas Issues e critérios de aceite correspondentes. Não armazenar chaves privilegiadas ou segredos no código cliente; utilizar apenas configurações públicas apropriadas ao frontend e manter operações privilegiadas no ambiente confiável do backend, quando necessárias.

## 10. Critérios para considerar a base pronta

- A aplicação inicia localmente conforme as instruções documentadas.
- A interface é utilizável em viewport móvel e se adapta a viewport desktop.
- O build de produção é concluído sem erros.
- As verificações automatizadas configuradas são executadas com sucesso.
- As variáveis de ambiente necessárias estão documentadas sem revelar valores secretos.
- A integração com Supabase e o deploy na Vercel respeitam as decisões de segurança e configuração do projeto.

---

Documento de auditoria com registro histórico e atualização técnica posterior. As conclusões sobre implementação devem ser revistas após a inclusão do código-fonte e a apresentação de evidências de execução e testes.
