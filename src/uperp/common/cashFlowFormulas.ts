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
