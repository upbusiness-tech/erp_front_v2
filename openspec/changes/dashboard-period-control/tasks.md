## 1. Tipos e infraestrutura compartilhada

- [x] 1.1 Criar `src/types/dashboard.ts` com tipos `PeriodPreset`, `DashboardPeriod`, `DateRangeString`
- [x] 1.2 Criar `src/hooks/useDashboardPeriod.ts` com hook que gerencia preset, custom range e computa `{ from, to }` em YYYY-MM-DD
- [x] 1.3 Criar `src/application-components/PeriodSelector/PeriodSelector.tsx` usando Ant Design `Segmented` + `RangePicker` condicional com `disabledDate` limitando a 60 dias e sem datas futuras
- [x] 1.4 Validar que o RangePicker no modo \"Personalizado\" bloqueia ranges > 60 dias com `message.warning`

## 2. StockStatsOverview — endpoint real ProductDashboard

- [x] 2.1 Criar `src/types/productDashboard.ts` com tipos `ProductDashboardQueryDto`, `ProductDashboardResponse`, `ProductDashboardEntry` baseados nos DTOs fornecidos pelo backend
- [x] 2.2 Criar `src/services/productDashboard.service.ts` com método `getDashboard(from, to, limit)` usando `api.get`
- [x] 2.3 Criar `src/hooks/useProductDashboard.ts` com `useQuery` do TanStack Query, queryKey `['product-dashboard', from, to]`, staleTime 30s
- [x] 2.4 Refatorar `StockStatsOverview.tsx`: remover `useStore()` para dados de venda, integrar `useProductDashboard` + `PeriodSelector`
- [x] 2.5 Renderizar 4 summary cards a partir de `response.summary` (unitsSold, revenue, featuredProduct, zeroStockProducts)
- [x] 2.6 Renderizar 4 rankings a partir de `response.rankings` (bestSelling, highestRevenue, highestTurnover, urgentRestock)
- [x] 2.7 Adicionar loading state com Ant Design `Skeleton` nos cards durante primeiro fetch; manter dados anteriores com opacidade reduzida em refetch
- [x] 2.8 Adicionar error state: `message.error` no onError + manter cache anterior se disponível
- [x] 2.9 Remover fallback `Math.random()` / `hashCode` — o componente agora depende exclusivamente do endpoint

## 3. Finanças — Tab Estatísticas com filtro local

- [x] 3.1 Extrair lógica da tab Estatísticas para hook `useFinanceDashboard` que recebe `period: { from, to }` e computa:
- [x] 3.2 Integrar `PeriodSelector` no topo da tab Estatísticas, usando `useDashboardPeriod({ defaultPreset: 'this_month' })`
- [x] 3.3 Atualizar os 4 StatCards para usar dados do hook (remover hardcode "HOJE")
- [x] 3.4 Atualizar PaymentBadges para refletir período selecionado (remover label "geral")
- [x] 3.5 Substituir gráfico de barras manual (`weekData` mockado) por gráfico com `recharts` (`BarChart`/`Bar`) usando série diária real do período
- [x] 3.6 Atualizar top produtos para usar dados reais filtrados pelo período
- [x] 3.7 Manter cards de métricas acumuladas (Receita acumulada, Total de vendas, Clientes atendidos) como all-time, sem filtro de período
- [x] 3.8 Adicionar empty state ("Nenhuma venda neste período") quando período não tem dados

## 4. PeriodSelector nas demais tabs de Finanças

- [x] 4.1 Mover `useDashboardPeriod` para o componente `Financas`, acima dos `Tabs`, compartilhando o estado entre Estatísticas, Histórico de Vendas e Histórico de Caixas
- [x] 4.2 Renderizar `PeriodSelector` acima do `Tabs` component, visível nas tabs afetadas (exceto Relatórios)
- [x] 4.3 Atualizar `SalesHistory` para receber `period` como prop e filtrar `sales[]` pelo intervalo, removendo o RangePicker independente atual (linhas 392-398)
- [x] 4.4 Atualizar `CashHistory` para receber `period` como prop e filtrar `cashHistory[]` pelo `closedAt` dentro do intervalo
- [x] 4.5 Garantir que trocar de período em qualquer tab reflete nas outras duas (estado compartilhado)

## 5. Integração e polish

- [x] 5.1 Testar fluxo completo: entrar em Finanças → ver "Este Mês" selecionado → trocar para "Hoje" → ver dados atualizados → trocar para Histórico de Vendas → ver mesmo período → trocar para "Personalizado" → selecionar range → ver validação de 60 dias
- [x] 5.2 Testar fluxo Stock: entrar em Estoque → ver "Este Mês" → dados carregam do endpoint → trocar período → ver loading/refetch → verificar rankings atualizados
- [x] 5.3 Verificar que o período padrão "Este Mês" funciona corretamente em diferentes dias do mês (dia 1 vs dia 28)
- [x] 5.4 Verificar responsividade do `PeriodSelector` (Segmented em telas pequenas quebra? testar mobile)
- [x] 5.5 Rodar linter/typecheck e corrigir problemas
