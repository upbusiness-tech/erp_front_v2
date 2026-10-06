import { PaymentMethod } from "@/enums/payment.enum";
import { SaleType } from "@/enums/sale.enum";
import { InternCustomerSpecialPriceModel } from "@/model/internCustomerPrice.model";
import { ProductModel } from "@/model/product.model";
import { ProductEspecificationModel } from "@/model/productEspecification.model";

export interface DiscountInfo {
  value?: number;
  percent?: number;
  reason?: string;
}

export interface ICreateSaleForm {
  type: SaleType;
  cashFlowId: number;
  items: ISaleItemField[];
  payments: IPaymentMethodField[];
  internCustomerId?: number;
  discount?: DiscountInfo;
  services?: ISaleServiceForm[];
}

export interface ISaleServiceForm {
  description: string;
  onwerEmployee: string;
  amount: number;
}

export interface ISaleItemField {
  note?: string;
  quantitySold: number;
  unitSold: number;
  unitOfMeasure: string;
  isEspecialPrice: boolean;
  internCustomerPriceId?: number;
  productId: number;
  productEspecificationId: number;
  discountInfo?: DiscountInfo;
}

export type CartSaleItem = ISaleItemField & {
  id: number;
  product: ProductModel;
  productEspecification: ProductEspecificationModel;
  internCustomerPrice?: InternCustomerSpecialPriceModel;
};

export interface IPaymentMethodField {
  type: PaymentMethod;
  amount: number;
}

export type PaymentItem = IPaymentMethodField & {
  id: number;
};
