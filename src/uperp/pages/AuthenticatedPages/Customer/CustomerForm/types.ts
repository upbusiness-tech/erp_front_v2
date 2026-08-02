import { InternCustomerType } from "@/enums/internCustomer.enum";
import { ProductEspecificationModel } from "@/model/productEspecification.model";

export interface ICustomerCreateForm {
  name: string;
  type: InternCustomerType;
  address: string;
  phoneNumber: string;
  companyUid: string;
  internCustomerPrices: ICustomerSpecialPrice[];
}

export interface ICustomerSpecialPrice {
  id?: number;
  specialPrice: number;
  productEspecificationId: number;
}

export interface ILinkedVariation {
  specialPriceId?: number;
  productId: number;
  productName: string;
  productEspecificationId: number;
  variation: ProductEspecificationModel;
  specialPrice: number;
}
