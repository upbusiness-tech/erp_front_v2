## Purpose

Dashboard de estatísticas de produtos consumindo o endpoint real `ProductDashboard` com filtro por período, exibindo métricas de vendas, faturamento, rankings e alertas de estoque.

## ADDED Requirements

### Requirement: Product dashboard data fetched from backend
The system SHALL fetch product dashboard data from `GET /product/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=N` using TanStack Query, with the period controlled by PeriodSelector.

#### Scenario: Dashboard loads with current month data on initial render
- **WHEN** user opens the Stock statistics tab
- **THEN** a request is sent to `/product/dashboard` with `from` set to the first day of the current month, `to` set to today, and `limit` set to 10, and the response populates all dashboard cards and rankings

#### Scenario: Dashboard refetches on period change
- **WHEN** user changes the period from "Este Mês" to "Esta Semana"
- **THEN** a new request is sent with updated `from` and `to` parameters, and the UI updates with the new data

### Requirement: Summary cards from backend response
The system SHALL render four summary cards using the `summary` field from `ProductDashboardResponse`: Unidades Vendidas, Faturamento, Produto Destaque, and Produtos Sem Giro.

#### Scenario: Summary cards display backend data
- **WHEN** the backend returns `summary.unitsSold = 150, summary.revenue = 12500.50, summary.featuredProduct = { productName: "Camiseta", quantitySold: 45 }, summary.zeroStockProducts = 3`
- **THEN** the cards show "150" for unidades vendidas, "R$ 12.500,50" for faturamento, "Camiseta — 45 un. vendidas" for destaque, and "3" for sem giro

#### Scenario: Featured product card handles null
- **WHEN** the backend returns `summary.featuredProduct = null`
- **THEN** the Produto Destaque card shows "—" for the product name and "0 un. vendidas"

### Requirement: Rankings from backend response
The system SHALL render four ranking panels using the `rankings` field from `ProductDashboardResponse`: Mais Vendidos, Maior Faturamento, Maior Giro, and Reposição Urgente.

#### Scenario: Rankings display top 5 items from backend
- **WHEN** the backend returns `rankings.bestSelling` with 5 entries
- **THEN** the "Mais Vendidos" card shows all 5 products ranked 1-5 with quantity sold and progress bars relative to the top seller

#### Scenario: Ranking card handles empty list
- **WHEN** the backend returns `rankings.highestTurnover` as an empty array
- **THEN** the "Maior Giro" card shows "Sem dados" empty state

#### Scenario: Reposição urgente shows stock levels
- **WHEN** the backend returns `rankings.urgentRestock` with products having `stockQuantity <= 5`
- **THEN** each product shows its name and current stock quantity, with a red progress bar

### Requirement: Loading and error states
The system SHALL display appropriate loading indicators while the dashboard data is being fetched, and error feedback if the request fails.

#### Scenario: Loading state during fetch
- **WHEN** the dashboard data is being fetched from the backend
- **THEN** summary cards and ranking panels show skeleton loading placeholders (Ant Design Skeleton)

#### Scenario: Error state on request failure
- **WHEN** the `/product/dashboard` request fails with a network or server error
- **THEN** the system displays an error message via Ant Design message notification and the dashboard shows the last successfully loaded data (stale cache) if available, or an error empty state if there is no cache

### Requirement: Period selector integration
The system SHALL render the PeriodSelector at the top of the StockStatsOverview and bind its output to the dashboard query parameters.

#### Scenario: PeriodSelector controls dashboard query
- **WHEN** user interacts with PeriodSelector in the Stock statistics tab
- **THEN** the `from` and `to` parameters of the product dashboard query update accordingly and the data refetches
