# Proposta técnica — Análise de Requisitos e Estimativa por Pontos de Função

**Projeto:** UatiAppy — `daviwanziler/uatiappy-vdois`  
**Cliente:** Fábio Cerqueira  
**Data:** 18/11/2026  
**Preço de referência:** R$ 488,00 por ponto de função  
**Status:** estimativa preliminar, sujeita à validação

## 1. Resumo executivo

A análise foi baseada no `README.md` e em `Docs/requisitos/escopo-mvp.md`, na branch `main`. O UatiAppy é um aplicativo acadêmico de comunicação individual entre usuários. O MVP documentado contempla cadastro, login/logout, identificação básica, conversas individuais, envio/recebimento de mensagens de texto, persistência, histórico, estados de mensagem e controle de acesso.

A documentação contém 12 requisitos funcionais (RF-001 a RF-012), 10 requisitos não funcionais (RNF-001 a RNF-010) e 7 regras de negócio (RN-001 a RN-007). Os RNFs influenciam arquitetura, testes e riscos, mas não são convertidos diretamente em pontos de função.

| Tipo | Quantidade candidata | Peso provisório | Subtotal |
|---|---:|---:|---:|
| ALI | 3 | 7 | 21 PF |
| AIE | 0 | 5 | 0 PF |
| EE | 5 | 3 | 15 PF |
| SE | 0 | 4 | 0 PF |
| CE | 2 | 3 | 6 PF |
| **Total indicativo** | **10 funções** | — | **42 PF** |

**Valor indicativo:** 42 PF × R$ 488,00 = **R$ 20.496,00**.

> Os 42 PF são uma hipótese de trabalho para planejamento, não uma contagem definitiva. A documentação não informa DET, RET e FTR suficientes para comprovar a complexidade das funções. Todos os pesos foram assumidos como baixa complexidade para fins preliminares.

## 2. Base documental e limites

