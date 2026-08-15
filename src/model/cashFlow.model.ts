import { PaymentMethod } from "@/uperp/types";
import { DefaultIdModel } from "./base.model";
import { UserModel } from "./user.model";

export type InformedValue = {
  method: PaymentMethod;
  value: number;
};

export interface CashFlowModel extends DefaultIdModel {
  code: string;
  isClosed: boolean;
  initialBalance: number;
  closingBalance: number;
  closedAt: string;
  informedValues: InformedValue[];
  openedByUserUid: string;
  openedByUser: UserModel;
  closedByUserUid: string;
  closedByUser: UserModel;
}
