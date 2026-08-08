## Purpose

Regras de desconto na venda da comanda: aplicação de desconto por item e no total da venda, cálculo dos totais com desconto, validação de limites e consistência no recibo.

## ADDED Requirements

### Requirement: Estrutura de desconto em itens e venda
O sistema SHALL oferecer uma estrutura `DiscountInfo` com campos opcionais `value`, `percent` e `reason`. Esta estrutura SHALL estar disponível em cada item da comanda como `discountInfo`, e no desconto da venda como `discount`. Ambas SHALL ser persistidas no payload de criação da venda e retornadas pelo backend nos itens e na venda (para recibo reaberto).

#### Scenario: Item da comanda possui desconto
- **WHEN** um item é adicionado à comanda sem desconto
- **THEN** o item não possui `discountInfo` ou possui `discountInfo` sem `value` e sem `percent`

#### Scenario: Desconto persiste na criação da venda
- **WHEN** uma venda com itens descontados e desconto da venda é finalizada
- **THEN** o payload enviado ao backend contém `discountInfo` em cada item descontado e `discount` no nível da venda

#### Scenario: Recibo reaberto preserva descontos
- **WHEN** uma venda reaberta é carregada a partir do backend
- **THEN** os `discountInfo` dos itens e o `discount` da venda são retornados e usados para recalcular o recibo

### Requirement: Aplicar desconto em item da comanda
O sistema SHALL permitir abrir um modal de desconto para qualquer item da comanda, com entradas de valor em R$ e em porcentagem sincronizadas ("último campo editado vence"), campo opcional de motivo e prévia do total da linha com o desconto aplicado. O desconto em valor R$ é a fonte da verdade para o cálculo.

#### Scenario: Abrir modal de desconto do item
- **WHEN** o operador aciona o controle de desconto de um item da comanda
- **THEN** um modal é aberto exibindo o produto, os modos de entrada (R$ e %), o motivo (opcional) e a prévia do total da linha

#### Scenario: Sincronizar porcentagem com valor
- **WHEN** o operador informa uma porcentagem de desconto
- **THEN** o valor R$ é recalculado como `porcentagem × (preço efetivo da unidade × quantidade) / 100` e ambos são armazenados no `discountInfo`

#### Scenario: Sincronizar valor com porcentagem
- **WHEN** o operador informa um valor R$ de desconto
- **THEN** a porcentagem é recalculada a partir do valor e ambos são armazenados no `discountInfo`

#### Scenario: Remover desconto do item
- **WHEN** o operador remove o desconto de um item que já tinha desconto
- **THEN** o `discountInfo` do item é limpo e o total da linha volta a ser calculado sem desconto

#### Scenario: Alterar quantidade mantém desconto
- **WHEN** a quantidade de um item com desconto é alterada
- **THEN** o valor R$ do desconto permanece o mesmo, sem recálculo pelo percentual

### Requirement: Desconto de item compõe com preço especial
Um item com preço especial aplicado SHALL poder receber desconto manual por cima; os dois descontos compõem, com o preço especial como base do item e o desconto manual subtraído do total da linha.

#### Scenario: Desconto em item com preço especial
- **WHEN** um item possui preço especial aplicado e recebe desconto manual
- **THEN** o total da linha considera o preço especial como base e desconta o valor manual

#### Scenario: Remover preço especial com desconto aplicado
- **WHEN** o preço especial de um item descontado é removido
- **THEN** o desconto manual permanece aplicado e a porcentagem armazenada é considerada dessincronizada, sendo recalculada se o modal for aberto novamente

### Requirement: Aplicar desconto na venda
O sistema SHALL permitir aplicar um desconto no total da venda inline na comanda, com os modos R$ e porcentagem e motivo opcional. O desconto da venda é subtraído do total dos itens.

#### Scenario: Aplicar desconto da venda
- **WHEN** o operador informa um desconto na venda
- **THEN** o total da venda passa a ser `total dos itens − desconto da venda`, com o desconto exibido em linha própria no resumo

#### Scenario: Modo porcentagem no desconto da venda
- **WHEN** o operador informa o desconto da venda em porcentagem
- **THEN** o valor R$ é recalculado sobre o total dos itens e ambos são armazenados no `discount` da venda

### Requirement: Breakdown de totais da comanda
O sistema SHALL exibir o resumo da comanda em cinco linhas: Subtotal (soma bruta a preço normal), Preços especiais (economia gerada por preços especiais), Desconto dos itens, Desconto da venda e Total. O Total SHALL ser `Subtotal − Preços especiais − Desconto dos itens − Desconto da venda`.

#### Scenario: Comanda sem descontos nem preço especial
- **WHEN** a comanda não possui preços especiais nem descontos
- **THEN** Subtotal e Total são iguais e as linhas de preços especiais e descontos exibem R$ 0,00

#### Scenario: Comanda com preço especial e descontos
- **WHEN** a comanda possui itens com preço especial e descontos de item e de venda
- **THEN** o Total é exibido como Subtotal menos a economia de preços especiais, menos os descontos de item e de venda

### Requirement: Etapa de pagamento reflete descontos
A etapa de pagamento SHALL usar o total líquido (após descontos de itens e da venda) para calcular pago, restante, troco, excedente e o preview de troco, e para habilitar a finalização da venda.

#### Scenario: Restante considera desconto da venda
- **WHEN** uma venda possui desconto da venda e ainda há valor a pagar
- **THEN** o restante é calculado sobre o total líquido com o desconto da venda aplicado

#### Scenario: Troco considera desconto da venda
- **WHEN** o pagamento excede o total líquido com desconto da venda
- **THEN** o troco é calculado sobre esse total líquido

### Requirement: Limites do desconto
O sistema SHALL impedir que o desconto de um item exceda o total da linha (preço efetivo da unidade × quantidade) e que o desconto da venda exceda o total dos itens antes do desconto da venda. Nenhum total SHALL ficar negativo.

#### Scenario: Desconto de item acima do total da linha
- **WHEN** o operador informa um desconto de item maior que o total da linha
- **THEN** o sistema bloqueia a aplicação e mantém o desconto anterior

#### Scenario: Desconto da venda acima do total dos itens
- **WHEN** o operador informa um desconto da venda maior que o total dos itens
- **THEN** o sistema bloqueia a aplicação e mantém o desconto anterior

### Requirement: Recibo reflete descontos
O recibo da venda (sucesso e reaberto) SHALL exibir as linhas de Subtotal, Preços especiais, Desconto dos itens, Desconto da venda e Total, com o troco calculado sobre o Total líquido.

#### Scenario: Recibo com descontos
- **WHEN** uma venda com descontos é finalizada e o recibo é exibido
- **THEN** o recibo mostra as linhas de desconto e o Total líquido, e o troco considera esse Total

#### Scenario: Recibo sem descontos
- **WHEN** uma venda sem descontos é finalizada
- **THEN** o recibo não exibe valores de desconto e Subtotal é igual ao Total
