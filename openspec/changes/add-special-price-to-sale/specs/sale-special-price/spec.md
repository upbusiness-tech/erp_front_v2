## Purpose

Permite que vendedores identifiquem e apliquem preços especiais cadastrados para clientes internos durante o fluxo de venda, melhorando a experiência do atendimento e aproveitando oportunidades de diferenciação de preço.

## ADDED Requirements

### Requirement: Identificação de preço especial disponível por item no carrinho

Quando um cliente interno é selecionado, o sistema SHALL verificar para cada item no carrinho se existe um preço especial cadastrado naquele cliente para a especificação exata do produto (productEspecificationId). Se existir, o sistema SHALL exibir um indicador visual visível sem expansão.

#### Scenario: Item com preço especial disponível

- **WHEN** um cliente interno é selecionado E um item no carrinho possui productEspecificationId que corresponde a um registro em internCustomerPrices do cliente
- **THEN** o item exibe uma tag "⭐ Preço especial disponível" visível permanentemente

#### Scenario: Item sem preço especial disponível

- **WHEN** um cliente interno é selecionado E um item no carrinho NÃO possui correspondência em internCustomerPrices
- **THEN** o item não exibe nenhum indicador de preço especial

#### Scenario: Nenhum cliente selecionado

- **WHEN** nenhum cliente interno está selecionado
- **THEN** nenhum item exibe indicadores de preço especial

### Requirement: Mini-menu expansível para aplicar preço especial

O indicador de preço especial SHALL ser expansível para revelar um botão "Aplicar preço especial" e informações sobre o preço especial disponível.

#### Scenario: Expandir mini-menu de preço especial

- **WHEN** o vendedor clica no indicador de preço especial de um item
- **THEN** um mini-menu se expande mostrando: preço especial por unidade, percentual de desconto, e botão "Aplicar"

#### Scenario: Colapsar mini-menu

- **WHEN** o vendedor clica novamente no indicador ou fora do mini-menu
- **THEN** o mini-menu se colapsa mantendo a tag visível

### Requirement: Modal de confirmação de aplicação de preço especial

Ao clicar "Aplicar preço especial", o sistema SHALL exibir um modal de confirmação mostrando a comparação entre preço normal e preço especial, incluindo economia total.

#### Scenario: Abrir modal de aplicação

- **WHEN** o vendedor clica "Aplicar preço especial" no mini-menu
- **THEN** um modal abre com: nome do produto, especificação (cor/tamanho), preço normal, preço especial, economia por unidade, quantidade, total normal, total com preço especial, economia total

#### Scenario: Confirmar aplicação

- **WHEN** o vendedor clica "Aplicar Preço Especial" no modal
- **THEN** o item é atualizado com isEspecialPrice=true, internCustomerPriceId e internCustomerPrice preenchidos, o total da venda é recalculado com o preço especial, e o modal é fechado

#### Scenario: Cancelar aplicação

- **WHEN** o vendedor clica "Cancelar" no modal
- **THEN** o modal é fechado sem alterar o item

### Requirement: Reset de preços especiais ao desselecionar cliente

Quando o cliente é deselecionado, o sistema SHALL reverter automaticamente todos os itens que tinham preço especial aplicado.

#### Scenario: Desselecionar cliente com itens com preço especial

- **WHEN** o vendedor deseleciona o cliente interno E existem itens no carrinho com isEspecialPrice=true
- **THEN** todos esses itens voltam a isEspecialPrice=false, internCustomerPriceId=null, internCustomerPrice=undefined, o total da venda é recalculado com preços normais, e as tags "Especial" somem

#### Scenario: Desselecionar cliente sem itens com preço especial

- **WHEN** o vendedor deseleciona o cliente interno E NENHUM item tem isEspecialPrice=true
- **THEN** nenhuma alteração é feita nos itens

### Requirement: Modal de detalhes do cliente

O sistema SHALL exibir um ícone de olho ao lado do nome do cliente selecionado que, ao ser clicado, abre um modal com os dados do cliente e sua lista de preços especiais.

#### Scenario: Abrir modal de detalhes

- **WHEN** o vendedor clica no ícone de olho ao lado do nome do cliente selecionado
- **THEN** um modal abre mostrando: aba "Dados gerais" (nome, telefone, tipo) e aba "Preços Especiais" (tabela com produto, variação, preço original, preço especial)

#### Scenario: Fechar modal de detalhes

- **WHEN** o vendedor clica "Fechar" ou fora do modal
- **THEN** o modal é fechado

### Requirement: Indicação de preço especial no ProductEspecificationModal

Quando um cliente está selecionado e o vendedor abre o modal de especificação de produto, o sistema SHALL indicar se existe preço especial disponível para aquela especificação.

#### Scenario: Produto com preço especial para o cliente

- **WHEN** um cliente está selecionado E o produto aberto no modal possui especificação com preço especial no cliente
- **THEN** o modal exibe uma indicação do preço especial disponível ao lado do preço normal

#### Scenario: Produto sem preço especial para o cliente

- **WHEN** um cliente está selecionado E o produto NÃO possui preço especial na especificação selecionada
- **THEN** o modal mostra apenas o preço normal sem indicação especial
