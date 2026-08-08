## 1. Helpers e props base

- [x] 1.1 Adicionar `calculateSaleSubtotal(sale)` em `src/uperp/common/saleReceipt.ts` (soma das linhas com preço praticado) e reutilizá-lo em `createSaleReceipt`, sem alterar o retorno atual.
- [x] 1.2 Adicionar prop opcional `variant?: "success" | "view"` em `SaleReceiptModal` (default `"success"`): em `"view"`, título neutro "Venda {code}", sem ícone de sucesso e footer com "Fechar" em vez de "Nova venda".
- [x] 1.3 Adicionar prop opcional `locale?: TableProps<T>["locale"]` em `GenericTable`, repassado ao `Table`, sem alterar o comportamento padrão.

## 2. Estado e fiação no controller

- [x] 2.1 Adicionar em `useCommonSaleController` o estado `recentOpen`/`setRecentOpen` e a listagem `useGenericTableFetch<SaleModel>` com `saleService`, `sort: { field: "createdAt", order: "DESC" }`, `join` das relações do recibo e filtro por `cashFlowId` do caixa aberto.
- [x] 2.2 Expor as colunas da tabela de recentes e o handler `handleViewRecentSale(sale)` que fecha o modal e reabre o recibo com `createSaleReceipt(sale)` em `variant: "view"`.
- [x] 2.3 Conectar `CashFlowStatus`: receber prop opcional `onShowRecentSales?: () => void` e chamar o callback no botão "Ver vendas recentes".

## 3. Modal de vendas recentes

- [x] 3.1 Reescrever `RecentSalesModal` para usar `GenericTable` com paginação, colunas adaptadas (código, data, tipo, cliente, itens, pagamentos, total) e estado vazio "Nenhuma venda registrada".
- [x] 3.2 Implementar a ação "Ver" na linha que fecha o modal de recentes e reabre o `SaleReceiptModal` da venda.
- [x] 3.3 Renderizar `RecentSalesModal` em `CommonSale.tsx` ao lado do `SaleReceiptModal`, removendo o comentário placeholder.

## 4. Verificação

- [ ] 4.1 Validar com a API real que a listagem retorna as relações (items, product, productEspecification, internCustomerPrice, internCustomer, payments), paginação e ordenação decrescente por data.
- [ ] 4.2 Validar que reabrir o recibo não altera o carrinho em andamento e que a impressão do recibo reaberto funciona.
- [x] 4.3 Executar lint e build do projeto e corrigir problemas de tipagem, formatação ou empacotamento.
