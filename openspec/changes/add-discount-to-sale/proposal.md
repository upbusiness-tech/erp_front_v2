## Why

Vendas hoje não permitem aplicar descontos: nem por item nem no total da venda. Sem isso, o operador não consegue dar um desconto pontual (quebra, acordo, erro de preço) sem adulterar o preço do produto ou fechar uma venda com valor incorreto.

## What Changes

- Adiciona a interface `DiscountInfo { value?, percent?, reason? }` aos itens da comanda (`CartSaleItem`/`ISaleItemField`) como `discountInfo`, e ao payload de criação da venda (`ICreateSaleForm`) e ao `SaleModel` retornado pela API como `discount` (campo de desconto da venda).
- Adiciona estado de desconto da venda no `useSalesStore`, resetado junto com a venda.
- Permite aplicar desconto por item via modal (valor R$ ou porcentagem, com motivo opcional), inclusive em itens com preço especial aplicado (descontos compõem).
- Permite aplicar desconto na venda inteira inline no `OrderContent`, com os mesmos modos (R$/%).
- Recalcula o breakdown de totais da comanda em 5 linhas: Subtotal (soma bruta a preço normal), Preços especiais (economia), Desconto dos itens, Desconto da venda e Total.
- Propaga o desconto da venda para `remaining`, `change`, `isOverpaid` e `changePreview` (etapa de pagamento).
- Atualiza `saleReceipt.ts` e o cupom (success + reopen) para exibir os descontos, evitando inconsistência entre comanda e recibo.
- Valida limites: desconto do item não pode exceder o total da linha; desconto da venda não pode exceder o total antes dele.
- **BREAKING (backend):** a coluna `discountPrice` do `SaleItemModel` é removida — o front passa a enviar `discountInfo` nos itens e `discount` na venda, e o GET da venda deve retornar esses campos para o recibo reaberto.

## Capabilities

### New Capabilities

- `sale/discount`: regras de desconto por item e por venda na comanda — estrutura de dados, cálculo dos totais com desconto, validação de limites e exibição no recibo.

### Modified Capabilities

<!-- nenhuma — não há specs existentes -->

## Impact

- `src/uperp/pages/AuthenticatedPages/CommonSale/types.ts` — nova interface `DiscountInfo`, campos em `ISaleItemField`/`ICreateSaleForm`.
- `src/uperp/common/saleFormulas.ts` — novas funções de cálculo do breakdown com descontos.
- `src/stores/sales.store.ts` — estado `saleDiscount`.
- `src/application-components/OrderContent/OrderContent.tsx` + `useOrderContent.controller.ts` — UI inline do desconto da venda, linhas de resumo, validações, propagação para pagamento.
- `src/application-components/OrderProductItem/OrderProductItem.tsx` + `useOrderProductItem.controller.ts` — trigger/tag de desconto por item.
- `src/application-components/` — novo modal de desconto do item.
- `src/uperp/common/saleReceipt.ts` — breakdown no recibo.
- Componentes de cupom (success + recent-sales reopen).
- Backend: contrato de venda passa a receber/devolver `discountInfo` (itens) e `discount` (venda); coluna `discountPrice` removida.
