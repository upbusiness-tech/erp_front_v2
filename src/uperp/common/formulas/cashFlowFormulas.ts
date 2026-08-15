import { CashFlowModel } from "@/model/cashFlow.model";
import {
  CashFlowTransactionModel,
  CashFlowTransactionStatsModel,
} from "@/model/cashFlowTransaction.model";

export const calculeCashFlowTransactionAmount = (
  transactions: CashFlowTransactionStatsModel[] | CashFlowTransactionModel[],
) => {
  const total = transactions.reduce((acc, value) => {
    return acc + Number(value.amount);
  }, 0);
  return total;
};

export const calculeCashFlowEstimetedAmount = (
  sangriaAmount: number,
  replamentAmount: number,
  salesAmount: number,
  initialBalance: number,
) => {
  return initialBalance + salesAmount + replamentAmount - sangriaAmount;
};

export const calculateCashFlowDiff = (
  cashFlow: CashFlowModel | undefined,
  expectedAmount: number,
) => {
  if (!cashFlow) return expectedAmount;
  let total = cashFlow.informedValues.reduce((acc, val) => {
    return acc + val.value;
  }, 0);

  total += cashFlow.closingBalance;

  return expectedAmount - total;
};
