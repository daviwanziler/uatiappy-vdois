# Requisitos e escopo do MVP — UatiAppy

> **Status:** versão inicial para revisão da equipe e validação do orientador.  
> **Branch de documentação:** `docs/requisitos-escopo-mvp`.  
> **Objetivo:** manter uma referência única para os requisitos funcionais, requisitos não funcionais, regras de negócio e limites do MVP.

## 1. Visão geral

O UatiAppy é um projeto acadêmico de aplicativo institucional de comunicação. O objetivo do MVP é demonstrar a troca de mensagens de texto entre dois usuários, com autenticação, persistência, histórico e controle de acesso.

Este documento consolida o escopo conhecido até o momento. Decisões ainda não confirmadas estão identificadas como **pendências de validação** e não devem ser tratadas como requisitos aprovados.

## 2. Requisitos funcionais (RF)

Requisitos funcionais descrevem os serviços e comportamentos que o sistema deve oferecer.

| ID | Requisito | Prioridade | Escopo |
|---|---|---|---|
| RF-001 | O sistema deve permitir o cadastro de novos usuários. | Alta | MVP |
| RF-002 | O sistema deve permitir que usuários cadastrados realizem login. | Alta | MVP |
| RF-003 | O sistema deve permitir visualizar informações básicas do próprio perfil e identificar os participantes de uma conversa. | Alta | MVP |
| RF-004 | O sistema deve permitir iniciar ou acessar uma conversa individual entre dois usuários. | Alta | MVP |
| RF-005 | O sistema deve permitir enviar mensagens de texto em uma conversa individual. | Alta | MVP |
| RF-006 | O sistema deve permitir receber mensagens de texto enviadas pelo outro participante. | Alta | MVP |
| RF-007 | O sistema deve armazenar as mensagens associadas ao autor e à conversa correspondente. | Alta | MVP |
| RF-008 | O sistema deve permitir consultar o histórico de mensagens de uma conversa autorizada. | Alta | MVP |
| RF-009 | O sistema deve apresentar as mensagens em ordem cronológica. | Alta | MVP |
| RF-010 | O sistema deve apresentar o estado de envio/recebimento/entrega da mensagem, conforme as confirmações suportadas pela aplicação. | Alta | MVP |
| RF-011 | O sistema deve informar quando ocorrer falha no envio de uma mensagem. | Alta | MVP |
| RF-012 | O sistema deve permitir encerrar a sessão do usuário (logout). | Média | MVP |

### 2.1 Observações sobre os RFs

- O RF-003 cobre apenas identificação e informações básicas necessárias à comunicação. Edição avançada de perfil e foto não estão assumidas como parte do MVP.
- No RF-010, a equipe deve definir precisamente o significado de cada estado (por exemplo, enviado ao servidor, recebido pelo dispositivo destinatário e entregue à conversa). Não presumir confirmação de leitura: ela não está definida no escopo atual.
- O envio e recebimento em tempo real é uma expectativa de experiência do produto, mas a tecnologia e o mecanismo de atualização ainda dependem da decisão arquitetural.

## 3. Requisitos não funcionais (RNF)

Requisitos não funcionais estabelecem atributos de qualidade e restrições de operação.

| ID | Categoria | Requisito | Como validar / pendência |
|---|---|---|---|
| RNF-001 | Usabilidade | A interface deve ser simples, consistente e compreensível para os fluxos essenciais. | Realizar avaliação de usabilidade nos fluxos de cadastro, login, abertura de conversa e envio de mensagem. Definir roteiro e participantes. |
| RNF-002 | Desempenho | O envio e a atualização das mensagens devem ocorrer sem demora excessiva para o contexto de uso. | Definir ambiente de teste, carga e metas de tempo com a equipe; registrar medições. |
| RNF-003 | Segurança | Funcionalidades e dados restritos devem exigir autenticação válida. | Testar acesso autenticado e tentativas de acesso sem sessão. |
| RNF-004 | Privacidade e autorização | Cada usuário deve acessar somente conversas das quais participa. | Testar acesso cruzado entre contas e conversas não autorizadas. |
| RNF-005 | Confiabilidade | Mensagens confirmadas como armazenadas devem permanecer disponíveis após encerrar e iniciar uma nova sessão. | Enviar, encerrar sessão, autenticar novamente e verificar a recuperação do histórico. |
| RNF-006 | Compatibilidade | A aplicação deve funcionar nos navegadores, dispositivos ou ambientes definidos para a entrega acadêmica. | A equipe deve registrar os ambientes e versões-alvo antes dos testes. |
| RNF-007 | Integridade | O sistema deve preservar conteúdo, autoria e associação da mensagem à conversa. | Verificar dados após envio, recuperação e atualização do histórico. |
| RNF-008 | Manutenibilidade | O código deve ser organizado em componentes/módulos com responsabilidades claras e convenções documentadas. | Revisar estrutura, padrões de código e legibilidade em pull requests. |
| RNF-009 | Consistência de estado | O estado apresentado para uma mensagem deve refletir as confirmações efetivamente recebidas pelo sistema. | Testar sucesso, atraso, falha e reconexão; documentar transições permitidas. |
| RNF-010 | Proteção de credenciais | Credenciais não devem ser armazenadas ou transmitidas de forma desprotegida. | Revisar implementação de autenticação, armazenamento de senhas e configuração de transporte seguro. |

**Importante:** os RNFs acima são requisitos qualitativos iniciais. Não foram atribuídos números arbitrários (como tempo máximo de resposta ou percentual de disponibilidade). A equipe e o orientador devem definir metas mensuráveis, ambiente e método de medição antes de considerar esses requisitos totalmente verificáveis.

