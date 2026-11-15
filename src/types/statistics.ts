import type { PaymentMethod } from "@/enums/payment.enum";
import type { SaleModel } from "@/model/sale.model";
import type { PaginatedResponse } from "@/types/crud.types";

export enum EOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export interface QueryStatisticPeriodDto {
  from: string;
  to: string;
  limit?: number;
  order?: EOrder;
}

export interface StockFlowSummary {
  entries: number;
  exits: number;
  movedUnits: number;
  balance: number;
  /** Subtítulos descritivos fornecidos pelo backend para cada indicador. */
  entriesSubtitle: string;
  exitsSubtitle: string;
  movedUnitsSubtitle: string;
  balanceSubtitle: string;
}

export interface StockHealthSummary {
  outOfStock: number;
  belowMinimum: number;
  aboveMaximum: number;
  withoutSupplier: number;
}

export interface StockRankingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  secondaryLabel?: string;
}

export interface StockCategorySlice {
  id: string;
  name: string;
  quantity: number;
}

export interface StockOverviewResponse {
  flow: StockFlowSummary;
  health: StockHealthSummary;
  categoryDistribution: StockCategorySlice[];
  highestStock: StockRankingItem[];
  highestStockVariations: StockRankingItem[];
}

export interface SalesTimelinePoint {
  date: string;
  label: string;
  revenue: number;
  grossProfit: number;
}

export interface SalesPaymentBreakdownItem {
  method: PaymentMethod;
  label: string;
  amount: number;
  percentage: number;
}

export interface SalesWeekdayRevenueItem {
  weekday: number;
  label: string;
  revenue: number;
}

export interface SalesSummary {
  grossRevenue: number;
  profitRevenue: number;
  salesCount: number;
  averageTicket: number;
}

export interface SalesStatisticsResponse {
  summary: SalesSummary;
  timeline: SalesTimelinePoint[];
  paymentBreakdown: SalesPaymentBreakdownItem[];
  weekdayRevenue: SalesWeekdayRevenueItem[];
}

export interface SalesPageQuery {
  from: string;
  to: string;
  page: number;
  limit: number;
  code?: string;
  customerName?: string;
  status?: string[];
  paymentMethod?: PaymentMethod[];
}

export type SalesPageResponse = PaginatedResponse<SaleModel>;
