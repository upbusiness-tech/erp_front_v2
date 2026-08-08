## Why

A tela `CommonSale` tem um botão "Ver vendas recentes" (em `CashFlowStatus`) e um `RecentSalesModal` que hoje é apenas um rascunho com `dataSource={[]}` e botões com `onClick` comentados. Não há como consultar vendas já realizadas nem reabrir o recibo de uma venda anterior. Queremos transformar isso em uma tabela funcional de vendas recentes para visualização rápida, com reabertura do recibo.

## What Changes

- Reescrever `RecentSalesModal` para carregar vendas reais via `SaleService` com `useGenericTableFetch`/`useGetAllWithParams`, usando `GenericTable` como base de renderização.
- Adicionar colunas adaptadas do "Histórico de Vendas Detalhado" (`Financas.tsx`): código, data, tipo, cliente, itens, pagamentos e total.
- Adicionar ação "Ver" que reabre o `SaleReceiptModal` com o recibo da venda selecionada (via `createSaleReceipt`), sem nova chamada à API.
- Conectar o botão "Ver vendas recentes" em `CashFlowStatus` ao estado do modal.
- Remover o uso de tipos legados (`Sale` de `@/uperp/types`) no modal, adotando `SaleModel`.

## Capabilities

### New Capabilities

- `recent-sales`: Visualização rápida de vendas recentes em tabela paginada a partir da API, com colunas de histórico e reabertura do recibo de uma venda.

### Modified Capabilities

## Impact

- `src/application-components/RecentSalesModal/RecentSalesModal.tsx` — reescrita completa.
- `src/uperp/pages/AuthenticatedPages/CommonSale/useCommonSale.controller.tsx` — estado `recentOpen`, fetch de vendas recentes e reutilização do `receiptSale` para reabrir o recibo.
- `src/uperp/pages/AuthenticatedPages/CommonSale/CommonSale.tsx` — renderização do modal e fiação do estado.
- `src/application-components/CashFlowStatus/CashFlowStatus.tsx` — botão "Ver vendas recentes" conectado.
- `src/uperp/common/saleReceipt.ts` — reuso do `createSaleReceipt` para reabrir recibo (sem alteração).
- Dependência: payload do endpoint `sale` (NestCRUD) deve incluir as relações usadas pelo recibo (items, product, productEspecification, internCustomerPrice, internCustomer, payments) via `join`.
