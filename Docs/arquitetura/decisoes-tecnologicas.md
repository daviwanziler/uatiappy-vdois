# Decisões Tecnológicas — UatiAppy

## 1. Objetivo e status
Registrar a stack adotada e separar decisões aprovadas de detalhes que ainda exigem implementação ou validação.

**Status:** Web Mobile First adotada para a entrega atual por decisão registrada em 27/11/2026. Eventual validação formal do orientador, se exigida pela disciplina, deve ser documentada separadamente.

## 2. Plataforma e frontend

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Plataforma principal | Aplicação Web responsiva — Mobile First | Acesso pelo navegador em celulares, tablets e computadores |
| Linguagem | JavaScript | Lógica da aplicação |
| Estrutura e apresentação | HTML5 e CSS3 | Interface e responsividade |
| Código de interface | Vanilla JavaScript (módulos ES) | Interações e integração com APIs |
| Editor | Visual Studio Code | Edição e organização do código |

Mobile First significa projetar primeiro para telas pequenas e ampliar a experiência para viewports maiores. Não significa aplicativo nativo React Native, nem PWA automaticamente.

## 3. Backend e dados

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Backend como serviço | Supabase | Serviços de backend |
| Banco de dados | PostgreSQL gerenciado pelo Supabase | Persistência |
| Autenticação | Supabase Auth | Identidade e sessão |
| Operações privilegiadas | Supabase Edge Functions | Provisionamento e gestão administrativa |
| Autorização de dados | PostgreSQL/RLS | Restringir dados por identidade, papel e participação |

A interface comunica-se com Supabase por SDK/API sobre HTTPS. Operações privilegiadas devem ocorrer no servidor. A chave `service_role` nunca pode ser exposta no navegador, bundle, HTML, configuração pública ou repositório.

## 4. Hospedagem, versionamento e automação

| Elemento | Tecnologia | Responsabilidade |
|---|---|---|
| Hospedagem Web | Vercel | Publicar arquivos estáticos |
| Versionamento e gestão | Git e GitHub | Código, branches, Issues e Pull Requests |
| CI | GitHub Actions | Verificações e testes automatizados |

A Vercel hospeda o frontend Web, não um aplicativo nativo. A configuração de produção deve fornecer ao frontend somente valores públicos (URL do Supabase e chave anon/public); segredos privilegiados permanecem nas configurações server-side das Edge Functions.

## 5. Visão simplificada
1. O usuário acessa a aplicação Web pelo navegador.
2. A Vercel entrega HTML, CSS e JavaScript responsivos.
3. O frontend autentica o usuário pelo Supabase Auth.
4. Consultas de dados são protegidas por RLS no PostgreSQL.
5. Operações administrativas passam por Edge Functions que validam JWT, papel e estado da conta.
6. GitHub Actions executa as verificações configuradas para pull requests.

## 6. Pendências técnicas
- [ ] Definir matriz de navegadores, viewports e dispositivos para testes responsivos.
- [ ] Confirmar configuração do Supabase Auth, RLS, funções e variáveis nos ambientes de staging/produção.
- [ ] Validar CORS com origens exatas de Preview e Production.
- [ ] Definir e executar testes de acessibilidade e usabilidade.
- [ ] Gerar novamente o PDF de arquitetura a partir do diagrama PlantUML Web.
- [ ] Registrar homologação de staging e critérios de aceite funcionais.

## 7. Restrições e cuidados
- Não colocar chaves privadas ou segredos no repositório ou no bundle do navegador.
- Nunca expor `service_role`; somente Edge Functions/ambiente confiável podem usá-la.
- Aplicar autorização no backend/banco; não confiar apenas na interface.
- Não habilitar autocadastro público sem mudança formal de requisito.
- PWA, offline, notificações push e distribuição em lojas não fazem parte desta decisão.
- Não tratar componentes ou serviços documentados como implementados sem evidência.

## 8. Relação com o planejamento
Esta decisão complementa a Issue #55 e deve ser lida com [Requisitos e escopo do MVP](../requisitos/escopo-mvp.md), [Arquitetura](./README.md) e [ADR-001 — Web Mobile First](./ADR-001-web-mobile-first.md).
