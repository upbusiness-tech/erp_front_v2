import { CashFlowCloseStats } from "./types";

export const formatBRL = (value?: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

export const formatSigned = (value?: number) => {
  const v = value ?? 0;
  const sign = v < 0 ? "-" : "+";
  return `${sign} ${formatBRL(Math.abs(v))}`;
};

export const calculateActualCashFromSales = (
  salesAmount: number,
  cashFlowCloseStats: CashFlowCloseStats | undefined,
) => {
  if (!cashFlowCloseStats) return salesAmount;
  return (
    salesAmount -
    Number(cashFlowCloseStats.PIX ?? 0) -
    Number(cashFlowCloseStats.CREDITO ?? 0) -
    Number(cashFlowCloseStats.DEBITO ?? 0)
  );
};
