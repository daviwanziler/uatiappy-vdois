# Arquitetura do UatiAppy

Esta pasta documenta a arquitetura oficial do UatiAppy: **aplicação Web responsiva com abordagem Mobile First**. O usuário acessa o sistema pelo navegador em celulares, tablets e computadores; não há aplicativo React Native/Expo nesta decisão.

## Decisão arquitetural
A decisão vigente está registrada em [ADR-001 — Web Mobile First](./ADR-001-web-mobile-first.md). Ela substitui as referências anteriores a aplicativo nativo React Native + Expo.

## Diagrama
- [Fonte PlantUML da arquitetura Web](./diagrama-arquitetura-mobile.puml) — o nome histórico do arquivo foi mantido para evitar quebrar referências; seu conteúdo agora representa a arquitetura Web Mobile First.
- O PDF antigo de arquitetura mobile não representa a decisão vigente. Não o utilize como referência; deve ser regenerado a partir da fonte PlantUML Web antes da entrega documental final.

## Stack oficial

| Camada / finalidade | Tecnologia |
|---|---|
| Produto | Aplicação Web responsiva — Mobile First |
| Linguagem | JavaScript |
| Interface | HTML5, CSS3 e Vanilla JavaScript |
| Backend | Supabase |
| Banco de dados | PostgreSQL |
| Autenticação | Supabase Auth |
| Operações administrativas privilegiadas | Supabase Edge Functions |
| Hospedagem da aplicação Web | Vercel |
| Versionamento e gestão | Git e GitHub |
| Integração contínua | GitHub Actions |
| Editor | Visual Studio Code |

A interface deve priorizar telas pequenas, adaptar-se a diferentes larguras e permanecer utilizável em navegadores modernos. A estratégia PWA/offline não está incluída automaticamente: exige requisitos e implementação próprios.

## Responsabilidades e limites de segurança

- **Navegador:** apresenta a interface, mantém apenas dados não privilegiados e chama APIs autorizadas.
- **Supabase Auth:** autentica usuários e fornece contexto de identidade.
- **Edge Functions:** executam operações administrativas que exigem privilégios de servidor.
- **PostgreSQL/RLS:** persistem os dados e aplicam autorização no banco, conforme políticas efetivamente implantadas.
- **Vercel:** publica os arquivos estáticos da aplicação web; não substitui o backend.

A chave `service_role` e quaisquer segredos privilegiados nunca podem ser incluídos no bundle JavaScript, no HTML, em variáveis públicas ou enviados ao navegador. As permissões devem ser verificadas no servidor/banco, não apenas ocultando controles na interface.

## Perfis e gerenciamento de contas

- **Administrador:** cadastra e gerencia contas de funcionários, define senha inicial, redefine senhas e bloqueia/desativa contas.
- **Funcionário:** utiliza as credenciais fornecidas pela administração para acessar as funcionalidades autorizadas.

Não há autocadastro nem redefinição autônoma de senha pelo funcionário no escopo definido. Contas bloqueadas/desativadas não podem acessar funcionalidades protegidas.

## Coerência e implementação

Esta documentação deve permanecer alinhada ao [escopo do MVP](../requisitos/escopo-mvp.md). A presença de um serviço nesta arquitetura não prova que ele esteja configurado, implantado ou validado. Cada integração deve possuir configuração segura, testes e evidência de homologação.
