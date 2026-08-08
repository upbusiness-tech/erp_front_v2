## 1. Tipos e modelo de dados

- [x] 1.1 Adicionar interface `DiscountInfo { value?; percent?; reason? }` em `CommonSale/types.ts`
- [x] 1.2 Adicionar `discountInfo?: DiscountInfo` em `ISaleItemField` e em `CartSaleItem`
- [x] 1.3 Adicionar `discount?: DiscountInfo` em `ICreateSaleForm` (desconto da venda)
- [x] 1.4 Adicionar `discountInfo?: DiscountInfo` em `SaleItemModel` e `discount?: DiscountInfo` em `SaleModel` (`sale.model.ts`); remover uso de `discountPrice`

## 2. Fórmulas de cálculo

- [x] 2.1 Criar `calculateGrossSubtotal(items)` — soma bruta a preço normal
- [x] 2.2 Criar `calculateSpecialPriceSavings(items)` — economia dos itens com preço especial
- [x] 2.3 Criar `calculateItemDiscountsTotal(items)` — soma dos `discountInfo.value` dos itens
- [x] 2.4 Refatorar `calculateTotalCartItems` para `calculateItemsTotal` (bruto − economia − descontos de item, clamp ≥ 0) e aceitar `saleDiscount?` no total final
- [x] 2.5 Ajustar `calculateRemainingSaleOnOrderContent` e `calculateChangeSaleOnOrderContent` para receber o total líquido já calculado

## 3. Estado do desconto da venda

- [x] 3.1 Adicionar `saleDiscount` e `setSaleDiscount` ao `useSalesStore`
- [x] 3.2 Limpar `saleDiscount` no `resetSale`

## 4. Modal de desconto do item

- [x] 4.1 Criar `ItemDiscountModal` (produto, tam/cor, entradas % e R$ sincronizadas, motivo opcional, prévia do total da linha)
- [x] 4.2 Implementar sincronização "último editado vence" entre % e R$ (base = preço efetivo × qty)
- [x] 4.3 Validar `value ≤ preço efetivo × qty`; bloquear e manter desconto anterior quando exceder
- [x] 4.4 Adicionar handler no `useOrderContentController` para aplicar/atualizar/limpar `discountInfo` do item
- [x] 4.5 Integrar o modal no `OrderContent` seguindo o padrão do `ApplySpecialPriceModal`

## 5. Desconto no item da comanda (OrderProductItem)

- [x] 5.1 Adicionar props de abertura do desconto e remoção em `OrderProductItem`
- [x] 5.2 Exibir trigger do desconto (botão % ao lado do total da linha)
- [x] 5.3 Exibir tag "-R$ X" quando o item tiver desconto aplicado (com ação de editar/remover)

## 6. Desconto da venda inline (OrderContent)

- [x] 6.1 Adicionar linha clicável "Desconto da venda" que expande editor inline (%/R$ + motivo)
- [x] 6.2 Ligar o editor ao `saleDiscount` do store com validação `value ≤ total dos itens`
- [x] 6.3 Montar resumo em 5 linhas: Subtotal, Preços especiais, Desconto dos itens, Desconto da venda, Total (clamp ≥ 0)
- [x] 6.4 Propagar o total líquido para `paid`/`remaining`/`change`/`isOverpaid`/`changePreview` e para o disabled de "Finalizar Venda"

## 7. Persistência no payload

- [x] 7.1 Incluir `discountInfo` dos itens no mapa de `ISaleItemField` em `handleSubmitSale` (`useCommonSale.controller.tsx`)
- [x] 7.2 Incluir `discount` da venda (mapeado do `saleDiscount` do store) no `ICreateSaleForm` em `handleSubmitSale`

## 8. Recibo

- [x] 8.1 Atualizar `saleReceipt.ts`: `subtotal` bruto a preço normal; `specialPriceTotal` = economia; novos campos `itemDiscountTotal`, `saleDiscountValue`, `total`; `lineTotal` com desconto do item; `change` sobre `total`
- [x] 8.2 Atualizar `SaleReceiptModel` com os novos campos
- [x] 8.3 Renderizar as 5 linhas de desconto no cupom de sucesso
- [x] 8.4 Renderizar as 5 linhas de desconto no cupom reaberto (recent-sales)

## 9. Verificação

- [x] 9.1 Rodar lint/typecheck do projeto
- [ ] 9.2 Validar fluxo manual: desconto de item, desconto da venda, preço especial + desconto, limites, troco e recibo
