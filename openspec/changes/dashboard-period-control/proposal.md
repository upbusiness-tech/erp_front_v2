## Why

As telas de estatísticas do ERP (Finanças e Estoque) exibem dados sem controle de período temporal: a tab de Estatísticas de Finanças está hardcoded com "HOJE" e dados mockados, e o StockStatsOverview calcula métricas sobre todas as vendas sem filtro de data. Isso impossibilita análise gerencial por período (dia, semana, mês) e torna os dashboards inúteis para tomada de decisão. O backend já possui um endpoint de product dashboard (`ProductDashboardQueryDto` → `ProductDashboardResponse`) que serve como padrão de contrato para filtragem por período.

## What Changes

- **PeriodSelector**: Novo componente compartilhado de seleção de período com presets rápidos (Hoje, Ontem, Esta Semana, Este Mês) e modo personalizado com RangePicker limitado a 60 dias. Padrão ao entrar nas telas: "Este Mês".

- **useDashboardPeriod hook**: Hook reutilizável que gerencia o estado do período selecionado, converte presets em intervalos `{ from, to }` no formato `YYYY-MM-DD` e expõe callbacks para mudança de preset e range customizado.

- **Finanças — Tab Estatísticas**: Refatoração completa para usar `PeriodSelector` + processamento dos dados de `sales[]` do store filtrados pelo período selecionado. Gráfico de vendas diárias com dados reais (não mockados), payment breakdown por período, top produtos vendidos no período. Filtragem local no frontend como passo inicial (endpoint de sale dashboard será implementado posteriormente no backend).

- **StockStatsOverview — Integração com endpoint real**: Substituir cálculos locais via `useStore()` por consumo do endpoint `ProductDashboard` via TanStack Query, com `PeriodSelector` controlando os parâmetros `from`/`to`. Componente migrado de dados mockados/context para dados reais do backend. Manter fallback local durante o loading inicial.

- **SalesHistory e CashHistory**: Adicionar `PeriodSelector` também nas tabs de Histórico de Vendas e Histórico de Caixas, substituindo o RangePicker livre atual por seleção consistente de período com presets.

- **Tipos compartilhados**: Definição de `DashboardPeriod`, `PeriodPreset`, `DateRangeString` como contratos usados por ambos os dashboards.

## Capabilities

### New Capabilities

- `dashboard-period-control`: Seleção de período com presets (Hoje, Ontem, Esta Semana, Este Mês, Personalizado) e RangePicker limitado a 60 dias, compartilhado entre todas as telas de dashboard/estatísticas do ERP. Padrão "Este Mês" ao entrar.

- `finances-dashboard`: Tab de Estatísticas de Finanças com dados filtrados por período — receita, vendas, ticket médio, lucro estimado, payment breakdown, gráfico de vendas diárias, top produtos e métricas acumuladas.

- `stock-dashboard`: Dashboard de estatísticas de produtos consumindo endpoint real `ProductDashboard` com filtro por período — unidades vendidas, faturamento, produto destaque, sem giro e rankings (mais vendidos, maior faturamento, maior giro, reposição urgente).

### Modified Capabilities

<!-- Nenhuma capability existente tem seus requisitos alterados nesta mudança — todas são novas -->

## Impact

- **Novos componentes**:
  - `src/application-components/PeriodSelector/PeriodSelector.tsx` — componente compartilhado de seleção de período
  - `src/hooks/useDashboardPeriod.ts` — hook de estado do período

- **Novos services/hooks**:
  - `src/services/productDashboard.service.ts` — service para `GET /product/dashboard?from=&to=&limit=`
  - `src/hooks/useProductDashboard.ts` — TanStack Query hook para product dashboard

- **Componentes modificados**:
  - `src/uperp/pages/Financas.tsx` — tab Estatísticas refatorada com PeriodSelector + dados filtrados; SalesHistory e CashHistory com PeriodSelector
  - `src/uperp/pages/AuthenticatedPages/Stock/StockView/components/StockStatsOverview/StockStatsOverview.tsx` — migração para endpoint real + PeriodSelector

- **Tipos compartilhados**:
  - `src/types/dashboard.ts` — `DashboardPeriod`, `PeriodPreset`, `DateRangeString`

- **Dependências existentes utilizadas**: `antd` (Segmented, RangePicker, DatePicker), `dayjs`, `@tanstack/react-query`, `axios` (via `api` config)
