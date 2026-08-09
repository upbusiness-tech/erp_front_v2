## Purpose

Controle compartilhado de seleção de período temporal para todas as telas de dashboard e estatísticas do ERP, com presets rápidos e intervalo personalizado limitado.

## ADDED Requirements

### Requirement: Period presets for quick selection
The system SHALL provide pre-defined period presets that the user can select with a single click: Hoje, Ontem, Esta Semana, Este Mês, and Personalizado.

#### Scenario: User selects "Hoje" preset
- **WHEN** user clicks "Hoje" on the period selector
- **THEN** the period is set to the current date (from = today, to = today) and all dashboard data refreshes for that date

#### Scenario: User selects "Esta Semana" preset
- **WHEN** user clicks "Esta Semana" on the period selector
- **THEN** the period is set from Monday of the current week to today, inclusive

#### Scenario: User selects "Este Mês" preset
- **WHEN** user clicks "Este Mês" on the period selector
- **THEN** the period is set from the first day of the current month to today, inclusive

#### Scenario: User selects "Ontem" preset
- **WHEN** user clicks "Ontem" on the period selector
- **THEN** the period is set to the previous day (from = yesterday, to = yesterday)

### Requirement: Default period on page entry
The system SHALL default to "Este Mês" preset when any dashboard or statistics page is first rendered.

#### Scenario: User navigates to Finanças statistics tab for the first time
- **WHEN** user opens the Estatísticas tab in Finanças
- **THEN** the period selector shows "Este Mês" as the active preset and all metrics reflect the current month-to-date

#### Scenario: User navigates to Stock statistics tab for the first time
- **WHEN** user opens the Estatísticas tab in Stock
- **THEN** the period selector shows "Este Mês" as the active preset and all metrics reflect the current month-to-date

### Requirement: Custom date range with 60-day limit
The system SHALL allow users to select a custom date range via a RangePicker, constrained to a maximum span of 60 days and with no future dates selectable.

#### Scenario: User selects a custom range within 60 days
- **WHEN** user switches to "Personalizado" and selects a date range of 45 days within the past
- **THEN** the dashboard data filters to that range

#### Scenario: User attempts to select a range exceeding 60 days
- **WHEN** user selects a start date more than 60 days before the end date
- **THEN** the system prevents the selection and shows a warning message indicating the 60-day limit

#### Scenario: User attempts to select a future date
- **WHEN** user opens the RangePicker in "Personalizado" mode
- **THEN** future dates are disabled and cannot be selected

### Requirement: Period state shared via reusable hook
The system SHALL provide a `useDashboardPeriod` hook that exposes the current period preset, computed `{ from, to }` date strings in `YYYY-MM-DD` format, and callbacks for changing preset and custom range.

#### Scenario: Dashboard component consumes period state
- **WHEN** a dashboard component calls `useDashboardPeriod({ defaultPreset: 'this_month' })`
- **THEN** it receives `{ preset, period: { from, to }, setPreset, setCustomRange }` with the period initialized to the current month

#### Scenario: Changing preset triggers recomputation
- **WHEN** `setPreset('this_week')` is called
- **THEN** the `period.from` and `period.to` values update to reflect the current week boundaries

### Requirement: Period selector UI component
The system SHALL provide a `PeriodSelector` React component that renders preset buttons using Ant Design Segmented, and conditionally shows a RangePicker when "Personalizado" is selected.

#### Scenario: PeriodSelector renders with all presets
- **WHEN** PeriodSelector is rendered with its default props
- **THEN** it displays a Segmented control with labels "Hoje", "Ontem", "Semana", "Mês", "Per." and "Este Mês" is the active segment

#### Scenario: PeriodSelector shows RangePicker for custom mode
- **WHEN** user clicks "Per." on the Segmented control
- **THEN** the Segmented is replaced by a RangePicker with a 60-day constraint and no future dates

#### Scenario: PeriodSelector in custom mode returns to preset on date selection
- **WHEN** user selects a date range in the RangePicker
- **THEN** the `onChange` callback fires with `{ preset: 'custom', from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }`
