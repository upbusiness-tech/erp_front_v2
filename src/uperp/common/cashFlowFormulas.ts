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
  initialBalance: number,
) => {
  return initialBalance + replamentAmount - sangriaAmount;
};
