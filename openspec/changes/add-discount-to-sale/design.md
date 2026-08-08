## Context

O fluxo de venda atual (ver proposal.md — Why) calcula totais sem descontos. `CartSaleItem` e `ISaleItemField` (types.ts) não possuem campo de desconto; `SaleItemModel` expõe um `discountPrice` que será removido do backend. O resumo da comanda (`OrderContent`) exibe apenas "Subtotal" e "Total", ambos derivados de `calculateTotalCartItems` (`saleFormulas.ts`). `remaining`, `change`, `isOverpaid` e `changePreview` derivam desses totais. O recibo (`saleReceipt.ts`) recalcula tudo do zero a partir do `SaleModel` retornado pela API — incl. o fluxo de reabertura de venda recente.

O backend foi ajustado para receber e devolver `DiscountInfo` (mesma interface) nos itens como `discountInfo` e na venda como `discount`. A coluna `discountPrice` não será mais usada.

## Goals / Non-Goals

**Goals:**
- Desconto por item (modal) e desconto da venda (inline) nos modos R$ e %, com motivo opcional, compondo com preço especial.
- Breakdown de 5 linhas no resumo: Subtotal, Preços especiais, Desconto dos itens, Desconto da venda, Total.
- Estado compartilhado e persistência no payload; consistência entre comanda, pagamento e recibo.
- Validação de limites com clamp para evitar totais negativos.

**Non-Goals:**
- Controle de habilitação dos descontos via configurações (adiado).
- Motivo de desconto obrigatório.
- Rescale do desconto R$ ao mudar a quantidade (mantém fixo, por decisão de produto).

## Decisions

### D1. Interface `DiscountInfo` única em `CommonSale/types.ts`
Definir `DiscountInfo { value?, percent?, reason? }` em `src/uperp/pages/AuthenticatedPages/CommonSale/types.ts` e usá-la como `discountInfo?` em `CartSaleItem`/`ISaleItemField` e como `discount?` em `ICreateSaleForm`/`SaleModel` (desconto da venda). O backend retorna a mesma forma nos itens e na venda.
*Alternativa:* duplicar nos models — rejeitada; um tipo só evita divergência no payload.

### D2. Valor R$ como fonte da verdade; percentual informativo
A matemática usa apenas `discountInfo.value`. `percent` é armazenado e exibido, e recalculado quando o modal é aberto (base = preço efetivo da unidade × quantidade atual). Ao alterar a quantidade, `value` não muda (decisão de produto).
*Alternativa:* recomputar `value` a partir do `percent` — rejeitada; muda o desconto em troca do item quando a quantidade varia.

### D3. Fórmulas de breakdown em `saleFormulas.ts`
Novas funções puras:
- `calculateGrossSubtotal(items)` = Σ preço normal × qty
- `calculateSpecialPriceSavings(items)` = Σ (preço normal − preço especial) × qty p/ itens com preço especial
- `calculateItemDiscountsTotal(items)` = Σ `discountInfo.value ?? 0`
- `calculateItemsTotal(items)` = bruto − economia − descontos de item (clamp ≥ 0)
- `calculateTotalCartItems(items, saleDiscount?)` = total dos itens − desconto da venda (clamp ≥ 0), opcional p/ backward-compat

`calculateRemainingSaleOnOrderContent` e `calculateChangeSaleOnOrderContent` passam a receber o total líquido já calculado (em vez de recalcular), eliminando a duplicação.

### D4. Estado do desconto da venda no `useSalesStore`
Adicionar `saleDiscount?: DiscountInfo` e `setSaleDiscount` ao store, limpos no `resetSale`. Mantém o desconto vivo entre o passo de itens e o de pagamento, junto dos demais dados da venda. No payload, o estado é mapeado para o campo `discount`.
*Alternativa:* estado local no controller — rejeitada; seria perdido/duplicado entre as duas etapas.

### D5. Modal de desconto do item
Novo componente `ItemDiscountModal` seguindo o padrão do `ApplySpecialPriceModal` (estado no `OrderContent`, item alvo em `useState`). Campos "%" e "R$" sincronizados ("último editado vence"), input de motivo, prévia do total da linha e validação `value ≤ preço efetivo × qty`. O `OrderProductItem` recebe props `onOpenDiscount`/`onRemoveDiscount` e exibe uma tag "-R$ X" quando há desconto.

### D6. Desconto da venda inline e limpo
Linha clicável "Desconto da venda" no resumo que expande um editor inline (mesmo padrão do bloco expansível de preço especial no item): modo R$/% + valor + motivo. Resumo exibe as 5 linhas; as linhas de desconto mostram valor quando aplicado.

### D7. Validação com clamp duplo
Limites conferidos na UI (max do `InputNumber` / bloqueio no apply) e reforçados nas fórmulas com `Math.max(x, 0)`, garantindo que nenhum estado corrompido gere total negativo.

### D8. Recibo com nova semântica
`createSaleReceipt` passa a calcular `subtotal` como soma bruta a preço normal; `specialPriceTotal` passa a significar a **economia** (soma das diferenças), alinhado ao breakdown; novos campos `itemDiscountTotal`, `saleDiscountValue` e `total`. `change` passa a usar `total`. Os componentes de cupom (success e recent-sales reopen) renderizam as 5 linhas. A reabertura depende do backend devolver `discountInfo` (itens) e `discount` (venda) — já contratado.

## Risks / Trade-offs

- [Recibo reaberto sem `discountInfo`/`discount` do backend] → Contrato já acordado: GET da venda deve devolver `discountInfo` (itens) e `discount` (venda); validar na implementação.
- [Mudança de semântica de `specialPriceTotal` pode quebrar outros consumidores] → Buscar usos do campo e atualizar junto; campo renomeado/ampliado no `SaleReceiptModel`.
- [Desconto % dessincronizado após remover preço especial ou mudar quantidade] → `value` é a fonte; `percent` recalculado ao reabrir o modal; comportamento documentado.
- [Payload de venda existente sem `discountInfo`/`discount`] → Campo opcional (`?`), `?? 0` nas fórmulas; sem quebra retroativa.

## Open Questions

- Nenhum. O desconto da venda usa o campo `discount: DiscountInfo` (itens usam `discountInfo`), conforme confirmado pelo produto no contrato do backend.