Fontes consultadas:
- [Repositório GitHub](https://github.com/daviwanziler/uatiappy-vdois)
- [README](https://github.com/daviwanziler/uatiappy-vdois/blob/main/README.md)
- [Requisitos e escopo do MVP](https://github.com/daviwanziler/uatiappy-vdois/blob/main/Docs/requisitos/escopo-mvp.md)

Não foi realizada inspeção do código-fonte, banco de dados implantado, protótipos ou integrações. A análise descreve o escopo documentado e não comprova o comportamento já implementado. O documento de requisitos está identificado como versão inicial para revisão da equipe e validação do orientador.

## 3. Funções de dados

| Candidato | Tipo | Requisitos / justificativa | Premissa |
|---|---|---|---|
| Usuário/conta | ALI | Cadastro, autenticação e identificação básica (RF-001, RF-002, RF-003; RN-001). | Um grupo lógico de conta e perfil básico. Confirmar se credenciais e perfil formam um único grupo. |
| Conversa individual | ALI | Conversa entre exatamente dois participantes (RF-004; RN-003). | Um grupo lógico de conversa, participantes e metadados. Confirmar se participantes são grupo independente. |
| Mensagem | ALI | Conteúdo, autoria, conversa, referência temporal e estado (RF-005 a RF-010; RN-004, RN-006, RN-007). | Um grupo lógico de mensagens; estados tratados como atributos, não ALI separado. |
| Arquivo externo mantido por outro sistema | AIE | Nenhum arquivo lógico externo ou integração é especificado. | AIE = 0 nesta versão; reavaliar se houver diretório, serviço de identidade ou fonte externa. |

Para a estimativa inicial, cada ALI foi considerado de baixa complexidade (7 PF): 3 × 7 = 21 PF. A complexidade real depende de RET e DET, ainda não detalhados.

## 4. Funções transacionais

| Função candidata | Tipo | Requisito | Racional / limite |
|---|---|---|---|
| Cadastrar usuário | EE | RF-001 | Entrada de dados que cria/atualiza o ALI Usuário. |
| Autenticar (login) | EE | RF-002 | Entrada de credenciais que dispara validação e resposta. |
| Encerrar sessão (logout) | EE | RF-012 | Ação iniciada pelo usuário; confirmar se é processo elementar independente. |
| Iniciar/acessar conversa | EE | RF-004 | Ação para iniciar ou acessar conversa individual; confirmar se são um ou dois processos. |
| Enviar mensagem de texto | EE | RF-005, RF-007, RF-011 | Entrada de conteúdo que registra mensagem e pode retornar confirmação/falha. |
| Consultar perfil/identificar participante | CE | RF-003 | Consulta de informações básicas, sem transformação significativa assumida. |
| Consultar histórico da conversa | CE | RF-008, RF-009 | Consulta de mensagens autorizadas em ordem cronológica. |

**SE:** nenhuma saída externa foi contada separadamente. A apresentação de mensagens e estados foi tratada como parte das consultas e/ou resposta dos processos de envio. Se houver relatório, notificação com processamento próprio ou saída derivada independente, reavaliar como SE.

Recebimento da mensagem, atualização de estado e aviso de falha não foram contados separadamente sem evidência de processos elementares independentes.

## 5. Memória de cálculo e valor

Pesos de referência usados apenas como hipótese inicial: ALI 7, AIE 5, EE 3, SE 4 e CE 3 PF, todos em baixa complexidade.

| Tipo | Quantidade | Peso | Subtotal |
|---|---:|---:|---:|
| ALI | 3 | 7 | 21 PF |
| AIE | 0 | 5 | 0 PF |
| EE | 5 | 3 | 15 PF |
| SE | 0 | 4 | 0 PF |
| CE | 2 | 3 | 6 PF |
| **Total** | **10** | — | **42 PF** |

**42 PF × R$ 488,00 = R$ 20.496,00** (vinte mil, quatrocentos e noventa e seis reais).

Valor de referência condicionado à validação da contagem. Não estão incluídos impostos, despesas, licenças, hospedagem, manutenção, suporte ou serviços não descritos. A contagem é de pontos de função não ajustados; não foi aplicado fator de ajuste técnico/ambiental.

## 6. Premissas adotadas

1. A fronteira considerada é a aplicação UatiAppy descrita no README e no escopo do MVP.
2. Somente o MVP documentado foi considerado; funcionalidades futuras não entram na contagem.
3. Usuário, conversa e mensagem foram tratados como três ALIs candidatos, sem subdivisões lógicas confirmadas.
4. Não foi identificado AIE porque não há integração/arquivo externo descrito.
5. Cadastro, login, logout, iniciar/acessar conversa e enviar mensagem foram considerados cinco EE candidatos.
6. Consulta de perfil/identificação e consulta de histórico foram consideradas duas CE candidatas.
7. Recebimento, atualização de estado e aviso de falha não foram contados isoladamente sem evidência de processos elementares independentes.
8. Todas as funções foram provisoriamente classificadas como baixa complexidade; falta inventário de DET, RET e FTR.
9. RNFs não foram somados diretamente ao tamanho funcional.

## 7. Dúvidas para esclarecimento antes da contagem final

1. **Cadastro:** quais campos são obrigatórios? E-mail, telefone, nome de usuário ou matrícula são identificadores únicos? Perfil e credenciais são um único grupo lógico?
2. **Busca de participantes:** como o usuário localiza outro participante? Existe pesquisa/listagem? Quais campos são exibidos? A busca e a consulta de perfil são processos distintos?
3. **Conversa:** a conversa é criada explicitamente ou nasce no primeiro envio? Existe lista/inbox de conversas?
4. **Mensagens:** quais campos são armazenados? Há paginação, filtros, busca ou recuperação incremental?
5. **Estados:** quais estados existem e quais eventos mudam cada estado? Existe confirmação de leitura? A especificação atual informa que leitura não está definida.
6. **Tempo real/integrações:** o recebimento em tempo real será interno ou via serviço externo? Há provedor de autenticação, API ou outra fonte de dados?
7. **Sessão:** o logout revoga token/sessão no servidor? Há expiração ou múltiplas sessões?
8. **Saídas:** há relatórios, consolidações ou informações derivadas além da exibição de perfil, conversa, mensagens e estados?
9. **RNFs:** quais navegadores/dispositivos serão suportados? Quais metas de desempenho, carga, disponibilidade e segurança serão verificadas?
10. **Fronteira:** a contagem inclui somente o aplicativo ou também painel administrativo, backend, serviço de autenticação e componentes externos?

## 8. RNFs e itens fora do MVP

O escopo lista usabilidade, desempenho, segurança, privacidade/autorização, confiabilidade, compatibilidade, integridade, manutenibilidade, consistência de estado e proteção de credenciais. Esses atributos afetam arquitetura, esforço, testes e riscos, mas não geram PF diretamente nesta memória de cálculo. A própria especificação registra pendências de metas mensuráveis, ambientes/versões-alvo e definição dos estados de mensagem.

Itens explicitamente fora do MVP:
- Conversas em grupo.
- Envio de imagens, vídeos, documentos e outros anexos.
- Edição ou exclusão de mensagens.
- Notificações push.
- Confirmação de leitura, enquanto não aprovada.
- Recursos avançados de perfil, presença ou personalização.

Esses itens somente devem ser incluídos mediante aprovação de mudança de escopo e nova análise de impacto.

## 9. Riscos e recomendações

**Riscos:** especificação ainda em revisão; ausência de DET/RET/FTR; indefinição dos estados e do fluxo em tempo real; possível existência de busca/listagem de usuários, inbox ou integrações que alterem a contagem.

**Próximos passos recomendados:**
1. Validar as dúvidas com PO, TechLead e orientador.
2. Definir a fronteira da aplicação e os grupos lógicos de dados.
3. Elaborar inventário de DET, RET e FTR por função.
4. Revisar tipos e complexidade conforme o método de contagem adotado.
5. Atualizar a estimativa e obter aceite antes de fechar proposta comercial.

## 10. Conclusão

Com base exclusivamente na documentação consultada, o inventário preliminar aponta 3 ALIs, nenhum AIE identificado, 5 EEs, nenhuma SE independente e 2 CEs. Sob a hipótese de baixa complexidade, o resultado é **42 PF não ajustados**, com valor de referência de **R$ 20.496,00** ao preço de R$ 488,00 por PF.

O resultado é uma estimativa inicial para discussão e planejamento, não uma medição definitiva nem compromisso comercial, até que as pendências e a complexidade funcional sejam validadas.

---
**Documento preparado em 18/11/2026 | Cliente: Fábio Cerqueira | Projeto: UatiAppy**
