## Purpose

Permite consultar rapidamente as vendas mais recentes registradas, em uma tabela paginada, e reabrir o recibo de uma venda anterior para revisão e impressão.

## ADDED Requirements

### Requirement: Listar vendas recentes
O sistema SHALL exibir as vendas recentes em uma tabela paginada carregada da API de vendas, ordenadas da mais recente para a mais antiga. Cada linha SHALL apresentar código, data, tipo, cliente, quantidade de itens, formas de pagamento e total da venda.

#### Scenario: Abrir modal de vendas recentes
- **WHEN** o usuário está na tela de venda com caixa aberto e clica em "Ver vendas recentes"
- **THEN** o sistema abre o modal com a tabela de vendas recentes
- **AND** a tabela lista as vendas carregadas da API em ordem decrescente de data

#### Scenario: Nenhuma venda registrada
- **WHEN** não há vendas recentes para exibir
- **THEN** o modal exibe um estado vazio informando que nenhuma venda foi registrada

#### Scenario: Paginação de vendas
- **WHEN** o número de vendas recentes excede o tamanho da página
- **THEN** o sistema exibe controles de paginação que permitem navegar e carregar as demais vendas

### Requirement: Reabrir recibo de venda
O sistema SHALL permitir reabrir o modal de recibo de qualquer venda listada, sem abrir uma nova venda nem alterar o estado do carrinho em andamento.

#### Scenario: Reabrir recibo de venda anterior
- **WHEN** o usuário clica em "Ver" na linha de uma venda listada
- **THEN** o sistema abre o modal de recibo com os detalhes da venda selecionada
- **AND** o estado atual do carrinho/venda em andamento não é alterado

#### Scenario: Impressão do recibo reaberto
- **WHEN** o recibo de uma venda anterior está aberto e o usuário clica em "Imprimir comprovante"
- **THEN** o sistema imprime o comprovante daquela venda

### Requirement: Carregamento a partir da API
O sistema SHALL carregar as vendas recentes exclusivamente a partir da API de vendas, sem depender de dados mock ou do estado local do carrinho.

#### Scenario: Carregamento assíncrono
- **WHEN** o modal de vendas recentes é aberto e os dados ainda não foram retornados
- **THEN** o sistema exibe um indicador de carregamento na tabela

#### Scenario: Falha na consulta
- **WHEN** a consulta de vendas recentes falha
- **THEN** o sistema mantém o modal utilizável sem quebrar a tela de venda
