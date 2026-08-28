import { PaymentMethod } from "@/enums/payment.enum";
import { SaleStatus, SaleType } from "@/enums/sale.enum";
import { DefaultIdModel } from "./base.model";
import { InternCustomerSpecialPriceModel } from "./internCustomerPrice.model";
import { ProductModel } from "./product.model";
import { ProductEspecificationModel } from "./productEspecification.model";
import { UserModel } from "./user.model";
import { InternCustomerModel } from "./internCustomer.model";
import { DiscountInfo } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";

export type ApiMoney = string | number | null;

export interface SaleItemModel extends DefaultIdModel {
  note: string;
  quantitySold: number;
  unitSold: number;
  isEspecialPrice: boolean;
  discountInfo?: DiscountInfo;
  internCustomerPriceId?: number | null;
  internCustomerPrice?: InternCustomerSpecialPriceModel | null;
  productId: number;
  product: ProductModel;
  productEspecificationId: number;
  productEspecification: ProductEspecificationModel;
}

export interface SalePaymentModel extends DefaultIdModel {
  type: PaymentMethod;
  amount: ApiMoney;
}

export type SaleUserModel = Pick<UserModel, "uid" | "username">;

export interface SaleModel extends DefaultIdModel {
  code: string;
  type: SaleType;
  status: SaleStatus;
  canceledAt?: string | null;
  discount?: DiscountInfo;
  internCustomerId?: number | null;
  internCustomer?: InternCustomerModel | null;
  soldByUserUid?: string | null;
  soldByUser?: SaleUserModel | null;
  cashFlowId: number;
  companyUid: string;
  canceledByUserUid: string;
  items: SaleItemModel[];
  payments: SalePaymentModel[];
  services?: unknown[];
}

export interface SaleReceiptItemModel {
  id: number;
  name: string;
  quantity: number;
  originalUnitPrice: number;
  unitPrice: number;
  lineTotal: number;
  hasSpecialPrice: boolean;
  size?: string;
  color?: string;
  brand?: string;
  unitOfMeasure?: string;
  unitSold?: number;
  note?: string;
  discountValue?: number;
}

export interface SaleReceiptPaymentModel {
  id: number;
  type: PaymentMethod;
  amount: number;
}

export interface SaleReceiptModel {
  sale: SaleModel;
  code: string;
  date: string;
  customerName: string;
  items: SaleReceiptItemModel[];
  payments: SaleReceiptPaymentModel[];
  subtotal: number;
  specialPriceTotal: number;
  itemDiscountTotal: number;
  saleDiscountValue: number;
  total: number;
  paid: number;
  change: number;
}
