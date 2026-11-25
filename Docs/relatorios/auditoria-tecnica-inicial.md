# Auditoria técnica inicial — UatiAppy

**Data:** 25/11/2026  
**Repositório:** daviwanziler/uatiappy-vdois  
**Branch-base analisada:** `main`  
**Branch desta auditoria:** `chore/auditoria-inicial`  
**Status:** diagnóstico preliminar; não representa validação de execução.

## 1. Objetivo

Registrar o estado verificável do repositório antes de iniciar a implementação, preservando a branch `main` e preparando a primeira etapa de bootstrap.

## 2. Evidências verificadas

- A árvore recursiva da branch `main` contém documentação e licença, mas nenhum código-fonte ou manifesto de dependências identificável.
- Arquivos identificados na raiz: `README.md`, `LICENSE` e diretório `Docs/`.
- Documentação encontrada:
  - `Docs/requisitos/escopo-mvp.md`
  - `Docs/estimativas/proposta-analise-pontos-de-funcao.md`
  - `Docs/arquitetura/README.md`
  - `Docs/arquitetura/Diagrama de Arquitetura UatiAppy.pdf`
- Branches existentes na consulta: `main`, `docs/arquitetura`, `docs/diagramas-uml-mvp` e `docs/requisitos-escopo-mvp`.
- Pull requests documentais #88, #89, #94 e #95 aparecem integrados.
- A Issue #55 (definição de arquitetura e padrões técnicos) está fechada e afirma que a stack foi definida e aprovada, mas o corpo consultado não registra os nomes das tecnologias.
- As Issues #90 e #91 detalham cadastro e autenticação/sessão; a #92 trata persistência e consulta de mensagens; a #93 trata apresentação cronológica e estados.
- A Issue #58 acompanha a entrega integrada de cadastro/login/logout; a #61 acompanha conversas e histórico; a #62 trata atualização em tempo real.

## 3. Escopo funcional documentado

O MVP documentado contempla cadastro, login/logout, identificação básica, conversas individuais, mensagens de texto, persistência, histórico, ordenação cronológica, estados de mensagem e controle de acesso.

Conversas em grupo, anexos, edição/exclusão de mensagens, notificações push e recursos avançados de perfil estão fora do MVP inicial, salvo mudança de escopo aprovada.

## 4. Diagnóstico

**Conclusão:** o repositório está em estágio de documentação e planejamento. Não foi identificado código-fonte da aplicação na branch `main`; portanto, ainda não é possível avaliar compilação, execução, testes, cobertura, segurança implementada ou percentual de conclusão funcional.

A ausência de código na `main` não prova que não exista código em outro repositório, computador ou branch não consultada. Esta conclusão limita-se à árvore da branch principal inspecionada.

## 5. Bloqueios e pendências antes do bootstrap

1. Ler o conteúdo do PDF de arquitetura e transcrever as tecnologias aprovadas para frontend, backend, banco de dados e comunicação em tempo real.
2. Confirmar se existe código em outro local; o responsável informou que, segundo seu conhecimento atual, o código ainda não existe.
3. Recuperar a estrutura de pastas e convenções de desenvolvimento definidas na Issue #55 ou no diagrama.
4. Confirmar os campos obrigatórios de cadastro e identificador único com o PO.
5. Confirmar os estados oficiais de mensagem e suas transições.
6. Definir arquivo de configuração de ambiente e política de segredos antes de qualquer integração.

## 6. Próxima entrega recomendada

Após validar a stack do diagrama, criar em branch própria o esqueleto mínimo do projeto, incluindo:

- estrutura de diretórios aprovada;
- arquivos de manifesto e scripts correspondentes à stack escolhida;
- configuração de ambiente de exemplo sem credenciais;
- documentação de instalação e execução local;
- endpoint/tela inicial mínima, somente se compatível com a arquitetura;
- testes ou verificação automatizada mínima de inicialização.

Não instalar ou introduzir frameworks, banco de dados, provedores de autenticação ou serviços em tempo real antes de confirmar as decisões arquiteturais aprovadas.

## 7. Estratégia de versionamento

- Manter `main` protegida de alterações experimentais.
- Criar uma branch por entrega.
- Abrir Pull Request com resumo, requisitos relacionados, critérios de aceite e evidências de teste.
- Integrar somente após revisão e validação.

## 8. Atualização após a revisão da arquitetura (25/11/2026)

Esta seção complementa o diagnóstico original; não altera retroativamente as evidências coletadas na data da auditoria.

- A documentação de requisitos e arquitetura foi atualizada e integrada à `main` pela PR #99.
- O PDF de arquitetura foi substituído por uma versão que representa a direção mobile.
- A documentação atual registra como proposta: JavaScript, React Native, Expo, Supabase e PostgreSQL; a validação formal pela equipe e pelo orientador permanece pendente.
- O modelo de acesso documentado contempla os perfis Administrador e Funcionário, com gerenciamento administrativo de contas.
- A fonte PlantUML da arquitetura mobile foi adicionada à documentação.
- A auditoria continua sem evidência de código-fonte da aplicação na `main`; a integração documental não significa que o aplicativo já esteja implementado.
- A antiga pendência de ler o PDF e descobrir a direção mobile foi superada pela revisão documental. Permanecem pendentes a validação formal da stack e a definição dos detalhes de implementação.

## 9. Próxima entrega recomendada — bootstrap mobile

Após a validação da stack e das decisões técnicas ainda pendentes, criar em branch própria um bootstrap mínimo com:

- projeto React Native com Expo e JavaScript;
- estrutura inicial de diretórios e scripts;
- instruções para instalação e execução local;
- configuração de ambiente de exemplo sem credenciais reais;
- tela inicial mínima para comprovar a execução em dispositivo/emulador;
- verificações automatizadas iniciais no GitHub Actions, se configuradas.

A integração com Supabase, autenticação e funcionalidades de mensagens deve ocorrer em entregas próprias, orientadas pelas Issues e critérios de aceite correspondentes. Não incluir segredos ou credenciais privilegiadas no aplicativo.

---

Documento preparado como registro da auditoria inicial, com atualização posterior claramente separada do diagnóstico original. As conclusões sobre implementação devem ser revistas após o primeiro código-fonte e suas evidências de execução.
