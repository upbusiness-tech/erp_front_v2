import { PaymentMethod } from "../../../../../../enums/payment.enum";

export interface ICloseCashFlowForm {
  closingBalance: number;
  informedValues: InformedValue[];
}

export type InformedValue = {
  method: PaymentMethod;
  value: number;
};
