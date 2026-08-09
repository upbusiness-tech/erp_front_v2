## Purpose

Dashboard de estatísticas financeiras com métricas de receita, vendas, ticket médio, lucro estimado, breakdown por forma de pagamento e gráfico de vendas diárias, todos filtrados por período selecionado.

## ADDED Requirements

### Requirement: Financial summary metrics filtered by period
The system SHALL display summary cards for the selected period: Receita, Vendas (count), Ticket Médio, and Lucro Estimado, computed from sales within the date range.

#### Scenario: Summary cards show period-filtered data
- **WHEN** user selects "Este Mês" and there are sales in the current month
- **THEN** the Receita card shows the sum of all sale totals within the month, Vendas shows the count, Ticket Médio shows receita/count, and Lucro Estimado shows 32% of receita

#### Scenario: Summary cards show zero state when no sales in period
- **WHEN** user selects a period with no sales
- **THEN** all summary cards display R$ 0,00 or 0 as appropriate, with no error state

### Requirement: Payment method breakdown by period
The system SHALL display the total amount received per payment method (PIX, Débito, Crédito, Dinheiro) for sales within the selected period.

#### Scenario: Payment breakdown reflects period selection
- **WHEN** user selects "Esta Semana" and there are sales with mixed payment methods
- **THEN** each payment method badge shows the sum of all payment values for that method within the week

#### Scenario: Payment breakdown shows zero for unused methods
- **WHEN** no sales in the selected period used PIX
- **THEN** the PIX badge displays R$ 0.00

### Requirement: Daily sales bar chart for the period
The system SHALL render a bar chart showing revenue per day within the selected period, using actual sale data grouped by date.

#### Scenario: Bar chart renders with period data
- **WHEN** user selects "Esta Semana" and there are sales on 3 of the 7 days
- **THEN** the chart displays 7 bars (one per day of the week), with bars only for days that have sales, using real revenue values

#### Scenario: Bar chart handles empty period
- **WHEN** user selects "Hoje" and there are no sales today
- **THEN** the chart area shows an Empty state with message "Nenhuma venda neste período"

### Requirement: Top products ranking by period
The system SHALL display a ranked list of the top 5 products by quantity sold within the selected period.

#### Scenario: Top products reflects period filter
- **WHEN** user selects "Este Mês" and Product A was sold 20 times and Product B 12 times
- **THEN** the ranking shows Product A in position 1 with 20 un. and Product B in position 2 with 12 un., each with a percentage progress bar relative to the top seller

#### Scenario: Top products shows empty when no sales
- **WHEN** user selects a period with zero sales
- **THEN** the top products card shows "Sem dados" empty state

### Requirement: Accumulated metrics cards
The system SHALL display cards for Receita Acumulada (total revenue all-time), Total de Vendas (all-time count), and Clientes Atendidos (unique customers all-time).

#### Scenario: Accumulated metrics are always global
- **WHEN** user changes the period preset
- **THEN** the accumulated metrics cards (Receita acumulada, Total de vendas, Clientes atendidos) do NOT change — they always reflect all-time data

### Requirement: Period selector integration on all Finanças tabs
The system SHALL render the PeriodSelector on the Estatísticas, Histórico de Vendas, and Histórico de Caixas tabs, sharing the same period state across all three.

#### Scenario: Changing period on Estatísticas carries to Histórico de Vendas
- **WHEN** user selects "Esta Semana" on the Estatísticas tab
- **THEN** switching to the Histórico de Vendas tab shows sales filtered for the same week period

#### Scenario: SalesHistory table filters by period
- **WHEN** user is on Histórico de Vendas with "Hoje" selected
- **THEN** the sales table only shows sales from today, and the "Vendas filtradas" and "Total filtrado" cards reflect that

#### Scenario: CashHistory filters by period
- **WHEN** user is on Histórico de Caixas with "Este Mês" selected
- **THEN** only closed cash sessions that were closed within the current month are shown, and the totals reflect that period
