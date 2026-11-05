import { PaymentMethod } from "@/enums/payment.enum";
import { SaleStatus, SaleType } from "@/enums/sale.enum";
import { DefaultIdModel } from "./base.model";
import { InternCustomerSpecialPriceModel } from "./internCustomerPrice.model";
import { ProductModel } from "./product.model";
import { ProductEspecificationModel } from "./productEspecification.model";
import { UserModel } from "./user.model";
import { InternCustomerModel } from "./internCustomer.model";
import { DiscountInfo } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";

export type ApiMoney = string | number | null;
export interface SaleItemModel extends DefaultIdModel {
  note: string;
  quantitySold: number;
  unitSold: number;
  unitOfMeasure: ProductUnitOfMeasure;
  isEspecialPrice: boolean;
  productSnapshot: ProductEspecificationModel;
  salePriceSnapshot: number;
  specialPriceSnapshot: number;
  costPriceSnapshot: number;
  discountInfo: DiscountInfo;
  amountItem: number;
  amountProfitItem: number;
  saleDiscountShare: number;
  internCustomerPriceId: number;
  internCustomerPrice: InternCustomerSpecialPriceModel | null;
  productId: number;
  product: ProductModel;
  productEspecificationId: number;
  productEspecification: ProductEspecificationModel | null;
  saleId: number;
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
  services?: SaleServiceModel[];
}

export interface SaleServiceModel extends DefaultIdModel {
  description: string;
  onwerEmployee: string;
  amount: number;
  discount: DiscountInfo;
  saleId: number;
}

export interface SaleReceiptItemModel {
  id: number;
  name: string;
  quantity: number;
  originalUnitPrice: number;
  unitPrice: number;
  lineTotal: number;
  hasSpecialPrice: boolean;
  code?: string;
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

export interface SaleReceiptServiceModel {
  id: number;
  description: string;
  onwerEmployee: string;
  amount: number;
  discountValue?: number;
}

export interface SaleReceiptModel {
  sale: SaleModel;
  code: string;
  date: string;
  customerName: string;
  items: SaleReceiptItemModel[];
  services: SaleReceiptServiceModel[];
  payments: SaleReceiptPaymentModel[];
  subtotal: number;
  specialPriceTotal: number;
  itemDiscountTotal: number;
  saleDiscountValue: number;
  total: number;
  paid: number;
  change: number;
}
