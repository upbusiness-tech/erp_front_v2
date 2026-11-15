import dayjs from "dayjs";
import { PaymentMethod } from "@/enums/payment.enum";
import type {
  SalesStatisticsResponse,
  StockOverviewResponse,
  StockRankingItem,
} from "@/types/statistics";
import { EOrder } from "@/types/statistics";
import { SALE_PAYMENT_LABEL } from "@/uperp/common/formulas/saleReceipt";
import { fmtBrl } from "@/uperp/common/util/sale.util";
import { BaseService } from "./common/base.service";

// ---- Backend response shapes (mirror do módulo statistic do backend) ----

export interface StatisticStockInOut {
  entries: number;
  exits: number;
  movedUnits: number;
  balance: number;
  entriesSubtitleValue: number;
  exitsSubtitleValue: number;
}

export interface StatisticStockRanking {
  name: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  unitOfMeasure: string;
  quantitySold: number;
  salesAmount: number;
  salesProfitAmount: number;
}

export interface StatisticStockHistoryResponse {
  inOut: StatisticStockInOut;
  topSelling: StatisticStockRanking[];
  untopSelling: StatisticStockRanking[];
  revenueProducts: StatisticStockRanking[];
}

export interface StatisticStockVariation {
  name: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  unitOfMeasure: string;
  stockQuantity: number;
}

export interface StatisticStockHealthResponse {
  alerts: {
    underMinStock: number;
    overMaxStock: number;
    soldOutTotal: number;
    noSupplierInformed: number;
  };
  categoryDistribution: {
    id: number;
    name: string;
    amountCategory: number;
    stockQuantity: number;
  }[];
  highestStock: { name: string; stockQuantity: number; unitOfMeasure: string }[];
  highestStockVariations: StatisticStockVariation[];
}

export interface StatisticSaleHistoryResponse {
  overview: {
    salesTotal: number;
    grossRevenue: number;
    profitRevenue: number;
    averageTicket: number;
  };
  paymentDistribution: { type: PaymentMethod; amountPaid: number }[];
  timeline: {
    saleDate: string;
    saleQuantity: number;
    grossRevenue: number;
    profitRevenue: number;
  }[];
  weekdayRevenue: { weekday: number; label: string; revenue: number }[];
}

// ---- Services (paths base usados com `useGetAllWithParams`) ----

export const statisticStockHistoryService = new BaseService("statistic/stock/history-overview");
export const statisticStockHealthService = new BaseService("statistic/stock/health-overview");
export const statisticSaleHistoryService = new BaseService("statistic/sale/history-overview");

// ---- Mappers (backend → frontend) ----

const PAYMENT_METHODS = [
  PaymentMethod.PIX,
  PaymentMethod.CREDIT,
  PaymentMethod.DEBIT,
  PaymentMethod.CASH,
];

function toSecondaryLabel(parts: {
  size?: string | null;
  color?: string | null;
  brand?: string | null;
}): string | undefined {
  const labels = [parts.size, parts.color, parts.brand].filter(Boolean);
  return labels.length > 0 ? labels.join(" · ") : undefined;
}

function formatTimelineLabel(saleDate: string): string {
  const date = dayjs(saleDate);
  const hasTime = date.hour() !== 0 || date.minute() !== 0;
  return hasTime ? date.format("HH:mm") : date.format("DD/MM");
}

export function mapStockOverview(
  history: StatisticStockHistoryResponse,
  health: StatisticStockHealthResponse,
): StockOverviewResponse {
  const { inOut } = history;
  const { alerts } = health;

  return {
    flow: {
      entries: inOut.entries,
      exits: inOut.exits,
      movedUnits: inOut.movedUnits,
      balance: inOut.balance,
      entriesSubtitle: `${fmtBrl.format(inOut.entriesSubtitleValue)} em compras de reposição`,
      exitsSubtitle: `${fmtBrl.format(inOut.exitsSubtitleValue)} em vendas`,
      movedUnitsSubtitle: "Entradas + Saídas",
      balanceSubtitle: inOut.balance < 0 ? "Saiu mais do que entrou" : "Entrou mais do que saiu",
    },
    health: {
      outOfStock: alerts.soldOutTotal,
      belowMinimum: alerts.underMinStock,
      aboveMaximum: alerts.overMaxStock,
      withoutSupplier: alerts.noSupplierInformed,
    },
    categoryDistribution: health.categoryDistribution.map((category) => ({
      id: String(category.id),
      name: category.name,
      quantity: category.stockQuantity,
    })),
    highestStock: health.highestStock.map((row, index) => ({
      id: `stock-${index}`,
      name: row.name,
      quantity: row.stockQuantity,
      unit: row.unitOfMeasure,
    })),
    highestStockVariations: health.highestStockVariations.map((row, index) => ({
      id: `variation-${index}`,
      name: [row.name, row.size, row.color, row.brand].join(" "),
      quantity: row.stockQuantity,
      unit: row.unitOfMeasure,
      secondaryLabel: toSecondaryLabel(row),
    })),
  };
}

export function mapStockSalesRanking(
  history: StatisticStockHistoryResponse,
  order: EOrder = EOrder.DESC,
): StockRankingItem[] {
  const list = order === EOrder.ASC ? history.untopSelling : history.topSelling;

  return list.map((row, index) => ({
    id: `${order}-${index}`,
    name: [row.name, row.size, row.color, row.brand].join(" "),
    quantity: row.quantitySold,
    unit: row.unitOfMeasure,
    secondaryLabel: toSecondaryLabel(row),
  }));
}

export function mapSalesStatistics(data: StatisticSaleHistoryResponse): SalesStatisticsResponse {
  const amounts = new Map(data.paymentDistribution.map((p) => [p.type, p.amountPaid]));
  const paidTotal = data.paymentDistribution.reduce((sum, p) => sum + p.amountPaid, 0);

  return {
    summary: {
      grossRevenue: data.overview.grossRevenue,
      profitRevenue: data.overview.profitRevenue,
      salesCount: data.overview.salesTotal,
      averageTicket: data.overview.averageTicket,
    },
    timeline: data.timeline.map((point) => ({
      date: point.saleDate,
      label: formatTimelineLabel(point.saleDate),
      revenue: point.grossRevenue,
      grossProfit: point.profitRevenue,
    })),
    paymentBreakdown: PAYMENT_METHODS.map((method) => {
      const amount = amounts.get(method) ?? 0;
      return {
        method,
        label: SALE_PAYMENT_LABEL[method],
        amount,
        percentage: paidTotal > 0 ? (amount / paidTotal) * 100 : 0,
      };
    }),
    weekdayRevenue: data.weekdayRevenue,
  };
}
