import { InternCustomerType } from "@/enums/internCustomer.enum";
import { DefaultIdModel } from "./base.model";
import { InternCustomerSpecialPriceModel } from "./internCustomerPrice.model";
export interface InternCustomerModel extends DefaultIdModel {
  name: string;
  type: InternCustomerType;
  address: string;
  phoneNumber: string;
  internCustomerPrices: InternCustomerSpecialPriceModel[];
}
