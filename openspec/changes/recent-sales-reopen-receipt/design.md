## Context

Ver proposal.md (Why). A tela `CommonSale` já renderiza `CashFlowStatus` (com botão "Ver vendas recentes" de `onClick` comentado) e um `SaleReceiptModal` funcional baseado em `SaleReceiptModel`, construído por `createSaleReceipt(sale)`. O `RecentSalesModal` atual é um stub com `dataSource={[]}` e colunas de um tipo legado (`Sale` de `@/uperp/types`). A listagem real de vendas está disponível via `SaleService.getAll` (NestCRUD) consumida por `useGenericTableFetch`/`useGetAllWithParams`, e a renderização padronizada é `GenericTable`.

## Goals / Non-Goals

**Goals:**
- Transformar `RecentSalesModal` em uma tabela paginada real alimentada pela API de vendas.
- Reabrir o `SaleReceiptModal` de uma venda listada sem nova chamada à API e sem alterar o carrinho em andamento.
- Reaproveitar `GenericTable` e o padrão `useGenericTableFetch` já usados na listagem de produtos de `CommonSale`.

**Non-Goals:**
- Fazer `getById` ao clicar em "Ver" (decisão do usuário: o payload da listagem é a fonte).
- Implementar busca, filtros ou exportação no modal de recentes (isso fica no histórico de Finanças).
- Alterar o endpoint/DTO de vendas no backend.
- Reimpressão fiscal (NFC-e, SAT etc.) — apenas o comprovante já existente.

## Decisions

### Carregamento via useGenericTableFetch com joins
A listagem usa `useGenericTableFetch<SaleModel>` com o `saleService`, `sort: { field: "createdAt", order: "DESC" }` e `join` das relações necessárias para montar o recibo sem segunda chamada:

- `items`, `items.product`, `items.productEspecification`, `items.internCustomerPrice`, `internCustomer`, `payments`.

O paginador do `GenericTable` (default 8 por página) navega com `handlePageChange`/`handlePageSizeChange`. Após uma venda nova, `invalidateQueries()` (já chamado em `handleSubmitSale`) limpa o cache de `saleService`, então a lista de recentes reflete a nova venda no próximo fetch.

Alternativa considerada: listar sem joins e buscar `getById` no clique — descartada por decisão do usuário.

### Estado do modal no controller
`recentOpen` passa a viver em `useCommonSaleController` e é exposto junto de `setRecentOpen`. `CashFlowStatus` recebe um prop opcional `onShowRecentSales?: () => void`; quando presente, o botão "Ver vendas recentes" chama o callback (mantém o componente reutilizável e só mostra a ação quando o fluxo CommonSale fornece o modal).

Alternativa considerada: estado em `sales.store` — rejeitada, pois é estado de UI local e o recibo já é gerenciado no controller.

### Reabertura do recibo sem nova requisição
O clique em "Ver" chama `setRecentOpen(false)` e `setReceiptSale(createSaleReceipt(sale))`, reutilizando o mesmo estado `receiptSale` do fluxo de venda concluída. `createSaleReceipt` já normaliza cliente, itens, preços, pagamentos, subtotal e troco a partir do `SaleModel`.

Para não exibir "Venda realizada com sucesso" ao revisar uma venda antiga, `SaleReceiptModal` ganha uma prop opcional `variant?: "success" | "view"` (default `"success"`). Em `"view"`: título neutro ("Venda {code}"), sem ícone de sucesso, e o footer substitui "Nova venda" por "Fechar". O fluxo atual de conclusão não muda.

### Colunas adaptadas do histórico de vendas
A coluna "Total" é derivada (não existe no `SaleModel`): soma das linhas = `subtotal`, consistente com o recibo. Para evitar duplicar a matemática, `saleReceipt.ts` expõe um helper `calculateSaleSubtotal(sale)` usado tanto por `createSaleReceipt` quanto pela coluna. Demais colunas:

- Código → `sale.code`; Data → `sale.createdAt` formatada `pt-BR`.
- Tipo → Tag com `SaleType` (`BALCAO` → Balcão, `SERVICO` → Serviço, `PDV` → PDV).
- Cliente → `sale.internCustomer?.name` ou "—".
- Itens → `sale.items.length`.
- Pagamentos → Tags de `SALE_PAYMENT_LABEL[payment.type]`.
- Ações → botão "Ver" (abre o recibo).

### Estado vazio customizado
O `GenericTable` não repassa `locale`. Para o modal exibir "Nenhuma venda registrada", `GenericTable` ganha um prop opcional `locale?: TableProps<T>["locale"]` repassado ao `Table` (mudança mínima e genérica, sem quebrar usos existentes).

### Escopo da consulta
Como o botão só aparece com caixa aberto, a consulta filtra por `cashFlowId = currentCashFlow.id`, listando as vendas do caixa em andamento da mais recente para a mais antiga.

## Risks / Trade-offs

- [Payload da listagem pode vir com relações parciais e o recibo renderizar campos vazios] → definir os `join` necessários e validar com uma venda real durante a implementação.
- [Coluna Total derivada no frontend pode divergir de regras do backend] → usar preços/flags persistidos no payload (mesma regra de `createSaleReceipt`), não valores do catálogo.
- [`useGenericTableFetch` busca ao montar o componente, mesmo com o modal fechado] → o cache de 30s e o `invalidateQueries` pós-venda mantêm os dados frescos; custo aceitável de uma consulta.
- [Adicionar prop opcional em `GenericTable` e `SaleReceiptModal` pode afetar outros consumidores] → props opcionais com defaults preservam o comportamento atual.

## Migration Plan

1. Adicionar `calculateSaleSubtotal` e os props opcionais (`variant` em `SaleReceiptModal`, `locale` em `GenericTable`).
2. Adicionar `recentOpen` + listagem no controller e conectar `CashFlowStatus` via prop.
3. Reescrever `RecentSalesModal` com `GenericTable` e ação de reabertura.
4. Renderizar o modal em `CommonSale` ao lado do `SaleReceiptModal`.
5. Rollback: remover o prop em `CashFlowStatus` e a renderização do modal; os componentes base permanecem compatíveis.

## Open Questions

- Confirmar se o `join` das relações de `sale` é suportado pelo endpoint atual e se os campos retornados cobrem o recibo (a ser validado na implementação, sem alterar as especificações).