## 4. Regras de negócio (RN)

As regras de negócio definem restrições que devem ser respeitadas pelo sistema.

| ID | Regra |
|---|---|
| RN-001 | Cada usuário deve possuir uma conta identificável de forma única. |
| RN-002 | Somente usuários autenticados podem acessar funcionalidades e dados restritos. |
| RN-003 | Uma conversa individual deve possuir exatamente dois participantes. |
| RN-004 | Toda mensagem deve estar associada a um autor autenticado e a uma conversa existente. |
| RN-005 | Somente os participantes da conversa podem consultar suas mensagens. |
| RN-006 | As mensagens devem ser apresentadas em ordem cronológica, respeitando a referência temporal definida pelo sistema. |
| RN-007 | O estado de uma mensagem deve ser atualizado somente quando houver a confirmação correspondente no fluxo de comunicação. |

## 5. Escopo do MVP

O MVP (Produto Mínimo Viável) contempla o conjunto mínimo de funcionalidades necessário para demonstrar a finalidade principal do UatiAppy: comunicação textual individual entre usuários.

### 5.1 Dentro do MVP

- Cadastro de usuário.
- Login e logout.
- Identificação básica dos participantes.
- Criação ou acesso a conversas individuais entre dois usuários.
- Envio e recebimento de mensagens de texto.
- Armazenamento e recuperação das mensagens.
- Consulta ao histórico da conversa.
- Exibição cronológica das mensagens.
- Indicação dos estados de envio/recebimento/entrega definidos pela equipe.
- Tratamento e comunicação de falhas no envio.
- Controle de acesso às conversas e proteção dos dados.

### 5.2 Fora do MVP — possibilidades futuras

Os itens abaixo não devem ser considerados tarefas obrigatórias da primeira entrega, salvo aprovação explícita de mudança de escopo:

- Conversas em grupo.
- Envio de imagens, vídeos, documentos e outros anexos.
- Edição ou exclusão de mensagens.
- Notificações push.
- Confirmação de leitura, caso não seja aprovada como parte do escopo.
- Recursos avançados de perfil, presença ou personalização.

## 6. Fluxo principal resumido

1. O usuário realiza cadastro ou autentica-se.
2. O usuário localiza ou acessa o outro participante e abre uma conversa individual.
3. O usuário escreve e envia uma mensagem de texto.
4. O sistema valida a sessão e a autorização, registra a mensagem e associa o conteúdo ao autor e à conversa.
5. O sistema disponibiliza a mensagem ao outro participante e atualiza o estado conforme as confirmações recebidas.
6. Os participantes consultam o histórico em ordem cronológica.
7. Se ocorrer falha, o sistema informa o remetente sem indicar sucesso indevidamente.

## 7. Critérios gerais de aceite do MVP

O MVP poderá ser considerado funcional quando, no mínimo:

- Dois usuários distintos conseguirem autenticar-se.
- Um usuário conseguir abrir uma conversa individual com o outro.
- Uma mensagem de texto enviada for associada ao autor e à conversa correta.
- O destinatário conseguir receber e consultar a mensagem.
- O histórico permanecer disponível após nova autenticação.
- A ordem cronológica for mantida.
- O estado da mensagem representar as confirmações realmente recebidas.
- Uma falha de envio for apresentada ao remetente.
- Um usuário não conseguir acessar conversas das quais não participa.
- O logout encerrar o acesso às funcionalidades protegidas.

Os critérios devem ser detalhados em cenários de teste pelo responsável de SQA, em conjunto com PO e equipe técnica.

## 8. Rastreabilidade e gestão das Issues

As Issues do GitHub devem referenciar os IDs deste documento sempre que representarem trabalho relacionado a um requisito.

Sugestão de rastreabilidade inicial:

| Área de trabalho | Requisitos relacionados |
|---|---|
| Cadastro, login e logout | RF-001, RF-002, RF-012, RNF-003, RNF-010, RN-001, RN-002 |
| Perfil e identificação | RF-003 |
| Conversas individuais e autorização | RF-004, RNF-004, RN-003, RN-005 |
| Envio e recebimento de mensagens | RF-005, RF-006, RF-011, RNF-002, RNF-009, RN-004, RN-007 |
| Persistência e histórico | RF-007, RF-008, RF-009, RNF-005, RNF-007, RN-006 |
| Testes e validação | Todos os requisitos aplicáveis, especialmente RNF-001 a RNF-010 |

Antes de iniciar uma implementação, a equipe deve conferir se já existe uma Issue equivalente. Itens fora do MVP devem permanecer identificados como futuros ou ser encerrados como não planejados para esta entrega, sem apagar o histórico.

## 9. Pendências para validação da equipe e do orientador

- Confirmar os campos obrigatórios e a identificação única usada no cadastro.
- Definir quais informações compõem o perfil básico.
- Definir como o usuário localizará o outro participante.
- Confirmar o significado e as transições dos estados da mensagem.
- Decidir se a entrega em tempo real é requisito obrigatório e qual mecanismo será adotado.
- Definir tecnologias, arquitetura e ambiente de execução.
- Definir navegadores/dispositivos suportados.
- Estabelecer metas mensuráveis para desempenho e demais RNFs que exigirem quantificação.
- Confirmar se todos os itens listados no MVP são compatíveis com o prazo e as orientações acadêmicas.

## 10. Controle de alterações

Esta é uma versão inicial consolidada para revisão. Alterações de escopo devem ser discutidas com o PO, avaliadas tecnicamente pelo TechLead, comunicadas à equipe e submetidas à validação do orientador quando necessário.

---
**UatiAppy — documentação de requisitos e escopo do MVP.**
