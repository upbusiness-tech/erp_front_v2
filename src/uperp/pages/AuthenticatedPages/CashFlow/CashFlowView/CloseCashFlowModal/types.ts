import { PaymentMethod } from "../../../../../../enums/payment.enum";

export interface ICloseCashFlowForm {
  closingBalance: number;
  informedValues: InformedValue[];
}

export type InformedValue = {
  method: PaymentMethod;
  value: number;
};

export type CashBreakdown = {
  initialBalance: number;
  sales: number;
  replacement: number;
  sagrias: number;
};

export type CashFlowCloseStats = {
  PIX: number;
  CREDITO: number;
  DEBITO: number;
  DINHEIRO: number;
};
