import { TransactionOrigin, TransactionType } from "@/enums/cashFlow.enum";
import { DefaultIdModel } from "./base.model";
import { PaymentMethod } from "@/enums/payment.enum";

export interface CashFlowTransactionModel extends DefaultIdModel {
  amount: number;
  type: TransactionType;
  flowMethodType: PaymentMethod;
  origin: TransactionOrigin;
  saleId: number;
  // sale?: SaleEntity;
  createdByUserUid: string;
  cashFlowId: number;
}

export interface CashFlowTransactionStatsModel {
  amount: number;
  origin: string;
  quantity: number;
  cashFlowId: number;
}
