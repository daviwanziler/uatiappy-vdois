# Documentação de Requisitos — UatiAppy

## 1. Requisito Funcional (RF)
(Os requisitos funcionais representam aquilo que o aplicativo deverá fazer.)
Com base no README do repositório e nas Issues #37 e #61:

ESSENCIAIS PARA O MVP
ID	Requisito funcional	Prioridade
RF-001	O sistema deve permitir o cadastro de novos usuários.	Alta
RF-002	O sistema deve permitir que usuários realizem login.	Alta
RF-003	O sistema deve permitir que usuários visualizem suas informações básicas de perfil.	Alta
RF-004	O sistema deve permitir identificar os participantes de uma conversa.	Alta
RF-005	O sistema deve permitir iniciar uma conversa individual entre dois usuários.	Alta
RF-006	O sistema deve permitir enviar mensagens de texto.	Alta
RF-007	O sistema deve permitir receber mensagens de outros usuários.	Alta
RF-008	O sistema deve armazenar as mensagens enviadas e recebidas.	Alta
RF-009	O sistema deve permitir consultar o histórico de mensagens.	Alta
RF-010	O sistema deve apresentar as mensagens em ordem cronológica.	Alta
RF-011	O sistema deve apresentar o estado da mensagem (enviada, recebida ou entregue).	Alta
RF-012	O sistema deve informar ao usuário quando ocorrer uma falha no envio de mensagem.	Alta
RF-013	O sistema deve permitir encerrar a sessão do usuário (logout).	Média

## 2. Requisitos não funcionais (RNF)
Os requisitos não funcionais descrevem como o UatiAppy deverá funcionar, considerando qualidade, segurança e experiência de utilização.
ID	Categoria	Requisito
RNF-001	Usabilidade	A interface deve ser simples e intuitiva.
RNF-002	Desempenho	O sistema deve processar o envio de mensagens sem atrasos desnecessários.
RNF-003	Segurança	O acesso às funcionalidades restritas deve exigir autenticação.
RNF-004	Privacidade	Cada usuário deve acessar somente as conversas das quais participa.
RNF-005	Confiabilidade	As mensagens confirmadas como armazenadas devem permanecer disponíveis após o encerramento da sessão.
RNF-006	Compatibilidade	A interface deve funcionar nos ambientes definidos pela equipe para a entrega do projeto.
RNF-007	Integridade	O sistema deve preservar o conteúdo e a identificação do autor das mensagens.
RNF-008	Manutenibilidade	O código deve ser organizado para facilitar correções e futuras melhorias.
RNF-009	Desempenho	O sistema deve atualizar o estado das mensagens de maneira adequada ao fluxo de comunicação.
RNF-010	Segurança	As credenciais dos usuários devem ser armazenadas de maneira protegida.

Importante: esses RNFs são propostas iniciais. Não vamos inventar limites como resposta em dois segundos ou disponibilidade de 99,9% sem que a equipe defina e justifique essas metas.
Para a validação, devemos estabelecer métricas para desempenho, compatibilidade e segurança.

## 3. Delimitação do escopo do MVP
O MVP (Minimum Viable Product, ou Produto Mínimo Viável) é a primeira versão funcional do aplicativo, contendo somente os recursos necessários para demonstrar sua finalidade principal.
Dentro do MVP:

Prioridade alta
- Cadastro e login.
- Identificação básica do usuário.
- Conversas individuais.
- Envio e recebimento de mensagens de texto.
- Armazenamento das mensagens.
- Histórico de conversas.
- Indicação de envio, recebimento e entrega.
- Controle de acesso às conversas.
  
  Fora do MVP
  Versões futuras
- Conversas em grupo.
- Envio de documentos, imagens e vídeos.
- Edição e exclusão de mensagens.
- Notificações push.

## 4. Regras de Negócio

RN-001: Cada usuário deverá possuir uma conta
com identificação única.
RN-002: Somente usuários autenticados poderão
acessar as funcionalidades restritas.
RN-003: Uma conversa individual deverá possuir
dois participantes.
RN-004: Cada mensagem deverá estar associada
a um autor e a uma conversa.
RN-005: Somente os participantes autorizados
poderão visualizar as mensagens.
RN-006: As mensagens deverão ser apresentadas
em ordem cronológica.
RN-007: O sistema deverá atualizar o status
da mensagem conforme as confirmações de envio,
recebimento e entrega.
