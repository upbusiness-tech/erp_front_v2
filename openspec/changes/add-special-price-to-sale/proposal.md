## Why

Na tela de vendas (CommonSale), quando um cliente interno é selecionado, o vendedor não tem visibilidade de quais itens no carrinho possuem preço especial cadastrado para aquele cliente. Isso resulta em oportunidades perdidas de oferecer preços diferenciados e dificulta a aplicação manual de preços especiais durante a venda.

## What Changes

- **Indicador de preço especial no carrinho**: Quando um cliente é selecionado, cada item do carrinho verifica se existe preço especial cadastrado para aquela especificação específica do produto. Se existir, exibe um indicador visual (tag + mini-menu expansível) com o preço especial e um botão "Aplicar".

- **Modal de aplicação de preço especial**: Novo componente modal que mostra a comparação entre preço normal e preço especial, incluindo economia por unidade e total, com botão de confirmação para aplicar o preço especial ao item.

- **Reset automático ao desselecionar customer**: Quando o cliente é deselecionado, todos os itens que tinham preço especial aplicado voltam ao preço normal, as tags "Especial" somem, e o total é recalculado.

- **Modal de detalhes do cliente**: Adicionar ícone de olho ao lado do nome do cliente selecionado que abre um modal mostrando dados gerais e lista de preços especiais cadastrados (reutilizando lógica existente do CustomerViewModal, movido para application-components/).

- **ProductEspecificationModal**: Passar o customer selecionado como prop para que, ao adicionar um item ao carrinho, o sistema já saiba se existe preço especial disponível para aquela especificação.

## Capabilities

### New Capabilities

- `sale-special-price`: Lógica de identificação, exibição e aplicação de preços especiais durante o fluxo de venda, incluindo o mapemento entre itens do carrinho e preços cadastrados no cliente.

### Modified Capabilities

<!-- Nenhuma capability existente tem seus requisitos alterados nesta mudança -->

## Impact

- **Componentes afetados**:
  - `useOrderContent.controller.ts` — nova lógica de match de preço especial + reset
  - `OrderContent.tsx` — renderização do indicador de preço especial
  - `OrderProductItem.tsx` — novo prop para preço especial + callback de aplicação
  - `CommonSale.tsx` — passar customer selecionado + ícone de olho
  - `useCommonSale.controller.tsx` — integração com CustomerDetailsModal

- **Novos componentes**:
  - `ApplySpecialPriceModal.tsx` — modal de confirmação de aplicação
  - `CustomerDetailsModal.tsx` — movido de `Customer/CustomerView/components/` para `application-components/`

- **Services/Stores afetados**:
  - Nenhum novo service necessário — dados já vêm no payload do customer
  - Sales store — sem alterações na estrutura, apenas uso dos campos existentes

- **Payload backend**: Sem alterações — o DTO `CreateSaleItemDto` já suporta `isEspecialPrice` e `internCustomerPriceId`
